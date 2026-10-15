// server/api/usuarios/index.post.ts — Cria um usuário/lojista (BFF).
// Valida CSRF (_token) e usuarioSchema (cpfCnpj 11/14 dígitos, nome>=3, email, senha>=8) ANTES do
// Java e repassa a POST /usuarios. O 409 duplicado (email/cpfCnpj) volta como fieldErrors por
// campo via mapearErroJava, sem o valor bruto (design §4.1/§9).

import { usuarioSchema } from '#shared/schemas/usuario'
import type { Usuario } from '#shared/types/usuario'

export default defineEventHandler(async (event): Promise<Usuario> => {
  const { encryptionKey } = useRuntimeConfig(event)

  const corpo = await readBody(event)
  const resultado = usuarioSchema.safeParse(corpo)
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }
  if (!validarTokenCsrf(resultado.data._token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  const { _token, ...dados } = resultado.data
  return chamarJava<Usuario>(event, '/usuarios', { method: 'POST', body: dados })
})

// curl:
//   # Cria usuário/lojista (precisa do _token CSRF entregue via SSR payload):
//   curl -s -X POST 'http://localhost:3000/api/usuarios' \
//     -H 'Content-Type: application/json' \
//     -d '{"cpfCnpj":"12345678901","nome":"Loja do Cacau","email":"loja@exemplo.com","senha":"senhaSegura1","_token":"<timestamp.hmac>"}'
//   # Respostas: 201/200 { id, cpfCnpj, nome, email, ... }
//   #            400 { statusMessage: "Dados inválidos" }  (schema inválido)
//   #            403 { statusMessage: "Acesso negado" }    (CSRF inválido/expirado)
//   #            409 { data: { fieldErrors: [{ field: "email"|"cpfCnpj", message }] } }  (duplicado)
