export function useFormatters() {
  const priceFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  function formatPrice(value: number): string {
    return priceFormatter.format(value)
  }

  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text
    }
    return text.slice(0, maxLength) + '\u2026'
  }

  return { formatPrice, truncateText }
}
