// vitest.config.ts — Config de testes da vitrine com dois projetos Vitest.
// `unit` roda em ambiente node (helpers puros/schemas isomórficos); `nuxt` roda no ambiente
// Nuxt via @nuxt/test-utils (componentes/BFF). Separar os ambientes evita carregar o runtime
// Nuxt em testes puros. Rodar com: pnpm test (vitest run --reporter=dot).

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

// Alias #shared p/ o projeto unit (node), que não carrega os aliases do Nuxt. Aponta para shared/.
const aliasShared = fileURLToPath(new URL('./shared', import.meta.url))

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: { '#shared': aliasShared },
        },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['test/unit/**/*.{test,spec}.ts', 'shared/**/*.{test,spec}.ts'],
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
        },
      }),
    ],
  },
})
