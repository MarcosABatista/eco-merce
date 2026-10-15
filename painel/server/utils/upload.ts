// server/utils/upload.ts — Validação de upload de imagem do painel por magic number (BFF).
// Rejeita o Content-Type do cliente como prova: inspeciona os bytes iniciais (ffd8ff JPG /
// 89504e47 PNG), aplica whitelist jpg/jpeg/png e limita o tamanho. Deriva o filename sintético
// (imagem.jpg/imagem.png) do magic para o objectName do Java terminar em extensão raster (§7.4).

// Tamanho máximo do arquivo de upload: 5 MB (defesa contra abuso de memória/disco).
export const UPLOAD_TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024

// Resultado da validação: tipo MIME forçado e filename sintético derivado do conteúdo real.
export interface ImagemValidada {
  tipo: 'image/jpeg' | 'image/png'
  filename: 'imagem.jpg' | 'imagem.png'
}

// Detecta o tipo real pelos magic numbers; retorna null quando não é JPEG nem PNG.
function detectarMagic(bytes: Uint8Array): ImagemValidada | null {
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { tipo: 'image/jpeg', filename: 'imagem.jpg' }
  }
  // PNG: 89 50 4E 47
  if (
    bytes.length >= 4
    && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47
  ) {
    return { tipo: 'image/png', filename: 'imagem.png' }
  }
  return null
}

// Valida os bytes do arquivo enviado. Lança 400 por tamanho ou assinatura inválida; devolve o
// tipo MIME forçado e o filename sintético quando o conteúdo real é JPEG/PNG.
export function validarImagemUpload(bytes: Uint8Array): ImagemValidada {
  if (bytes.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo vazio' })
  }
  if (bytes.length > UPLOAD_TAMANHO_MAXIMO_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo acima do tamanho máximo' })
  }
  const detectado = detectarMagic(bytes)
  if (!detectado) {
    throw createError({ statusCode: 400, statusMessage: 'Assinatura do arquivo inválida' })
  }
  return detectado
}
