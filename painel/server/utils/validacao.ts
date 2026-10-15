// server/utils/validacao.ts — Validações de borda reutilizáveis do BFF do painel.
// Concentra a checagem de identificadores de rota (id/userId) como inteiro positivo, para
// não repetir a regra em cada endpoint. Falha -> 400 genérico (design §7.1).

// Converte e valida um parâmetro de rota como inteiro positivo (> 0). Lança 400 se inválido.
export function validarIdInteiro(valor: string | undefined): number {
  const n = Number(valor)
  if (!valor || !Number.isInteger(n) || n <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identificador inválido' })
  }
  return n
}
