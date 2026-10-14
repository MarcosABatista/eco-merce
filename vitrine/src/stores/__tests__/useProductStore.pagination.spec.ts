import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import * as fc from 'fast-check'
import { useProductStore } from '../useProductStore'
import type { Produto, Categoria } from '@/types/produto'

/**
 * Feature: marketplace-vitrine, Property 5: Pagination appends without data loss
 *
 * For any current product list and for any new page of products fetched via
 * "Carregar mais", the resulting list shall contain all previously loaded products
 * in their original order followed by the new products appended at the end,
 * and the total length shall equal the sum of the previous list length plus the
 * new page length.
 *
 * **Validates: Requirements 8.2**
 */

const CATEGORIAS: Categoria[] = ['VESTUARIO', 'ELETRODOMESTICOS', 'ACESSORIOS', 'SUPLEMENTOS']

const arbProduto = (idOffset: number) =>
  fc.record({
    id: fc.constant(idOffset),
    nome: fc.string({ minLength: 1, maxLength: 100 }),
    descricao: fc.option(fc.string({ maxLength: 200 }), { nil: null }),
    preco: fc.integer({ min: 1, max: 9999900 }).map((v) => v / 100),
    categoria: fc.constantFrom(...CATEGORIAS),
    urlImagem: fc.option(fc.webUrl(), { nil: null }),
    ativo: fc.constant(true),
    nomeLoja: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
    telefone: fc.option(fc.string({ minLength: 8, maxLength: 15 }), { nil: null }),
    createdAt: fc.constant('2024-01-01T00:00:00'),
    updatedAt: fc.constant('2024-01-01T00:00:00'),
  }) as fc.Arbitrary<Produto>

function arbProdutoList(minLength: number, maxLength: number): fc.Arbitrary<Produto[]> {
  return fc.integer({ min: minLength, max: maxLength }).chain((len) => {
    if (len === 0) return fc.constant([])
    const arbs = Array.from({ length: len }, (_, i) => arbProduto(i + 1))
    return fc.tuple(...(arbs as [fc.Arbitrary<Produto>, ...fc.Arbitrary<Produto>[]])).map(
      (products) => products.map((p, idx) => ({ ...p, id: idx + 1 }))
    )
  })
}

vi.mock('@/services/produtoService', () => ({
  produtoService: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}))

describe('Property 5: Pagination appends without data loss', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('appending a new page preserves all previous products in order and appends new products', async () => {
    const { produtoService } = await import('@/services/produtoService')

    await fc.assert(
      fc.asyncProperty(
        arbProdutoList(0, 20),
        arbProdutoList(0, 20),
        async (initialProducts, newPageProducts) => {
          // Reset pinia for each run
          setActivePinia(createPinia())
          const store = useProductStore()

          // Assign unique IDs to avoid collisions
          const initial = initialProducts.map((p, i) => ({ ...p, id: i + 1 }))
          const newPage = newPageProducts.map((p, i) => ({
            ...p,
            id: initial.length + i + 1,
          }))

          // Mock first call: return initial products
          vi.mocked(produtoService.findAll).mockResolvedValueOnce({
            content: initial,
            totalElements: initial.length + newPage.length,
            totalPages: 2,
            page: 0,
            size: 20,
          })

          // Fetch initial products
          await store.fetchProducts()

          // Verify initial load
          expect(store.products).toHaveLength(initial.length)

          // Mock second call: return new page products
          vi.mocked(produtoService.findAll).mockResolvedValueOnce({
            content: newPage,
            totalElements: initial.length + newPage.length,
            totalPages: 2,
            page: 1,
            size: 20,
          })

          // Fetch next page with append
          await store.fetchProducts({ append: true })

          // Property 1: Total length equals sum of previous + new
          expect(store.products).toHaveLength(initial.length + newPage.length)

          // Property 2: All previous products appear in order at the beginning
          for (let i = 0; i < initial.length; i++) {
            expect(store.products[i].id).toBe(initial[i].id)
            expect(store.products[i].nome).toBe(initial[i].nome)
          }

          // Property 3: New products appear after previous ones
          for (let i = 0; i < newPage.length; i++) {
            expect(store.products[initial.length + i].id).toBe(newPage[i].id)
            expect(store.products[initial.length + i].nome).toBe(newPage[i].nome)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
