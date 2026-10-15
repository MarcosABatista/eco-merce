// server/middleware/csrf-token.ts — Gera o token CSRF no SSR de páginas e injeta no event.context.
// Ignora /api/** e /_nuxt/** (não são páginas); nas rotas de página popula event.context.csrfToken,
// que o composable useTokenCsrf() (FEAT-004) lê no SSR e transfere ao cliente via useState payload.
// Entrega stateless sem endpoint dedicado (steering nuxt-server-csrf, design §7.5).

export default defineEventHandler((event) => {
  const caminho = event.path
  if (caminho.startsWith('/api/') || caminho.startsWith('/_nuxt/')) return

  const { encryptionKey } = useRuntimeConfig(event)
  event.context.csrfToken = gerarTokenCsrf(encryptionKey)
})
