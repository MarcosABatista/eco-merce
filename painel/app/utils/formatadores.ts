// app/utils/formatadores.ts — Formatadores puros de apresentação do painel.
// formatarPreco converte um valor numérico em moeda BRL pt-BR (prefixo R$, vírgula decimal).
// Auto-importado no app (Nuxt). Pequena duplicação com a vitrine aceita em troca de apps
// independentes (design §1).

// Formatador BRL pt-BR único (instanciado uma vez; reusado em cada chamada).
const PRECO_FORMATADOR = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

// Formata um valor numérico como moeda brasileira (ex.: 1234.5 -> "R$ 1.234,50").
export function formatarPreco(valor: number): string {
  return PRECO_FORMATADOR.format(valor)
}
