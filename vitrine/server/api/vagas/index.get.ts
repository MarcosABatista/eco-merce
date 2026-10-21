// server/api/vagas/index.get.ts — Lista paginada de vagas ativas para a vitrine (BFF).
// Valida a query (page/size/categoria/usuarioId) com o schema isomórfico antes de repassar a
// GET /vagas do Java. Somente leitura, sem credenciais. Entrada inválida -> 400 genérico.
import { consultaVagasSchema } from '#shared/schemas/consultaVagas'
import type { PageResponse, Vaga } from '#shared/types/vaga'

export default defineEventHandler(async (event): Promise<PageResponse<Vaga>> => {
  const bruto = getQuery(event)

  // Normaliza page/size/usuarioId para número antes do Zod (query chega como string).
  const resultado = consultaVagasSchema.safeParse({
    page: bruto.page == null ? undefined : Number(bruto.page),
    size: bruto.size == null ? undefined : Number(bruto.size),
    categoria: bruto.categoria == null ? undefined : String(bruto.categoria).toUpperCase(),
    usuarioId: bruto.usuarioId == null ? undefined : Number(bruto.usuarioId),
  })
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }

  const { page, size, categoria, usuarioId } = resultado.data
  return chamarJava<PageResponse<Vaga>>(event, '/vagas', {
    method: 'GET',
    query: {
      page,
      size,
      ...(categoria ? { categoria } : {}),
      ...(usuarioId ? { usuarioId } : {}),
    },
  })
})

// curl:
//   # Lista vagas ativas (página 0, 20 itens):
//   curl -s 'http://localhost:3000/api/vagas'
//   # Filtradas por categoria VESTUARIO:
//   curl -s 'http://localhost:3000/api/vagas?categoria=VESTUARIO'
//   # Filtradas por loja (usuarioId) 7:
//   curl -s 'http://localhost:3000/api/vagas?usuarioId=7'
//   # Respostas: 200 { content, totalElements, totalPages, page, size }
//   #            400 { statusMessage: "Dados inválidos" }  (parâmetros inválidos)
//   #            502 { statusMessage: "Serviço temporariamente indisponível" }  (Java fora/timeout)
