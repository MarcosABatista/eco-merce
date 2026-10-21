// server/api/vagas/[id].get.ts — Detalhe de uma vaga para a vitrine (BFF).
// Valida o id (inteiro positivo) e repassa a GET /vagas/{id} do Java. Somente leitura.
// 404 do Java vira 404 (vaga não encontrada); id não numérico -> 400 (design §9/RF-VIT-11).
import type { Vaga } from '#shared/types/vaga'

export default defineEventHandler(async (event): Promise<Vaga> => {
  const id = validarIdInteiro(getRouterParam(event, 'id'))
  return chamarJava<Vaga>(event, `/vagas/${id}`, { method: 'GET' })
})

// curl:
//   # Detalhe da vaga 42:
//   curl -s 'http://localhost:3000/api/vagas/42'
//   # Respostas: 200 { id, cargo, descricao, categoria, nomeLoja, ... }
//   #            400 { statusMessage: "Identificador inválido" }  (id não numérico/<=0)
//   #            404 { statusMessage: "Recurso não encontrado" }  (vaga inexistente)
//   #            502 { statusMessage: "Serviço temporariamente indisponível" }  (Java fora/timeout)
