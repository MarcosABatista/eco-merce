// server/utils/imagemProxy.ts — Validação e política de segurança do proxy de imagens do BFF.
// Valida estruturalmente o objectName (regex positiva de 2 segmentos, sem traversal) e força o
// Content-Type a partir da extensão (nunca ecoa o upstream nem image/svg+xml) — barra XSS
// armazenado same-origin (design §7.3, MEDIUM-1/HIGH-1). Usado por server/api/imagens/[...].get.ts.

// Formato real do objectName no backend: "{userId}-{loja}/{uuid}.{ext}" (2 segmentos).
// Segmento da loja pode ser vazio ([a-z0-9-]*). Whitelist alinhada ao upload: jpg/jpeg/png.
const IMAGEM_PROXY_REGEX_CAMINHO = /^\d+-[a-z0-9-]*\/[a-f0-9-]+\.(?:jpe?g|png)$/i

// Comprimento máximo do caminho aceito (defesa contra entradas abusivas).
const IMAGEM_PROXY_MAX_CAMINHO = 256

// Content-Type forçado por extensão validada (mapa fixo server-side; svg deliberadamente fora).
const IMAGEM_PROXY_TIPOS: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

// Valida o objectName do proxy. Lança 400 em qualquer caminho suspeito ou fora da whitelist;
// devolve o caminho normalizado quando seguro.
export function validarCaminhoImagem(caminho: string): string {
  if (typeof caminho !== 'string' || caminho.length === 0 || caminho.length > IMAGEM_PROXY_MAX_CAMINHO) {
    throw createError({ statusCode: 400, statusMessage: 'Caminho de imagem inválido' })
  }
  // Rejeições explícitas antes da regex: traversal, byte nulo, barra invertida, drive letter,
  // segmento vazio interno (//).
  if (
    caminho.includes('..')
    || caminho.includes('\0')
    || caminho.includes('\\')
    || /^[a-zA-Z]:/.test(caminho)
    || caminho.includes('//')
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Caminho de imagem inválido' })
  }
  if (!IMAGEM_PROXY_REGEX_CAMINHO.test(caminho)) {
    throw createError({ statusCode: 400, statusMessage: 'Caminho de imagem inválido' })
  }
  return caminho
}

// Resolve o Content-Type forçado a partir da extensão do caminho já validado.
export function tipoConteudoImagem(caminho: string): string {
  const extensao = caminho.slice(caminho.lastIndexOf('.') + 1).toLowerCase()
  const tipo = IMAGEM_PROXY_TIPOS[extensao]
  if (!tipo) {
    throw createError({ statusCode: 400, statusMessage: 'Caminho de imagem inválido' })
  }
  return tipo
}
