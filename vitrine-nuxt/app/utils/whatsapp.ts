// app/utils/whatsapp.ts — Normalização canônica do telefone e montagem do link wa.me (RF-VIT-9).
// formatarNumeroWhatsapp aplica, nesta ordem exata: strip de não-dígitos; remoção de um "0"
// inicial; "55"+12/13 as-is; senão 10/11 -> prefixa "55"; qualquer outro caso -> null (botão
// oculto). montarUrlWhatsapp encoda a mensagem. Limites vêm de #shared; invariantes em §11.

import {
  WHATSAPP_DDI,
  WHATSAPP_MAX_DIGITOS_COM_DDI,
  WHATSAPP_MAX_DIGITOS_LOCAL,
  WHATSAPP_MENSAGEM_PREFIXO,
  WHATSAPP_MIN_DIGITOS_COM_DDI,
  WHATSAPP_MIN_DIGITOS_LOCAL,
} from '#shared/constants/whatsapp'

// Normaliza o telefone para a forma "55" + 10/11 dígitos. Retorna null quando inválido (o chamador
// deve ocultar o botão). Ordem dos passos é normativa (design RF-VIT-9).
export function formatarNumeroWhatsapp(telefone: string | null | undefined): string | null {
  if (!telefone) {
    return null
  }

  // 1. remover tudo que não é dígito.
  let digitos = telefone.replace(/\D/g, '')
  if (digitos.length === 0) {
    return null
  }

  // 2. remover um "0" inicial (ANTES de checar o prefixo "55" — caso-âncora "05511999998888").
  if (digitos.startsWith('0')) {
    digitos = digitos.slice(1)
  }

  // 3. já começa com "55" e tem 12/13 dígitos -> usar como está (não reaplicar o DDI).
  if (
    digitos.startsWith(WHATSAPP_DDI)
    && digitos.length >= WHATSAPP_MIN_DIGITOS_COM_DDI
    && digitos.length <= WHATSAPP_MAX_DIGITOS_COM_DDI
  ) {
    return digitos
  }

  // 4. número local de 10/11 dígitos (sem DDI) -> prefixar "55".
  if (
    digitos.length >= WHATSAPP_MIN_DIGITOS_LOCAL
    && digitos.length <= WHATSAPP_MAX_DIGITOS_LOCAL
  ) {
    return WHATSAPP_DDI + digitos
  }

  // 5. qualquer outro caso (menos de 10 ou mais de 11 sem DDI) -> inválido.
  return null
}

// Monta a URL wa.me com a mensagem pré-preenchida (encodeURIComponent). Retorna null se o telefone
// for inválido, caso em que o botão não deve ser renderizado.
export function montarUrlWhatsapp(
  telefone: string | null | undefined,
  nomeProduto: string | null | undefined,
): string | null {
  const numero = formatarNumeroWhatsapp(telefone)
  if (!numero) {
    return null
  }

  const mensagem = WHATSAPP_MENSAGEM_PREFIXO + (nomeProduto ?? '')
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}
