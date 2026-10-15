// server/api/produtos/index.get.ts — Lista "Meus Produtos" do lojista logado (BFF).
// Exige sessão e FORÇA usuarioId = sessao.id, ignorando qualquer usuarioId vindo do cliente
// (anti-IDOR, design §4.3). Repassa a GET /produtos?usuarioId&page&size do Java (ativos e
// inativos, para o lojista gerenciar). page/size validados; demais filtros descartados.

import type { PageResponse, Produto } from '#shared/types/produto'

export default defineEventHandler(async (event): Promise<PageResponse<Produto>> => {
  const sessao = await exigirSessao(event)

  const bruto = getQuery(event)
  const page = bruto.page == null ? 0 : Number(bruto.page)
  const size = bruto.size == null ? 20 : Number(bruto.size)
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1 || size > 50) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }

  // usuarioId SEMPRE da sessão; o query do cliente é descartado.
  return chamarJava<PageResponse<Produto>>(event, '/produtos', {
    method: 'GET',
    query: { usuarioId: sessao.id, page, size },
  })
})

// curl:
//   # Meus produtos (usuarioId derivado da sessão; qualquer usuarioId no query é ignorado):
//   curl -s -b cookies.txt 'http://localhost:3000/api/produtos?page=0&size=20'
//   # Respostas: 200 { content, totalElements, totalPages, page, size }  (ativos e inativos do dono)
//   #            400 { statusMessage: "Dados inválidos" }  (page/size inválidos)
//   #            401 { statusMessage: "Não autenticado" }  (sem sessão)
