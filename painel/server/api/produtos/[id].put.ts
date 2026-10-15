// server/api/produtos/[id].put.ts — Edita um produto do lojista (BFF).
// Exige sessão, valida CSRF (_token) e atualizacaoProdutoSchema, e confirma a PROPRIEDADE do
// produto (anti-IDOR) antes de repassar a PUT /produtos/{id}. Produto de outro dono -> 403 sem
// repassar a escrita ao Java (design §4.3/§7.7).

import { atualizacaoProdutoSchema } from '#shared/schemas/produto'
import type { Produto } from '#shared/types/produto'

export default defineEventHandler(async (event): Promise<Produto> => {
  const sessao = await exigirSessao(event)
  const id = validarIdInteiro(getRouterParam(event, 'id'))
  const { encryptionKey } = useRuntimeConfig(event)

  const corpo = await readBody(event)
  const resultado = atualizacaoProdutoSchema.safeParse(corpo)
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }
  if (!validarTokenCsrf(resultado.data._token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  // Propriedade: só o dono (ou admin) edita; senão 403 sem repassar a escrita.
  if (!(await exigirProdutoDoDono(event, sessao, id))) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  const { _token, ...dados } = resultado.data
  return chamarJava<Produto>(event, `/produtos/${id}`, { method: 'PUT', body: dados })
})

// curl:
//   # Edita o produto 42 (cookie de sessão + _token CSRF; só dono/admin):
//   curl -s -b cookies.txt -X PUT 'http://localhost:3000/api/produtos/42' \
//     -H 'Content-Type: application/json' \
//     -d '{"nome":"Camiseta Nova","preco":89.9,"precoDesconto":null,"categoria":"VESTUARIO","ativo":true,"_token":"<timestamp.hmac>"}'
//   # Respostas: 200 { id, nome, preco, ... }
//   #            400 { statusMessage: "Dados inválidos" } / "Identificador inválido"
//   #            401 { statusMessage: "Não autenticado" }
//   #            403 { statusMessage: "Acesso negado" }  (CSRF inválido OU produto de outro dono)
