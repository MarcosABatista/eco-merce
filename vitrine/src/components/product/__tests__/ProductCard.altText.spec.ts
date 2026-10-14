import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import fc from 'fast-check'
import ProductCard from '@/components/product/ProductCard.vue'
import type { Produto, Categoria } from '@/types/produto'

/**
 * Feature: marketplace-vitrine
 * Property 7: Product image alt text
 * Validates: Requirements 11.3
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
    urlImagem: 'https://example.com/image.png',
    ativo: true,
    nomeLoja: 'Loja Teste',
    telefone: null,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
    ...overrides,
  }
}

describe('Property 7: Product image alt text', () => {
  it('rendered product card image has alt attribute equal to product nome', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.webUrl(),
        (nome, urlImagem) => {
          const product = buildProduto({ nome, urlImagem })

          const wrapper = mount(ProductCard, {
            props: { product },
          })

          const img = wrapper.find('img')
          expect(img.exists()).toBe(true)
          expect(img.attributes('alt')).toBe(nome)

          wrapper.unmount()
        },
      ),
      { numRuns: 100 },
    )
  })
})
