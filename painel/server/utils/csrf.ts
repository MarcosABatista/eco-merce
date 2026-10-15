// server/utils/csrf.ts — Token CSRF HMAC stateless (sem estado no servidor) do painel.
// gerarTokenCsrf cria "timestamp.HMAC-SHA256(timestamp)" com a encryptionKey; validarTokenCsrf
// confere a assinatura em tempo constante (timingSafeEqual) + TTL de 10 min. Base da proteção
// de toda escrita do painel via SSR payload (steering nuxt-server-csrf, design §7.5).

import { createHmac, timingSafeEqual } from 'node:crypto'

// Tempo de vida do token: 10 minutos (teto obrigatório do steering nuxt-server-csrf).
const CSRF_TTL_MS = 10 * 60 * 1000

// Gera o token no formato "timestamp.hmac" assinado com a chave secreta do servidor.
export function gerarTokenCsrf(chave: string): string {
  const timestamp = Date.now().toString()
  const hmac = createHmac('sha256', chave).update(timestamp).digest('hex')
  return `${timestamp}.${hmac}`
}

// Valida o token: formato, TTL (<=10min, não futuro) e assinatura em tempo constante.
// Qualquer falha retorna false (o endpoint traduz para 403 genérico).
export function validarTokenCsrf(token: unknown, chave: string): boolean {
  if (typeof token !== 'string') return false
  const partes = token.split('.')
  if (partes.length !== 2) return false
  const [timestamp, hmac] = partes
  if (!timestamp || !hmac) return false

  const idade = Date.now() - Number(timestamp)
  if (Number.isNaN(idade) || idade > CSRF_TTL_MS || idade < 0) return false

  const esperado = createHmac('sha256', chave).update(timestamp).digest('hex')
  if (esperado.length !== hmac.length) return false
  return timingSafeEqual(Buffer.from(esperado, 'hex'), Buffer.from(hmac, 'hex'))
}
