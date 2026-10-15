// app/plugins/csrf-renovacao.client.ts — Renova o token CSRF quando a aba volta ao foco (painel).
// O token tem TTL de 10 min (server/utils/csrf). Ao reganhar visibilidade, recarrega o app via
// reloadNuxtApp() para o SSR gerar um token novo (useTokenCsrf), evitando um POST com token
// expirado após a aba ficar ociosa (steering nuxt-server-csrf, design §7.5).

export default defineNuxtPlugin(() => {
  if (typeof document === 'undefined') return

  function aoVoltarAoFoco() {
    if (document.visibilityState === 'visible') {
      reloadNuxtApp({ ttl: 1000 })
    }
  }

  document.addEventListener('visibilitychange', aoVoltarAoFoco)
})
