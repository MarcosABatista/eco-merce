// test/unit/formularioProduto.spec.ts — Cobre o acceptance da FEAT-004 para o FormularioProduto.
// Ambiente node (projeto unit): valida que o schema isomórfico usado pelo formulário bloqueia o
// submit quando precoDesconto >= preco, e, por análise estática do .vue (os componentes de form
// do Nuxt UI são frágeis sob happy-dom — design §11/steering testing #4), confirma que o 409
// (fieldErrors) é mapeado por campo via setErrors e que o UForm valida pelo schema.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { produtoSchema, atualizacaoProdutoSchema } from '../../shared/schemas/produto'

// Fonte do componente para análise estática (evita montar UForm/UFileUpload sob happy-dom).
const FONTE_FORMULARIO = readFileSync(
  fileURLToPath(new URL('../../app/components/painel/FormularioProduto.vue', import.meta.url)),
  'utf8',
)

// Base válida de produto para o schema (sem _token separado por teste).
function base(sobrescritas: Record<string, unknown> = {}) {
  return {
    nome: 'Camiseta',
    descricao: 'Algodão',
    preco: 100,
    precoDesconto: 80,
    categoria: 'VESTUARIO',
    urlImagem: null,
    _token: 'token-de-teste',
    ...sobrescritas,
  }
}

describe('FormularioProduto — bloqueio de submit por precoDesconto', () => {
  it('o schema de criação bloqueia precoDesconto igual ao preço (submit não passa)', () => {
    expect(produtoSchema.safeParse(base({ preco: 100, precoDesconto: 100 })).success).toBe(false)
  })

  it('o schema de criação bloqueia precoDesconto maior que o preço', () => {
    expect(produtoSchema.safeParse(base({ preco: 100, precoDesconto: 150 })).success).toBe(false)
  })

  it('o schema de edição (com ativo) também bloqueia precoDesconto >= preço', () => {
    const r = atualizacaoProdutoSchema.safeParse(base({ preco: 100, precoDesconto: 100, ativo: true }))
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues.map(i => i.path.join('.'))).toContain('precoDesconto')
    }
  })

  it('aceita precoDesconto < preço (submit passa)', () => {
    expect(produtoSchema.safeParse(base({ preco: 100, precoDesconto: 80 })).success).toBe(true)
  })
})

describe('FormularioProduto — contrato do componente (análise estática)', () => {
  it('valida o UForm pelo produtoSchema/atualizacaoProdutoSchema', () => {
    expect(FONTE_FORMULARIO).toContain('produtoSchema')
    expect(FONTE_FORMULARIO).toContain('atualizacaoProdutoSchema')
    expect(FONTE_FORMULARIO).toMatch(/:schema="schema"/)
  })

  it('mapeia os fieldErrors do BFF (incl. 409) por campo via setErrors', () => {
    // Converte { field, message } (contrato do BFF) em { name, message } (FormError do Nuxt UI).
    expect(FONTE_FORMULARIO).toMatch(/setErrors\(/)
    expect(FONTE_FORMULARIO).toMatch(/name:\s*e\.field/)
    expect(FONTE_FORMULARIO).toMatch(/message:\s*e\.message/)
    expect(FONTE_FORMULARIO).toContain('aplicarErrosDeCampo')
  })
})
