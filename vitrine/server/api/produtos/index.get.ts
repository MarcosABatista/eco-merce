// server/api/produtos/index.get.ts — Lista paginada de produtos ativos para a vitrine (BFF).
// Valida a query (page/size/categoria) com o schema isomórfico antes de repassar a GET /produtos
// do Java. Somente leitura, sem credenciais (RF-VIT-10). Entrada inválida -> 400 genérico.

import { consultaProdutosSchema } from '#shared/schemas/consultaProdutos'
import type { PageResponse, Produto } from '#shared/types/produto'

export default defineEventHandler(async (event): Promise<PageResponse<Produto>> => {
  const bruto = getQuery(event)

  // Normaliza page/size para número antes do Zod (query chega como string).
  const resultado = consultaProdutosSchema.safeParse({
    page: bruto.page == null ? undefined : Number(bruto.page),
    size: bruto.size == null ? undefined : Number(bruto.size),
    categoria: bruto.categoria == null ? undefined : String(bruto.categoria).toUpperCase(),
  })
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }

  const { page, size, categoria } = resultado.data
  return chamarJava<PageResponse<Produto>>(event, '/produtos', {
    method: 'GET',
    query: { page, size, ...(categoria ? { categoria } : {}) },
  })
})

// curl:
//   # Lista produtos ativos (página 0, 20 itens):
//   curl -s 'http://localhost:3000/api/produtos'
//   # Página 1, 12 itens, categoria VESTUARIO:
//   curl -s 'http://localhost:3000/api/produtos?page=1&size=12&categoria=VESTUARIO'
//   # Respostas: 200 { content, totalElements, totalPages, page, size }
//   #            400 { statusMessage: "Dados inválidos" }  (page/size/categoria inválidos)
//   #            502 { statusMessage: "Serviço temporariamente indisponível" }  (Java fora/timeout)
