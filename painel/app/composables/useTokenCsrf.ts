// app/composables/useTokenCsrf.ts — Transfere o token CSRF do SSR para o cliente (painel).
// No SSR lê event.context.csrfToken (populado pelo middleware csrf-token) e o injeta em
// useState('csrf-token'); na hidratação o mesmo valor chega ao cliente via payload, sem
// round-trip. Fonte única do _token enviado em toda escrita do painel (design §7.5).

import { useRequestEvent, useState } from '#imports'

// Chave única do estado do token CSRF, compartilhada entre SSR e cliente.
const CSRF_ESTADO_CHAVE = 'csrf-token'

// Retorna o Ref do token CSRF. No servidor, inicializa a partir do event.context; no cliente,
// reaproveita o valor hidratado via payload do useState.
export function useTokenCsrf() {
  const token = useState<string>(CSRF_ESTADO_CHAVE, () => {
    const event = useRequestEvent()
    return (event?.context.csrfToken as string | undefined) ?? ''
  })
  return token
}
