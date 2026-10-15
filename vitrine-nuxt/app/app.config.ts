// app/app.config.ts — Config de runtime do Nuxt UI para a vitrine.
// Fixa a paleta semântica do design system (primary: blue, neutral: slate); as demais cores
// (success/warning/error/info) usam os defaults do Nuxt UI. Fonte única da identidade de cor.

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'slate',
    },
  },
})
