// server/api/imagens/[...caminho].get.ts — Proxy seguro de imagens do backend para a vitrine (BFF).
// Valida estruturalmente o objectName (2 segmentos, sem traversal; whitelist jpg/jpeg/png) e
// repassa a GET /images/{objectName} do Java buscando os bytes. Força Content-Type por extensão
// (nunca ecoa o upstream nem svg) + headers defensivos (nosniff, inline, CSP) — design §7.3.

import { TEMPO_LIMITE_JAVA_MS } from '#shared/constants/bff'

export default defineEventHandler(async (event) => {
  const caminho = validarCaminhoImagem(getRouterParam(event, 'caminho') ?? '')
  const tipo = tipoConteudoImagem(caminho)

  const { apiBaseUrl } = useRuntimeConfig(event)
  // Tipagem larga do $fetch: URL externa (Java), não rota interna tipada do Nitro.
  const buscar = $fetch as unknown as (url: string, opts: Record<string, unknown>) => Promise<ArrayBuffer>
  let bytes: ArrayBuffer
  try {
    bytes = await buscar(`${apiBaseUrl}/images/${caminho}`, {
      method: 'GET',
      responseType: 'arrayBuffer',
      timeout: TEMPO_LIMITE_JAVA_MS,
    })
  }
  catch (erro) {
    throw mapearErroJava(erro, `/images/${caminho}`)
  }

  // Content-Type FORÇADO pela extensão validada; headers defensivos contra sniffing/execução.
  setResponseHeader(event, 'Content-Type', tipo)
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'Content-Disposition', 'inline')
  setResponseHeader(event, 'Content-Security-Policy', "default-src 'none'")
  return new Uint8Array(bytes)
})

// curl:
//   # Imagem válida (2 segmentos, extensão jpg/jpeg/png):
//   curl -s 'http://localhost:3000/api/imagens/1-cacau/3f2a9c7e-0000-4000-8000-0000000000b1.jpeg' -o img.jpeg
//   # Respostas: 200 bytes da imagem (Content-Type forçado image/jpeg|image/png;
//   #              headers X-Content-Type-Options: nosniff, Content-Disposition: inline,
//   #              Content-Security-Policy: default-src 'none')
//   #            400 { statusMessage: "Caminho de imagem inválido" }  (svg/gif/webp, traversal,
//   #              segmento extra, '..', '//', drive letter)
//   #            404 { statusMessage: "Recurso não encontrado" }  (imagem inexistente no Java)
