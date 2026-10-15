// shared/utils/paginacaoProdutos.ts — Invariantes puras da paginação/busca de produtos da vitrine.
// Lógica isomórfica e sem dependência de runtime (reusada pelo composable useProdutos e travada
// por property tests): temMaisPaginas, append (acumula sem remover), reset e filtro de busca
// case-insensitive por nome. Importável via #shared (steering nomenclatura-constantes/testing §11).

import type { Produto } from '#shared/types/produto'

// Há mais páginas a carregar: a página atual ainda não é a última (RF-VIT-6).
export function temMaisPaginas(paginaAtual: number, totalPaginas: number): boolean {
  return paginaAtual < totalPaginas - 1
}

// Anexa a próxima página sem remover itens já carregados (append — RF-VIT-6).
export function anexarProdutos(atuais: Produto[], novos: Produto[]): Produto[] {
  return [...atuais, ...novos]
}

// Filtra por nome, case-insensitive, sobre o conjunto já carregado; termo vazio devolve tudo.
export function filtrarPorNome(produtos: Produto[], termo: string): Produto[] {
  const alvo = termo.trim().toLowerCase()
  if (!alvo) {
    return produtos
  }
  return produtos.filter(p => p.nome.toLowerCase().includes(alvo))
}
