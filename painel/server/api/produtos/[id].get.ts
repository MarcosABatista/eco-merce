// server/api/produtos/[id].get.ts — Detalhe de um produto do lojista para edição (BFF).
// Exige sessão e propriedade (anti-IDOR): só o dono (ou admin) carrega o produto; senão 403.
// Em seguida repassa a GET /produtos/{id} do Java. Base do fluxo "editar produto" (design §4.3).

import type { Produto } from '#shared/types/produto'

export default defineEventHandler(async (event): Promise<Produto> => {
  const sessao = await exigirSessao(event)
  const id = validarIdInteiro(getRouterParam(event, 'id'))

  if (!(await exigirProdutoDoDono(event, sessao, id))) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  return chamarJava<Produto>(event, `/produtos/${id}`, { method: 'GET' })
})

// curl:
//   # Carrega o produto 42 para edição (precisa do cookie de sessão; só dono/admin):
//   curl -s -b cookies.txt 'http://localhost:3000/api/produtos/42'
//   # Respostas: 200 { id, nome, preco, precoDesconto, categoria, ... }
//   #            400 { statusMessage: "Identificador inválido" }  (id não numérico/<=0)
//   #            401 { statusMessage: "Não autenticado" }         (sem sessão)
//   #            403 { statusMessage: "Acesso negado" }           (produto de outro dono)
