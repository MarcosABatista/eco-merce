export interface WhatsAppLinkResult {
  /** URL completa do WhatsApp (null se telefone inválido) */
  whatsappUrl: string | null
  /** Se o telefone é válido para gerar link */
  isValid: boolean
}

/**
 * Strips all non-numeric characters from the phone string,
 * removes a leading "0", prepends "55" if not already present,
 * and validates digit count.
 *
 * Returns the formatted number (12-13 digits starting with "55") or null if invalid.
 */
export function formatWhatsAppNumber(telefone: string | null | undefined): string | null {
  if (!telefone) return null

  // Strip all non-numeric characters
  let digits = telefone.replace(/\D/g, '')

  if (digits.length === 0) return null

  // Remove leading "0"
  if (digits.startsWith('0')) {
    digits = digits.substring(1)
  }

  // If already starts with "55" and total length is 12-13, use as-is
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits
  }

  // Validate digit count: must be 10 or 11 digits (area code + number)
  if (digits.length < 10 || digits.length > 11) {
    return null
  }

  // Prepend "55" country code
  return '55' + digits
}

/**
 * Builds the full WhatsApp URL with the formatted number and encoded message.
 * Returns null if the phone number is invalid.
 */
export function buildWhatsAppUrl(
  telefone: string | null | undefined,
  nomeProduto: string | null | undefined
): string | null {
  const number = formatWhatsAppNumber(telefone)
  if (!number) return null

  const nome = nomeProduto ?? ''
  const message = `Olá! Tenho interesse no produto: ${nome}`
  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${number}?text=${encodedMessage}`
}

/**
 * Composable that provides WhatsApp link generation and validation.
 */
export function useWhatsAppLink(
  telefone: string | null | undefined,
  nomeProduto: string | null | undefined
): WhatsAppLinkResult {
  const whatsappUrl = buildWhatsAppUrl(telefone, nomeProduto)

  return {
    whatsappUrl,
    isValid: whatsappUrl !== null,
  }
}
