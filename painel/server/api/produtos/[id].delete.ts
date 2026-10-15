// server/api/produtos/[id].delete.ts — Remove (soft delete) um produto do lojista (BFF).
// Exige sessão, valida CSRF (_token no corpo) e confirma a PROPRIEDADE do produto (anti-IDOR)
// antes de repassar a DELETE /produtos/{id}. Produto de outro dono -> 403 sem repassar (design §4.3).

import { z } from 'zod'

// Corpo mínimo da remoção: só o token CSRF (DELETE é escrita, logo protegido).
const remocaoSchema = z.object({
  _token: z.string({ error: 'Token de segurança ausente.' }).min(1).max(200),
})

export default defineEventHandler(async (event) => {
  const sessao = await exigirSessao(event)
  const id = validarIdInteiro(getRouterParam(event, 'id'))
  const { encryptionKey } = useRuntimeConfig(event)

  const corpo = await readBody(event)
  const resultado = remocaoSchema.safeParse(corpo)
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }
  if (!validarTokenCsrf(resultado.data._token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  if (!(await exigirProdutoDoDono(event, sessao, id))) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  await chamarJava<void>(event, `/produtos/${id}`, { method: 'DELETE' })
  setResponseStatus(event, 204)
  return null
})

// curl:
//   # Remove o produto 42 (cookie de sessão + _token CSRF; só dono/admin):
//   curl -s -b cookies.txt -X DELETE 'http://localhost:3000/api/produtos/42' \
//     -H 'Content-Type: application/json' -d '{"_token":"<timestamp.hmac>"}'
//   # Respostas: 204 (sem corpo)
//   #            400 { statusMessage: "Dados inválidos" } / "Identificador inválido"
//   #            401 { statusMessage: "Não autenticado" }
//   #            403 { statusMessage: "Acesso negado" }  (CSRF inválido OU produto de outro dono)
