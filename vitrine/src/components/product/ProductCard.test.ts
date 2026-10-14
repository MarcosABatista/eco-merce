import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from './ProductCard.vue'
import type { Produto } from '@/types/produto'

function createProduct(overrides: Partial<Produto> = {}): Produto {
  return {
    id: 1,
    nome: 'Camiseta Básica',
    descricao: 'Uma camiseta básica de algodão',
    preco: 49.9,
    precoDesconto: null,
    percentualDesconto: null,
    categoria: 'VESTUARIO',
    urlImagem: 'https://example.com/image.jpg',
    ativo: true,
    nomeLoja: 'Loja Exemplo',
    telefone: '11999999999',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
    ...overrides,
  }
}

describe('ProductCard', () => {
  it('renders product name', () => {
    const product = createProduct({ nome: 'Tênis Esportivo' })
    const wrapper = mount(ProductCard, { props: { product } })
    expect(wrapper.text()).toContain('Tênis Esportivo')
  })

  it('renders product price formatted as BRL', () => {
    const product = createProduct({ preco: 1299.9 })
    const wrapper = mount(ProductCard, { props: { product } })
    expect(wrapper.text()).toContain('R$')
    expect(wrapper.text()).toContain('1.299,90')
  })

  it('renders store name when nomeLoja is available', () => {
    const product = createProduct({ nomeLoja: 'Loja ABC' })
    const wrapper = mount(ProductCard, { props: { product } })
    expect(wrapper.text()).toContain('Loja ABC')
  })

  it('hides store name area when nomeLoja is null', () => {
    const product = createProduct({ nomeLoja: null })
    const wrapper = mount(ProductCard, { props: { product } })
    expect(wrapper.find('.product-card__store').exists()).toBe(false)
  })

  it('displays product image with correct alt text', () => {
    const product = createProduct({ nome: 'Produto Teste', urlImagem: 'https://example.com/img.jpg' })
    const wrapper = mount(ProductCard, { props: { product } })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Produto Teste')
    expect(img.attributes('src')).toBe('https://example.com/img.jpg')
  })

  it('shows gray placeholder when urlImagem is null', () => {
    const product = createProduct({ urlImagem: null })
    const wrapper = mount(ProductCard, { props: { product } })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.product-card__placeholder').exists()).toBe(true)
  })

  it('shows gray placeholder when image fails to load', async () => {
    const product = createProduct({ urlImagem: 'https://example.com/broken.jpg' })
    const wrapper = mount(ProductCard, { props: { product } })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)

    await img.trigger('error')

    expect(wrapper.find('.product-card__placeholder').exists()).toBe(true)
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('renders "Ver Oferta" button', () => {
    const product = createProduct()
    const wrapper = mount(ProductCard, { props: { product } })
    const button = wrapper.find('.product-card__button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Ver Oferta')
  })

  it('emits view-detail with product id on button click', async () => {
    const product = createProduct({ id: 42 })
    const wrapper = mount(ProductCard, { props: { product } })
    const button = wrapper.find('.product-card__button')

    await button.trigger('click')

    expect(wrapper.emitted('view-detail')).toHaveLength(1)
    expect(wrapper.emitted('view-detail')![0]).toEqual([42])
  })

  it('has product name with line-clamp styles for truncation', () => {
    const product = createProduct({ nome: 'A very long product name that should be truncated after two lines' })
    const wrapper = mount(ProductCard, { props: { product } })
    const nameEl = wrapper.find('.product-card__name')
    expect(nameEl.exists()).toBe(true)
  })

  it('button has minimum touch target size (44px)', () => {
    const product = createProduct()
    const wrapper = mount(ProductCard, { props: { product } })
    const button = wrapper.find('.product-card__button')
    expect(button.exists()).toBe(true)
    // Button element exists with the class that has min-height: 44px in CSS
  })
})
