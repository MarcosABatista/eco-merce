import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fc from 'fast-check'
import { useProductStore } from '@/stores/useProductStore'
import type { Produto, Categoria } from '@/types/produto'

/**
 * Feature: marketplace-vitrine
 * Property 1: Search filter correctness
 * Validates: Requirements 2.3, 2.5
 */

const categorias: Categoria[] = ['VESTUARIO', 'ELETRODOMESTICOS', 'ACESSORIOS', 'SUPLEMENTOS']

function buildProduto(overrides: Partial<Produto> = {}): Produto {
  return {
    id: 1,
    nome: 'Produto Teste',
    descricao: null,
    preco: 99.9,
    precoDesconto: null,
    percentualDesconto: null,
    categoria: 'VESTUARIO',
    urlImagem: null,
    ativo: true,
    nomeLoja: null,
    telefone: null,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
    ...overrides,
  }
}

const produtoArb = fc.record({
  id: fc.nat(),
  nome: fc.string({ minLength: 1, maxLength: 100 }),
  descricao: fc.option(fc.string(), { nil: null }),
  preco: fc.double({ min: 0.01, max: 99999, noNaN: true }),
  precoDesconto: fc.option(fc.double({ min: 0.01, max: 99999, noNaN: true }), { nil: null }),
  percentualDesconto: fc.option(fc.integer({ min: 1, max: 99 }), { nil: null }),
  categoria: fc.constantFrom(...categorias),
  urlImagem: fc.option(fc.string(), { nil: null }),
  ativo: fc.boolean(),
  nomeLoja: fc.option(fc.string(), { nil: null }),
  telefone: fc.option(fc.string(), { nil: null }),
  createdAt: fc.constant('2024-01-01T00:00:00'),
  updatedAt: fc.constant('2024-01-01T00:00:00'),
}) as fc.Arbitrary<Produto>

describe('Property 1: Search filter correctness', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('filtered results contain only products whose nome includes the search string (case-insensitive)', () => {
    fc.assert(
      fc.property(
        fc.array(produtoArb, { minLength: 0, maxLength: 30 }),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        (products, searchQuery) => {
          const store = useProductStore()
          store.products = products
          store.setSearchQuery(searchQuery)

          const filtered = store.filteredProducts
          const query = searchQuery.toLowerCase()

          // Every product in filtered results must have nome containing the query (case-insensitive)
          for (const product of filtered) {
            expect(product.nome.toLowerCase()).toContain(query)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('every matching product from the original list appears in filtered results (completeness)', () => {
    fc.assert(
      fc.property(
        fc.array(produtoArb, { minLength: 0, maxLength: 30 }),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        (products, searchQuery) => {
          const store = useProductStore()
          store.products = products
          store.setSearchQuery(searchQuery)

          const filtered = store.filteredProducts
          const query = searchQuery.toLowerCase()

          // Every product in the original list whose nome contains query must appear in filtered results
          const expectedMatches = products.filter(p =>
            p.nome.toLowerCase().includes(query),
          )

          expect(filtered.length).toBe(expectedMatches.length)

          for (const expected of expectedMatches) {
            expect(filtered).toContainEqual(expected)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('when searchQuery is empty, returns all products', () => {
    fc.assert(
      fc.property(
        fc.array(produtoArb, { minLength: 0, maxLength: 30 }),
        (products) => {
          const store = useProductStore()
          store.products = products
          store.setSearchQuery('')

          expect(store.filteredProducts).toEqual(products)
        },
      ),
      { numRuns: 100 },
    )
  })
})
