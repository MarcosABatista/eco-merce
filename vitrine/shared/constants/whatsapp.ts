// shared/constants/whatsapp.ts — Limites e textos canônicos do link WhatsApp da vitrine (RF-VIT-9).
// Fonte única das faixas de dígitos da regra de normalização (10/11 sem DDI; 12/13 com DDI "55")
// e do template de mensagem. Isomórfica (app + testes), importável via #shared. Evita literais
// espalhados entre o helper e os property tests (steering nomenclatura-constantes).

// Faixa de dígitos do número local (sem o DDI "55"): DDD + assinante.
export const WHATSAPP_MIN_DIGITOS_LOCAL = 10
export const WHATSAPP_MAX_DIGITOS_LOCAL = 11

// DDI do Brasil e faixa de dígitos quando o número já vem com o "55" na frente.
export const WHATSAPP_DDI = '55'
export const WHATSAPP_MIN_DIGITOS_COM_DDI = 12
export const WHATSAPP_MAX_DIGITOS_COM_DDI = 13

// Template da mensagem pré-preenchida (interpolado com o nome do produto antes do encode).
export const WHATSAPP_MENSAGEM_PREFIXO = 'Olá! Tenho interesse no produto: '

// Verde oficial da marca WhatsApp (única hex solta autorizada pela spec — RF-VIT-9/RNF-2).
export const WHATSAPP_COR_MARCA = '#25D366'
