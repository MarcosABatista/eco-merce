// server/api/produtos/[id].get.ts — Detalhe de um produto para a vitrine (BFF).
// Valida o id (inteiro positivo) e repassa a GET /produtos/{id} do Java. Somente leitura.
// 404 do Java vira 404 (produto não encontrado); id não numérico -> 400 (design §9/RF-VIT-11).

import type { Produto } from '#shared/types/produto'

export default defineEventHandler(async (event): Promise<Produto> => {
  const id = validarIdInteiro(getRouterParam(event, 'id'))
  return chamarJava<Produto>(event, `/produtos/${id}`, { method: 'GET' })
})

// curl:
//   # Detalhe do produto 42:
//   curl -s 'http://localhost:3000/api/produtos/42'
//   # Respostas: 200 { id, nome, preco, precoDesconto, categoria, urlImagem, ... }
//   #            400 { statusMessage: "Identificador inválido" }  (id não numérico/<=0)
//   #            404 { statusMessage: "Recurso não encontrado" }  (produto inexistente)
//   #            502 { statusMessage: "Serviço temporariamente indisponível" }  (Java fora/timeout)
