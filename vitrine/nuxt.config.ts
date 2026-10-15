// nuxt.config.ts — Configuração do app Nuxt 4 da vitrine pública (SSR universal).
// Registra Nuxt UI + Nuxt Image, o CSS do design system e o runtimeConfig server-only
// (apiBaseUrl do backend Java, nunca exposto ao cliente). O bloco $production ativa o
// preset bun e compressão para o deploy na VPS (steering deploy-bun-producao).

export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // runtimeConfig server-only: a URL do Java vive no servidor Nitro (BFF), jamais no cliente.
  // NADA em runtimeConfig.public — o browser nunca fala direto com o Java (RF-ARQ-2).
  runtimeConfig: {
    apiBaseUrl: '', // env NUXT_API_BASE_URL — ex.: http://localhost:8080/api/v1 (dev)
  },

  // Produção na VPS: preset bun + compressão de assets. Catálogo é SSR (sem prerender).
  $production: {
    nitro: {
      preset: 'bun',
      compressPublicAssets: { gzip: true, brotli: true },
      prerender: { crawlLinks: false },
    },
  },
})
