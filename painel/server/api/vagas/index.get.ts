// server/api/vagas/index.get.ts — Lista "Minhas Vagas" do lojista logado (BFF).
// Exige sessão e FORÇA usuarioId = sessao.id, ignorando qualquer usuarioId vindo do cliente
// (anti-IDOR, design §4.3). Repassa a GET /vagas?usuarioId&page&size do Java (ativas e
// inativas, para o lojista gerenciar). page/size validados.
import type { PageResponse, Vaga } from '#shared/types/vaga'

export default defineEventHandler(async (event): Promise<PageResponse<Vaga>> => {
  const sessao = await exigirSessao(event)

  const bruto = getQuery(event)
  const page = bruto.page == null ? 0 : Number(bruto.page)
  const size = bruto.size == null ? 20 : Number(bruto.size)
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1 || size > 50) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }

  // usuarioId SEMPRE da sessão; o query do cliente é descartado.
  return chamarJava<PageResponse<Vaga>>(event, '/vagas', {
    method: 'GET',
    query: { usuarioId: sessao.id, page, size },
  })
})

// curl:
//   # Minhas vagas (usuarioId derivado da sessão):
//   curl -s -b cookies.txt 'http://localhost:3000/api/vagas?page=0&size=20'
//   # Respostas: 200 { content, totalElements, totalPages, page, size }  (ativas e inativas do dono)
//   #            400 { statusMessage: "Dados inválidos" }  (page/size inválidos)
//   #            401 { statusMessage: "Não autenticado" }  (sem sessão)
