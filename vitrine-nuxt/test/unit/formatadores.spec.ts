// test/unit/formatadores.spec.ts — Property tests dos formatadores puros da vitrine.
// Trava as invariantes de formatarPreco (moeda BRL pt-BR: prefixo "R$", vírgula decimal) e
// truncarTexto (<= max inalterado; > max -> max+1 chars terminando em reticência). Ambiente node.

import { describe, expect, it } from 'vitest'
import fc from 'fast-check'
import { formatarPreco, truncarTexto } from '../../app/utils/formatadores'

describe('formatarPreco', () => {
  it('formata um valor conhecido como BRL pt-BR', () => {
    expect(formatarPreco(1234.5)).toBe('R$\u00A01.234,50')
  })

  it('sempre produz prefixo "R$" e vírgula como separador decimal', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 9_999_999.99, noNaN: true, noDefaultInfinity: true }),
        (valor) => {
          const saida = formatarPreco(valor)
          // Prefixo monetário R$ (NBSP é inserido pelo Intl entre símbolo e número).
          expect(saida.startsWith('R$')).toBe(true)
          // Duas casas decimais separadas por vírgula.
          expect(/,\d{2}$/.test(saida)).toBe(true)
          // Nunca usa ponto como separador decimal (ponto é só o de milhar).
          expect(saida.includes(',')).toBe(true)
        },
      ),
    )
  })
})

describe('truncarTexto', () => {
  const RETICENCIA = '\u2026'

  it('mantém textos de tamanho <= max inalterados (ex.: 60)', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 60 }), (texto) => {
        expect(truncarTexto(texto, 60)).toBe(texto)
      }),
    )
  })

  it('trunca textos > max para max chars + reticência (61 no total p/ max 60)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 61, maxLength: 200 }),
        (texto) => {
          const saida = truncarTexto(texto, 60)
          expect(saida.length).toBe(61)
          expect(saida.endsWith(RETICENCIA)).toBe(true)
          expect(saida.slice(0, 60)).toBe(texto.slice(0, 60))
        },
      ),
    )
  })

  it('limite exato: tamanho == max permanece inalterado (sem reticência)', () => {
    const texto = 'a'.repeat(60)
    expect(truncarTexto(texto, 60)).toBe(texto)
  })
})
