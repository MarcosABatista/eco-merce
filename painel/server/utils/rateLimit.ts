// server/utils/rateLimit.ts — Rate limit em memória por IP para endpoints sensíveis do painel.
// Usado no login (5 tentativas/min/IP, design §7.6). Lê o 1º hop de x-forwarded-for (atrás de
// proxy reverso) com fallback para o socket. Contador por processo — aceitável no MVP single-
// process; migrar para useStorage() se escalar para múltiplos workers (limitação registrada §7.6).

import type { H3Event } from 'h3'

// Janela e teto do login: 5 tentativas por minuto por IP.
export const LOGIN_RATE_LIMITE = 5
export const LOGIN_RATE_JANELA_MS = 60 * 1000

// Estado em memória: por chave (ex.: "login:IP") guarda contagem e início da janela.
interface EstadoRate {
  contagem: number
  inicioJanela: number
}
const rateStore = new Map<string, EstadoRate>()

// Resolve o IP do cliente: 1º IP de x-forwarded-for (hop confiável do proxy) ou o socket.
export function ipDoCliente(event: H3Event): string {
  const xff = getRequestHeader(event, 'x-forwarded-for')
  if (xff) {
    const primeiro = xff.split(',')[0]?.trim()
    if (primeiro) return primeiro
  }
  return event.node.req.socket.remoteAddress ?? 'desconhecido'
}

// Registra uma tentativa para a chave e retorna true se ela excede o teto na janela corrente.
// Reinicia a janela quando ela expira. Não lança — o caller decide a resposta (429).
export function excedeuRateLimit(chave: string, limite: number, janelaMs: number): boolean {
  const agora = Date.now()
  const estado = rateStore.get(chave)

  if (!estado || agora - estado.inicioJanela >= janelaMs) {
    rateStore.set(chave, { contagem: 1, inicioJanela: agora })
    return false
  }

  estado.contagem++
  return estado.contagem > limite
}
