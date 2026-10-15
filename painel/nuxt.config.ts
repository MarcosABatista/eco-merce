// nuxt.config.ts — Configuração do app Nuxt 4 do painel administrativo (SSR universal).
// Registra Nuxt UI, Nuxt Image e nuxt-auth-utils (sessão cookie httpOnly server-side) e o
// runtimeConfig server-only: apiBaseUrl (backend Java) e encryptionKey (CSRF HMAC + sessão),
// nunca expostos ao cliente. O bloco $production ativa preset bun e compressão (deploy-bun-producao).

export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/image', 'nuxt-auth-utils'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // runtimeConfig server-only: URL do Java e chave de criptografia vivem no servidor Nitro (BFF).
  // NADA em runtimeConfig.public (RF-ARQ-2). encryptionKey só existe no painel (CSRF/sessão).
  runtimeConfig: {
    apiBaseUrl: '', // env NUXT_API_BASE_URL — ex.: http://localhost:8080/api/v1 (dev)
    encryptionKey: '', // env NUXT_ENCRYPTION_KEY — HMAC do token CSRF e assinatura da sessão
  },

  // Produção na VPS: preset bun + compressão. Tudo é SSR autenticado/dinâmico (sem prerender).
  $production: {
    nitro: {
      preset: 'bun',
      compressPublicAssets: { gzip: true, brotli: true },
      prerender: { crawlLinks: false },
    },
  },
})
