// test/unit/paginacaoProdutos.spec.ts — Property/unit tests das invariantes de paginação/busca.
// Trava: temMaisPaginas <=> paginaAtual < totalPaginas-1; anexarProdutos acumula sem remover;
// filtrarProdutos é case-insensitive, casa nome do produto OU da loja e termo vazio devolve tudo.
// Lógica pura isomórfica. Ambiente node.

import { describe, expect, it } from 'vitest'
import fc from 'fast-check'
import {
  anexarProdutos,
  filtrarProdutos,
  temMaisPaginas,
} from '../../shared/utils/paginacaoProdutos'
import type { Produto } from '../../shared/types/produto'

// Fábrica mínima de Produto para os testes (só os campos exercitados importam). nomeLoja opcional.
function fazerProduto(id: number, nome: string, nomeLoja: string | null = null): Produto {
  return {
    id,
    nome,
    descricao: null,
    preco: 10,
    precoDesconto: null,
    percentualDesconto: null,
    categoria: 'VESTUARIO',
    urlImagem: null,
    ativo: true,
    nomeLoja,
    telefone: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
}

describe('temMaisPaginas', () => {
  it('é verdadeiro sse e somente se paginaAtual < totalPaginas - 1', () => {
    fc.assert(
      fc.property(fc.nat(100), fc.nat(100), (paginaAtual, totalPaginas) => {
        expect(temMaisPaginas(paginaAtual, totalPaginas)).toBe(paginaAtual < totalPaginas - 1)
      }),
    )
  })

  it('última página (paginaAtual == totalPaginas-1) -> false', () => {
    expect(temMaisPaginas(2, 3)).toBe(false)
  })

  it('primeira de várias páginas -> true', () => {
    expect(temMaisPaginas(0, 3)).toBe(true)
  })

  it('catálogo vazio (totalPaginas 0) -> false', () => {
    expect(temMaisPaginas(0, 0)).toBe(false)
  })
})

describe('anexarProdutos', () => {
  it('preserva todos os itens anteriores e acrescenta os novos na ordem (append)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 1000 })),
        fc.array(fc.integer({ min: 0, max: 1000 })),
        (idsA, idsB) => {
          const a = idsA.map((id, i) => fazerProduto(id, `A${i}`))
          const b = idsB.map((id, i) => fazerProduto(id, `B${i}`))
          const resultado = anexarProdutos(a, b)
          expect(resultado.length).toBe(a.length + b.length)
          expect(resultado.slice(0, a.length)).toEqual(a)
          expect(resultado.slice(a.length)).toEqual(b)
        },
      ),
    )
  })
})

describe('filtrarProdutos', () => {
  const base = [
    fazerProduto(1, 'Tênis de Corrida', 'Loja do Pé'),
    fazerProduto(2, 'Camiseta Branca', 'Moda Center'),
    fazerProduto(3, 'TÊNIS Casual', null),
  ]

  it('termo vazio (ou só espaços) devolve o conjunto inteiro', () => {
    expect(filtrarProdutos(base, '')).toEqual(base)
    expect(filtrarProdutos(base, '   ')).toEqual(base)
  })

  it('busca por nome do produto é case-insensitive', () => {
    const r = filtrarProdutos(base, 'tênis')
    expect(r.map(p => p.id)).toEqual([1, 3])
  })

  it('busca também casa pelo nome da loja (case-insensitive)', () => {
    const r = filtrarProdutos(base, 'moda')
    expect(r.map(p => p.id)).toEqual([2])
  })

  it('nenhum match (nem nome nem loja) devolve lista vazia', () => {
    expect(filtrarProdutos(base, 'inexistente')).toEqual([])
  })

  it('property: todo item retornado contém o termo (lowercase) no nome OU na loja', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 5 }), (termo) => {
        const r = filtrarProdutos(base, termo)
        const alvo = termo.trim().toLowerCase()
        if (alvo) {
          for (const p of r) {
            const emNome = p.nome.toLowerCase().includes(alvo)
            const emLoja = (p.nomeLoja ?? '').toLowerCase().includes(alvo)
            expect(emNome || emLoja).toBe(true)
          }
        }
      }),
    )
  })
})
