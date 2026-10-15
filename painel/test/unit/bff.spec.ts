// test/unit/bff.spec.ts — Testes unitários do BFF do painel (erro, proxy, CSRF, autorização, upload).
// Expõe os auto-imports do Nitro (createError, useRuntimeConfig, $fetch) no globalThis antes de
// importar os server/utils, já que o ambiente node não tem o runtime Nuxt. Cobre mapearErroJava,
// proxy de imagem, csrf, exigirProdutoDoDono (dono/outro/admin) e a validação de upload por magic.

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { gerarTokenCsrf, validarTokenCsrf } from '../../server/utils/csrf'
import { chamarJava, mapearErroJava } from '../../server/utils/clienteJava'

// Fonte da chave usada pelos utils via useRuntimeConfig (mock).
const CHAVE = 'chave-de-teste-para-hmac-csrf-0000000000'

// Stub de createError (auto-import do Nitro) para o ambiente node.
function createErrorStub(opcoes: { statusCode?: number, statusMessage?: string, data?: unknown }) {
  return Object.assign(new Error(opcoes.statusMessage ?? 'erro'), opcoes)
}

// Mock de $fetch controlável por teste (usado por chamarJava/exigirProdutoDoDono).
const fetchMock = vi.fn()

beforeAll(() => {
  const g = globalThis as Record<string, unknown>
  g.createError = createErrorStub
  g.useRuntimeConfig = () => ({ apiBaseUrl: 'http://java.local/api/v1', encryptionKey: CHAVE })
  g.$fetch = fetchMock
  // chamarJava/mapearErroJava são auto-imports do Nitro usados por autorizacao.ts.
  g.chamarJava = chamarJava
  g.mapearErroJava = mapearErroJava
})

beforeEach(() => {
  fetchMock.mockReset()
})

describe('mapearErroJava', () => {
  it('mapeia 409 com message contendo "email" para fieldErrors no campo email (sem valor bruto)', async () => {
    const { mapearErroJava } = await import('../../server/utils/clienteJava')
    const erro = mapearErroJava({
      statusCode: 409,
      data: { message: 'Já existe um registro com email: fulano@exemplo.com' },
    }) as { statusCode: number, data: { fieldErrors: Array<{ field: string, message: string }> } }
    expect(erro.statusCode).toBe(409)
    expect(erro.data.fieldErrors[0]?.field).toBe('email')
    expect(erro.data.fieldErrors[0]?.message).not.toContain('fulano@exemplo.com')
  })

  it('mapeia 409 com message contendo "cpfCnpj" para fieldErrors no campo cpfCnpj', async () => {
    const { mapearErroJava } = await import('../../server/utils/clienteJava')
    const erro = mapearErroJava({
      statusCode: 409,
      data: { message: 'Já existe um registro com cpfCnpj: 12345678901' },
    }) as { statusCode: number, data: { fieldErrors: Array<{ field: string }> } }
    expect(erro.data.fieldErrors[0]?.field).toBe('cpfCnpj')
  })

  it('mapeia 409 sem campo reconhecível para 409 genérico', async () => {
    const { mapearErroJava } = await import('../../server/utils/clienteJava')
    const erro = mapearErroJava({ statusCode: 409, data: { message: 'conflito qualquer' } }) as { statusCode: number }
    expect(erro.statusCode).toBe(409)
  })

  it('mapeia 404 para 404 e 5xx para 502', async () => {
    const { mapearErroJava } = await import('../../server/utils/clienteJava')
    expect((mapearErroJava({ statusCode: 404 }) as { statusCode: number }).statusCode).toBe(404)
    expect((mapearErroJava({ statusCode: 503 }) as { statusCode: number }).statusCode).toBe(502)
  })
})

