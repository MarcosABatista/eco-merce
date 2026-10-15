// test/unit/produtoSchema.spec.ts — Specs dos refinamentos de preço/desconto do produtoSchema.
// Garante a borda mais estrita que o Java (MEDIUM-2): preco > 0; precoDesconto, quando informado,
// > 0 E < preco. Caso válido passa. Ambiente node (projeto unit do Vitest).

import { describe, it, expect } from 'vitest'
import { produtoSchema } from '../../shared/schemas/produto'

// Base válida reutilizada; cada teste sobrescreve o que precisa variar.
function base(sobrescritas: Record<string, unknown> = {}) {
  return {
    nome: 'Camiseta',
    descricao: 'Algodão',
    preco: 100,
    precoDesconto: 80,
    categoria: 'VESTUARIO',
    urlImagem: null,
    _token: 'token-valido',
    ...sobrescritas,
  }
}

describe('produtoSchema — preço e desconto', () => {
  it('aceita um produto válido (desconto menor que o preço)', () => {
    const r = produtoSchema.safeParse(base())
    expect(r.success).toBe(true)
  })

  it('aceita precoDesconto nulo (produto sem desconto)', () => {
    const r = produtoSchema.safeParse(base({ precoDesconto: null }))
    expect(r.success).toBe(true)
  })

  it('rejeita preço igual a zero', () => {
    const r = produtoSchema.safeParse(base({ preco: 0 }))
    expect(r.success).toBe(false)
  })

  it('rejeita preço negativo', () => {
    const r = produtoSchema.safeParse(base({ preco: -1 }))
    expect(r.success).toBe(false)
  })

  it('rejeita precoDesconto igual a zero', () => {
    const r = produtoSchema.safeParse(base({ precoDesconto: 0 }))
    expect(r.success).toBe(false)
  })

  it('rejeita precoDesconto negativo', () => {
    const r = produtoSchema.safeParse(base({ precoDesconto: -5 }))
    expect(r.success).toBe(false)
  })

  it('rejeita precoDesconto igual ao preço', () => {
    const r = produtoSchema.safeParse(base({ preco: 100, precoDesconto: 100 }))
    expect(r.success).toBe(false)
  })

  it('rejeita precoDesconto maior que o preço', () => {
    const r = produtoSchema.safeParse(base({ preco: 100, precoDesconto: 150 }))
    expect(r.success).toBe(false)
  })

  it('aponta o erro de desconto >= preço no campo precoDesconto', () => {
    const r = produtoSchema.safeParse(base({ preco: 100, precoDesconto: 100 }))
    expect(r.success).toBe(false)
    if (!r.success) {
      const caminhos = r.error.issues.map(i => i.path.join('.'))
      expect(caminhos).toContain('precoDesconto')
    }
  })
})
