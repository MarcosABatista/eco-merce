/**
 * Normaliza URLs de imagem do MinIO para path relativo via API.
 * Converte URLs absolutas como "http://localhost:9000/place-offers-images/..."
 * para paths relativos como "/api/v1/images/..."
 * que passam pelo backend (proxy de imagens).
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // Se já está no formato da API, retorna como está
  if (url.startsWith('/api/v1/images/')) {
    return url
  }

  // Extrai o objectName de URLs absolutas do MinIO
  // Ex: http://localhost:9000/place-offers-images/uuid.jpeg -> /api/v1/images/uuid.jpeg
  const marker = '/place-offers-images/'
  const idx = url.indexOf(marker)
  if (idx >= 0) {
    const objectName = url.substring(idx + marker.length)
    return '/api/v1/images/' + objectName
  }

  // Fallback: retorna como está
  return url
}
