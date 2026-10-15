// shared/schemas/login.ts — Schema Zod isomórfico do login do painel (UForm + borda do BFF).
// Valida email/senha antes do repasse a POST /usuarios/login e exige o _token CSRF (o login é
// protegido via SSR payload, steering nuxt-server-csrf). Mensagens pt-BR via { error } (Zod v4).

import { z } from 'zod'

// Token CSRF HMAC stateless presente no payload de login (steering nuxt-server-csrf).
const tokenCsrf = z.string({ error: 'Token de segurança ausente.' }).min(1).max(200)

export const loginSchema = z.object({
  email: z.email({ error: 'E-mail inválido.' }).max(255, 'E-mail muito longo.'),
  senha: z.string({ error: 'Senha é obrigatória.' }).min(1, 'Senha é obrigatória.'),
  _token: tokenCsrf,
})

export type EntradaLogin = z.infer<typeof loginSchema>