describe('proxy de imagens', () => {
  it('rejeita svg/gif/traversal/segmento extra com erro e aceita 2 segmentos jpg/png', async () => {
    const { validarCaminhoImagem, tipoConteudoImagem } = await import('../../server/utils/imagemProxy')
    for (const ruim of ['x.svg', '1-x/u.svg', '1-x/u.gif', '../y.jpg', '1-x/sub/u.jpg', '1-x//u.jpg']) {
      expect(() => validarCaminhoImagem(ruim)).toThrow()
    }
    expect(validarCaminhoImagem('1-cacau/3f2a9c7e-0000-4000-8000-0000000000b1.jpeg'))
      .toBe('1-cacau/3f2a9c7e-0000-4000-8000-0000000000b1.jpeg')
    expect(tipoConteudoImagem('1-x/u.png')).toBe('image/png')
  })
})

describe('csrf', () => {
  it('valida token recém-gerado', () => {
    expect(validarTokenCsrf(gerarTokenCsrf(CHAVE), CHAVE)).toBe(true)
  })

  it('rejeita token ausente, adulterado e expirado', () => {
    expect(validarTokenCsrf(undefined, CHAVE)).toBe(false)
    const token = gerarTokenCsrf(CHAVE)
    expect(validarTokenCsrf(token + 'a', CHAVE)).toBe(false)
    // Token com timestamp de 11 minutos atrás (acima do TTL de 10 min).
    const antigo = Date.now() - 11 * 60 * 1000
    const falso = `${antigo}.0000000000000000000000000000000000000000000000000000000000000000`
    expect(validarTokenCsrf(falso, CHAVE)).toBe(false)
  })
})

describe('exigirProdutoDoDono', () => {
  const base = { nome: 'x', descricao: null, preco: 1, precoDesconto: null, percentualDesconto: null, categoria: 'VESTUARIO' as const, urlImagem: null, ativo: true, nomeLoja: null, telefone: null, createdAt: '', updatedAt: '' }
  const sessaoDono = { id: 7, nome: 'A', email: 'a@a', nomeLoja: null, admin: false, ativo: true, imagemLoja: null }
  const sessaoAdmin = { ...sessaoDono, id: 99, admin: true }
  const evento = {} as never

  it('retorna true quando o produto está no conjunto do dono', async () => {
    const { exigirProdutoDoDono } = await import('../../server/utils/autorizacao')
    fetchMock.mockResolvedValueOnce({ content: [{ ...base, id: 42 }], totalElements: 1, totalPages: 1, page: 0, size: 50 })
    expect(await exigirProdutoDoDono(evento, sessaoDono, 42)).toBe(true)
  })

  it('retorna false quando o id não pertence ao dono (esgota as páginas)', async () => {
    const { exigirProdutoDoDono } = await import('../../server/utils/autorizacao')
    fetchMock.mockResolvedValueOnce({ content: [{ ...base, id: 1 }], totalElements: 1, totalPages: 1, page: 0, size: 50 })
    expect(await exigirProdutoDoDono(evento, sessaoDono, 42)).toBe(false)
  })

  it('retorna true para admin sem paginar (não chama o Java)', async () => {
    const { exigirProdutoDoDono } = await import('../../server/utils/autorizacao')
    expect(await exigirProdutoDoDono(evento, sessaoAdmin, 42)).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('upload — validarImagemUpload', () => {
  it('rejeita conteúdo sem magic number válido', async () => {
    const { validarImagemUpload } = await import('../../server/utils/upload')
    expect(() => validarImagemUpload(new Uint8Array([0x00, 0x01, 0x02, 0x03]))).toThrow()
  })

  it('deriva filename sintético e tipo do magic JPEG', async () => {
    const { validarImagemUpload } = await import('../../server/utils/upload')
    const r = validarImagemUpload(new Uint8Array([0xFF, 0xD8, 0xFF, 0x00]))
    expect(r.tipo).toBe('image/jpeg')
    expect(r.filename).toBe('imagem.jpg')
  })

  it('deriva filename sintético e tipo do magic PNG', async () => {
    const { validarImagemUpload } = await import('../../server/utils/upload')
    const r = validarImagemUpload(new Uint8Array([0x89, 0x50, 0x4E, 0x47]))
    expect(r.tipo).toBe('image/png')
    expect(r.filename).toBe('imagem.png')
  })
})
