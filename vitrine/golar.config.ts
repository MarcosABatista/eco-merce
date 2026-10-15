// golar.config.ts — Config do checker Golar (typescript-go) para o typecheck não-interativo.
// Aponta direto ao tsconfig gerado pelo Nuxt em nuxt prepare. Objeto literal (sem defineConfig,
// que dispara ERR_PACKAGE_PATH_NOT_EXPORTED). Steering nuxt-typecheck-golar.

export default {
  tsconfig: './.nuxt/tsconfig.json',
}
