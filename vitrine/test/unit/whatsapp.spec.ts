// test/unit/whatsapp.spec.ts — Property/unit tests da normalização WhatsApp (RF-VIT-9 regra canônica).
// Trava a ordem dos passos e o limite superior: strip de não-dígitos; "0" inicial removido ANTES de
// checar "55" (caso-âncora "05511999998888"); "55"+12/13 as-is; 10/11 -> prefixa "55"; >11 sem DDI
// -> null (botão oculto). Limites derivados de #shared, nunca hardcodados. Ambiente node.

import { describe, expect, it } from 'vitest'
import fc from 'fast-check'
import { formatarNumeroWhatsapp, montarUrlWhatsapp } from '../../app/utils/whatsapp'
import {
  WHATSAPP_DDI,
  WHATSAPP_MAX_DIGITOS_LOCAL,
  WHATSAPP_MENSAGEM_PREFIXO,
  WHATSAPP_MIN_DIGITOS_LOCAL,
} from '../../shared/constants/whatsapp'

describe('formatarNumeroWhatsapp — casos canônicos', () => {
  it('prefixa "55" em número local de 11 dígitos (DDD + 9)', () => {
    expect(formatarNumeroWhatsapp('11999998888')).toBe('5511999998888')
  })

  it('prefixa "55" em número local de 10 dígitos (fixo)', () => {
    expect(formatarNumeroWhatsapp('1133334444')).toBe('551133334444')
  })

  it('usa "55"+13 dígitos como está (não reaplica o DDI)', () => {
    expect(formatarNumeroWhatsapp('5511999998888')).toBe('5511999998888')
  })

  it('usa "55"+12 dígitos como está', () => {
    expect(formatarNumeroWhatsapp('551133334444')).toBe('551133334444')
  })

  it('ignora máscara (parênteses, traço, espaço)', () => {
    expect(formatarNumeroWhatsapp('(11) 99999-8888')).toBe('5511999998888')
  })

  it('CASO-ÂNCORA: remove o "0" inicial ANTES de checar "55" ("05511999998888")', () => {
    // "05511999998888" -> strip 0 -> "5511999998888" (13 dígitos iniciando com 55) -> as-is.
    expect(formatarNumeroWhatsapp('05511999998888')).toBe('5511999998888')
  })

  it('retorna null para telefone nulo/indefinido/vazio', () => {
    expect(formatarNumeroWhatsapp(null)).toBeNull()
    expect(formatarNumeroWhatsapp(undefined)).toBeNull()
    expect(formatarNumeroWhatsapp('')).toBeNull()
    expect(formatarNumeroWhatsapp('abc')).toBeNull()
  })

  it('retorna null para menos de 10 dígitos (sem DDI)', () => {
    expect(formatarNumeroWhatsapp('999998888')).toBeNull() // 9 dígitos
  })
})

describe('formatarNumeroWhatsapp — property: limite superior travado (HIGH-4)', () => {
  // Gera uma string só de dígitos com comprimento n.
  const digitosDeComprimento = (n: number) =>
    fc.array(fc.integer({ min: 0, max: 9 }), { minLength: n, maxLength: n })
      .map(ds => ds.join(''))

  it('> MAX_LOCAL dígitos (sem DDI, sem "0"/"55" inicial) -> null (botão oculto)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: WHATSAPP_MAX_DIGITOS_LOCAL + 1, max: 20 }),
        (comprimento) => {
          return fc.assert(
            fc.property(digitosDeComprimento(comprimento), (ds) => {
              // Evita que o primeiro dígito seja "0" (seria removido) ou que inicie com "55"
              // dentro da faixa 12/13 (ramo as-is), isolando o caso "excesso sem DDI".
              fc.pre(!ds.startsWith('0') && !ds.startsWith(WHATSAPP_DDI))
              expect(formatarNumeroWhatsapp(ds)).toBeNull()
            }),
            { numRuns: 20 },
          )
        },
      ),
    )
  })

  it('10/11 dígitos locais sempre resultam em "55"+entrada', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: WHATSAPP_MIN_DIGITOS_LOCAL, max: WHATSAPP_MAX_DIGITOS_LOCAL }),
        (comprimento) => {
          return fc.assert(
            fc.property(digitosDeComprimento(comprimento), (ds) => {
              fc.pre(!ds.startsWith('0') && !ds.startsWith(WHATSAPP_DDI))
              expect(formatarNumeroWhatsapp(ds)).toBe(WHATSAPP_DDI + ds)
            }),
            { numRuns: 20 },
          )
        },
      ),
    )
  })

  it('o strip de não-dígitos nunca deixa caracteres não numéricos no resultado', () => {
    fc.assert(
      fc.property(fc.string(), (entrada) => {
        const saida = formatarNumeroWhatsapp(entrada)
        if (saida !== null) {
          expect(/^\d+$/.test(saida)).toBe(true)
        }
      }),
    )
  })
})

describe('montarUrlWhatsapp', () => {
  it('monta wa.me com mensagem encodeURIComponent', () => {
    const url = montarUrlWhatsapp('11999998888', 'Tênis de Corrida')
    expect(url).toBe(
      `https://wa.me/5511999998888?text=${encodeURIComponent(WHATSAPP_MENSAGEM_PREFIXO + 'Tênis de Corrida')}`,
    )
  })

  it('retorna null (botão oculto) quando o telefone é inválido', () => {
    expect(montarUrlWhatsapp('123', 'Produto')).toBeNull()
  })

  it('tolera nome de produto nulo (mensagem com prefixo apenas)', () => {
    const url = montarUrlWhatsapp('11999998888', null)
    expect(url).toContain(encodeURIComponent(WHATSAPP_MENSAGEM_PREFIXO))
  })
})
