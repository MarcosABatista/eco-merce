// server/api/sessao/logout.post.ts — Encerra a sessão do painel (BFF).
// Valida o _token CSRF, limpa o cookie de sessão httpOnly e responde 204. NÃO chama o Java —
// contrato puramente local (design §4.2/§7.5).

import { z } from 'zod'

// Corpo mínimo: só o token CSRF (logout é escrita, logo protegido).
const logoutSchema = z.object({
  _token: z.string({ error: 'Token de segurança ausente.' }).min(1).max(200),
})

export default defineEventHandler(async (event) => {
  const { encryptionKey } = useRuntimeConfig(event)

  const corpo = await readBody(event)
  const resultado = logoutSchema.safeParse(corpo)
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }
  if (!validarTokenCsrf(resultado.data._token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  await encerrarSessao(event)
  setResponseStatus(event, 204)
  return null
})

// curl:
//   # Contrato LOCAL (sem repasse ao Java): limpa o cookie de sessão. Precisa do _token CSRF.
//   curl -s -b cookies.txt -X POST 'http://localhost:3000/api/sessao/logout' \
//     -H 'Content-Type: application/json' -d '{"_token":"<timestamp.hmac>"}'
//   # Respostas: 204 (sem corpo) + Set-Cookie expirando a sessão httpOnly
//   #            400 { statusMessage: "Dados inválidos" }  (_token ausente)
//   #            403 { statusMessage: "Acesso negado" }    (CSRF inválido/expirado)
