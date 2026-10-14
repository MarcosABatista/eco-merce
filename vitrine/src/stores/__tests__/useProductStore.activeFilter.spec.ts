import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fc from 'fast-check'
import { useProductStore } from '@/stores/useProductStore'
import type { Produto, Categoria } from '@/types/produto'
import type { PageResponse } from '@/types/api'

// Feature: marketplace-vitrine, Property 3: Active product filtering
// **Validates: Requirements 5.3**

vi.mock('@/services/produtoService', () => ({
  produtoService: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}))

import { produtoService } from '@/services/produtoService'

const categorias: Categoria[] = ['VESTUARIO', 'ELETRODOMESTICOS', 'ACESSORIOS', 'SUPLEMENTOS']

const arbProduto = (ativoOverride?: boolean) =>
  fc.record({
    id: fc.nat({ max: 100000 }),
    nome: fc.string({ minLength: 1, maxLength: 100 }),
    descricao: fc.option(fc.string({ maxLength: 200 }), { nil: null }),
    preco: fc.double({ min: 0.01, max: 99999.99, noNaN: true }),
    categoria: fc.constantFrom(...categorias),
    urlImagem: fc.option(fc.webUrl(), { nil: null }),
    ativo: ativoOverride !== undefined ? fc.constant(ativoOverride) : fc.boolean(),
    nomeLoja: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
    telefone: fc.option(fc.string({ minLength: 8, maxLength: 15 }), { nil: null }),
    createdAt: fc.constant('2024-01-01T00:00:00'),
    updatedAt: fc.constant('2024-01-01T00:00:00'),
  }) as fc.Arbitrary<Produto>

const arbProductList = fc.array(arbProduto(), { minLength: 0, maxLength: 50 })

describe('useProductStore - Active product filtering (Property 3)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should expose only products where ativo === true', async () => {
    await fc.assert(
      fc.asyncProperty(arbProductList, async (products) => {
        setActivePinia(createPinia())

        const mockResponse: PageResponse<Produto> = {
          content: products,
          totalElements: products.length,
          totalPages: 1,
          page: 0,
          size: 20,
        }

        vi.mocked(produtoService.findAll).mockResolvedValue(mockResponse)

        const store = useProductStore()
        await store.fetchProducts()

        // Every product in store.products must have ativo === true
        for (const product of store.products) {
          expect(product.ativo).toBe(true)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('should have products count equal to the count of ativo === true in the original response', async () => {
    await fc.assert(
      fc.asyncProperty(arbProductList, async (products) => {
        setActivePinia(createPinia())

        const mockResponse: PageResponse<Produto> = {
          content: products,
          totalElements: products.length,
          totalPages: 1,
          page: 0,
          size: 20,
        }

        vi.mocked(produtoService.findAll).mockResolvedValue(mockResponse)

        const store = useProductStore()
        await store.fetchProducts()

        const expectedCount = products.filter(p => p.ativo === true).length
        expect(store.products.length).toBe(expectedCount)
      }),
      { numRuns: 100 }
    )
  })
})
