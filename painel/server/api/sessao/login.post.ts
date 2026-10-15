// server/api/sessao/login.post.ts — Login do lojista no painel (BFF).
// Valida CSRF (_token) e loginSchema ANTES do Java, aplica rate limit (5/min/IP) e, em sucesso,
// grava a sessão httpOnly com o subconjunto seguro do usuário (sem senha). Falha de credencial ou
// usuário inativo -> 401 genérico "Email ou senha inválidos" (não-enumeração, design §9/§7.6).

import { loginSchema } from '#shared/schemas/login'
import type { Usuario } from '#shared/types/usuario'

export default defineEventHandler(async (event) => {
  const { encryptionKey } = useRuntimeConfig(event)

  // Rate limit por IP antes de qualquer processamento (protege contra brute force).
  const ip = ipDoCliente(event)
  if (excedeuRateLimit(`login:${ip}`, LOGIN_RATE_LIMITE, LOGIN_RATE_JANELA_MS)) {
    setResponseHeader(event, 'Retry-After', Math.ceil(LOGIN_RATE_JANELA_MS / 1000))
    throw createError({ statusCode: 429, statusMessage: 'Muitas tentativas. Tente novamente em instantes.' })
  }

  // Validação de entrada (Zod) — inclui o _token CSRF no corpo.
  const corpo = await readBody(event)
  const resultado = loginSchema.safeParse(corpo)
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }

  // CSRF: token HMAC válido e dentro do TTL antes de chamar o Java.
  if (!validarTokenCsrf(resultado.data._token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  const { email, senha } = resultado.data

  // Credenciais ao Java. Qualquer falha (401/400 inativo/404) colapsa num 401 genérico
  // (não-enumeração): não revelamos se o e-mail existe nem se a conta está inativa.
  let usuario: Usuario
  try {
    usuario = await chamarJava<Usuario>(event, '/usuarios/login', {
      method: 'POST',
      body: { email, senha },
    })
  }
  catch {
    throw createError({ statusCode: 401, statusMessage: 'Email ou senha inválidos' })
  }

  // Sessão httpOnly com o subconjunto seguro (sem senha).
  await gravarSessao(event, {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    nomeLoja: usuario.nomeLoja,
    admin: usuario.admin,
    ativo: usuario.ativo,
    imagemLoja: usuario.imagemLoja,
  })

  return { ok: true }
})

// curl:
//   # Login (precisa do _token CSRF entregue via SSR payload da página /login):
//   curl -s -c cookies.txt -X POST 'http://localhost:3000/api/sessao/login' \
//     -H 'Content-Type: application/json' \
//     -d '{"email":"lojista@exemplo.com","senha":"senhaSegura1","_token":"<timestamp.hmac>"}'
//   # Respostas: 200 { ok: true } + Set-Cookie da sessão httpOnly
//   #            400 { statusMessage: "Dados inválidos" }       (email/senha/_token ausentes)
//   #            403 { statusMessage: "Acesso negado" }         (CSRF inválido/expirado)
//   #            401 { statusMessage: "Email ou senha inválidos" }  (credencial/conta inativa)
//   #            429 { statusMessage: "Muitas tentativas..." }  (> 5 tentativas/min/IP)
