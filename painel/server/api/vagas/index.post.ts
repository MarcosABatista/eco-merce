// server/api/vagas/index.post.ts — Cadastra uma vaga do lojista logado (BFF).
// Exige sessão, valida CSRF (_token) e vagaSchema ANTES do Java e FORÇA usuarioId = sessao.id
// (anti-IDOR). Repassa a POST /vagas.
import { vagaSchema } from '#shared/schemas/vaga'
import type { Vaga } from '#shared/types/vaga'

export default defineEventHandler(async (event): Promise<Vaga> => {
  const sessao = await exigirSessao(event)
  const { encryptionKey } = useRuntimeConfig(event)

  const corpo = await readBody(event)
  const resultado = vagaSchema.safeParse(corpo)
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }
  if (!validarTokenCsrf(resultado.data._token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  const { _token, ...dados } = resultado.data
  // usuarioId SEMPRE da sessão (o cliente não escolhe o dono).
  return chamarJava<Vaga>(event, '/vagas', {
    method: 'POST',
    body: { ...dados, usuarioId: sessao.id },
  })
})

// curl:
//   # Cria vaga (precisa do cookie de sessão e do _token CSRF; usuarioId vem da sessão):
//   curl -s -b cookies.txt -X POST 'http://localhost:3000/api/vagas' \
//     -H 'Content-Type: application/json' \
//     -d '{"cargo":"Vendedor","descricao":"Atendimento ao cliente","categoria":"VESTUARIO","_token":"<timestamp.hmac>"}'
//   # Respostas: 201/200 { id, cargo, descricao, ... }
//   #            400 { statusMessage: "Dados inválidos" }  (schema inválido OU conta inativa no Java)
//   #            401 { statusMessage: "Não autenticado" }  (sem sessão)
//   #            403 { statusMessage: "Acesso negado" }    (CSRF inválido/expirado)
