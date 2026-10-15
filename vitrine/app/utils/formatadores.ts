// app/utils/formatadores.ts — Formatadores puros de apresentação da vitrine.
// formatarPreco: valor numérico -> moeda BRL pt-BR (prefixo R$, vírgula decimal). truncarTexto:
// corta em maxLength preservando entradas curtas e anexando uma única reticência quando excede.
// Auto-importados no app (Nuxt). Invariantes travadas por property tests (design §11).

// Formatador BRL pt-BR único (instanciado uma vez; reusado em cada chamada).
const PRECO_FORMATADOR = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

// Formata um valor numérico como moeda brasileira (ex.: 1234.5 -> "R$ 1.234,50").
export function formatarPreco(valor: number): string {
  return PRECO_FORMATADOR.format(valor)
}

// Trunca texto para no máximo maxLength: <= max fica inalterado; > max vira max chars + "…"
// (reticência única U+2026). Total de max+1 caracteres quando truncado.
export function truncarTexto(texto: string, maxLength: number): string {
  if (texto.length <= maxLength) {
    return texto
  }
  return texto.slice(0, maxLength) + '\u2026'
}
