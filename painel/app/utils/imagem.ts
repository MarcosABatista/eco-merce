// app/utils/imagem.ts — Resolve a URL de exibição de imagens do painel via proxy do BFF.
// O backend Java devolve urlImagem como "/api/v1/images/{objectName}"; o browser nunca fala com o
// Java (RF-ARQ-2), então reescrevemos para o proxy local "/api/imagens/{objectName}" (design §7.3).
// Auto-importado no app (Nuxt). Retorna null quando não há imagem (o chamador mostra placeholder).

// Prefixo da rota de imagens do backend Java (dentro de urlImagem).
const IMAGEM_PREFIXO_JAVA = '/api/v1/images/'
// Prefixo da rota do proxy local de imagens do painel (BFF).
const IMAGEM_PREFIXO_PROXY = '/api/imagens/'

// Converte a urlImagem do produto/usuário no caminho do proxy local, ou null quando ausente.
export function proxyImagem(urlImagem: string | null | undefined): string | null {
  if (!urlImagem) return null
  const indice = urlImagem.indexOf(IMAGEM_PREFIXO_JAVA)
  if (indice === -1) return urlImagem
  const objectName = urlImagem.slice(indice + IMAGEM_PREFIXO_JAVA.length)
  return IMAGEM_PREFIXO_PROXY + objectName
}
