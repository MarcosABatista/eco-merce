// test/unit/consultaProdutos.spec.ts — Specs do schema de consulta de produtos da vitrine.
// Garante a validação da borda do BFF: page>=0, size 1..50, categoria no enum fixo, com os
// defaults da spec. Ambiente node (projeto unit do Vitest).

import { describe, it, expect } from 'vitest'
import { consultaProdutosSchema } from '../../shared/schemas/consultaProdutos'

describe('consultaProdutosSchema', () => {
  it('aplica os defaults (page 0, size 20) quando ausentes', () => {
    const r = consultaProdutosSchema.safeParse({})
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.page).toBe(0)
      expect(r.data.size).toBe(20)
    }
  })

  it('aceita categoria válida do enum', () => {
    const r = consultaProdutosSchema.safeParse({ categoria: 'VESTUARIO' })
    expect(r.success).toBe(true)
  })

  it('rejeita categoria fora do enum', () => {
    const r = consultaProdutosSchema.safeParse({ categoria: 'INEXISTENTE' })
    expect(r.success).toBe(false)
  })

  it('rejeita page negativa', () => {
    const r = consultaProdutosSchema.safeParse({ page: -1 })
    expect(r.success).toBe(false)
  })

  it('rejeita size acima do teto 50', () => {
    const r = consultaProdutosSchema.safeParse({ size: 51 })
    expect(r.success).toBe(false)
  })

  it('rejeita size zero', () => {
    const r = consultaProdutosSchema.safeParse({ size: 0 })
    expect(r.success).toBe(false)
  })
})
