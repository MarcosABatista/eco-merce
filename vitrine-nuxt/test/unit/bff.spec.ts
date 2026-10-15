// test/unit/bff.spec.ts — Testes unitários do BFF da vitrine (mapeamento de erro + proxy de imagem).
// Expõe os auto-imports do Nitro (createError) no globalThis antes de importar os server/utils, já
// que o ambiente node não tem o runtime Nuxt. Cobre mapearErroJava (400/404/5xx->502) e a
// validação/política do proxy de imagens (whitelist, traversal, Content-Type forçado).

import { beforeAll, describe, expect, it } from 'vitest'

// Stub de createError (auto-import do Nitro) para o ambiente node: produz um objeto de erro com
// statusCode/statusMessage/data, suficiente para asserir o mapeamento sem o runtime h3.
function createErrorStub(opcoes: { statusCode?: number, statusMessage?: string, data?: unknown }) {
  return Object.assign(new Error(opcoes.statusMessage ?? 'erro'), opcoes)
}

beforeAll(() => {
  // Auto-imports do Nitro usados pelos server/utils (ausentes em ambiente node puro).
  ;(globalThis as Record<string, unknown>).createError = createErrorStub
})

describe('mapearErroJava', () => {
  it('mapeia 400 do Java para 400 "Dados inválidos"', async () => {
    const { mapearErroJava } = await import('../../server/utils/clienteJava')
    const erro = mapearErroJava({ statusCode: 400 }) as { statusCode: number, statusMessage: string }
    expect(erro.statusCode).toBe(400)
    expect(erro.statusMessage).toBe('Dados inválidos')
  })

  it('mapeia 404 do Java para 404', async () => {
    const { mapearErroJava } = await import('../../server/utils/clienteJava')
    const erro = mapearErroJava({ statusCode: 404 }) as { statusCode: number }
    expect(erro.statusCode).toBe(404)
  })

  it('mapeia 5xx do Java para 502', async () => {
    const { mapearErroJava } = await import('../../server/utils/clienteJava')
    const erro = mapearErroJava({ statusCode: 500 }) as { statusCode: number }
    expect(erro.statusCode).toBe(502)
  })

  it('mapeia erro de rede/timeout (sem status) para 502', async () => {
    const { mapearErroJava } = await import('../../server/utils/clienteJava')
    const erro = mapearErroJava(new Error('timeout')) as { statusCode: number }
    expect(erro.statusCode).toBe(502)
  })
})

describe('proxy de imagens — validarCaminhoImagem', () => {
  const invalidos = [
    'arquivo.svg',
    '1-cacau/uuid.svg',
    '1-cacau/uuid.gif',
    '1-cacau/uuid.webp',
    '../etc/passwd',
    '1-cacau/../../segredo.jpg',
    '1-cacau//uuid.jpg',
    'C:/windows/system32.jpg',
    '1-cacau/sub/uuid.jpg', // 3 segmentos
    'arquivo-sem-barra.jpg', // 1 segmento
  ]

  for (const entrada of invalidos) {
    it(`rejeita caminho inválido: ${entrada}`, async () => {
      const { validarCaminhoImagem } = await import('../../server/utils/imagemProxy')
      expect(() => validarCaminhoImagem(entrada)).toThrow()
    })
  }

  it('aceita caminho válido de 2 segmentos (loja preenchida)', async () => {
    const { validarCaminhoImagem } = await import('../../server/utils/imagemProxy')
    const caminho = '1-cacau/3f2a9c7e-0000-4000-8000-0000000000b1.jpeg'
    expect(validarCaminhoImagem(caminho)).toBe(caminho)
  })

  it('aceita caminho válido com segmento de loja vazio ({userId}-/arquivo)', async () => {
    const { validarCaminhoImagem } = await import('../../server/utils/imagemProxy')
    const caminho = '7-/3f2a9c7e-0000-4000-8000-0000000000b1.png'
    expect(validarCaminhoImagem(caminho)).toBe(caminho)
  })
})

describe('proxy de imagens — tipoConteudoImagem', () => {
  it('força image/jpeg para jpg/jpeg', async () => {
    const { tipoConteudoImagem } = await import('../../server/utils/imagemProxy')
    expect(tipoConteudoImagem('1-x/u.jpg')).toBe('image/jpeg')
    expect(tipoConteudoImagem('1-x/u.jpeg')).toBe('image/jpeg')
  })

  it('força image/png para png', async () => {
    const { tipoConteudoImagem } = await import('../../server/utils/imagemProxy')
    expect(tipoConteudoImagem('1-x/u.png')).toBe('image/png')
  })
})
