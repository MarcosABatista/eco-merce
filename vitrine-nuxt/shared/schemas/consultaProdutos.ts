// shared/schemas/consultaProdutos.ts — Schema Zod isomórfico da consulta de produtos da vitrine.
// Valida os parâmetros de GET /api/produtos antes do repasse ao Java (borda do BFF): page>=0,
// size 1..50 (teto da API) e categoria dentro do enum fixo. Mensagens pt-BR via { error } (Zod v4).

import { z } from 'zod'
import { CATEGORIAS_VALORES } from '../constants/categorias'

// Enum de categoria derivado da fonte única CATEGORIAS (whitelist server-side).
const categoriaEnum = z.enum(
  CATEGORIAS_VALORES as unknown as [string, ...string[]],
  { error: 'Categoria inválida.' },
)

// Query da grade: page/size com defaults da spec; categoria opcional.
export const consultaProdutosSchema = z.object({
  page: z.number({ error: 'Página inválida.' })
    .int('Página deve ser um inteiro.')
    .min(0, 'Página deve ser maior ou igual a zero.')
    .default(0),
  size: z.number({ error: 'Tamanho de página inválido.' })
    .int('Tamanho deve ser um inteiro.')
    .min(1, 'Tamanho deve ser no mínimo 1.')
    .max(50, 'Tamanho deve ser no máximo 50.')
    .default(20),
  categoria: categoriaEnum.optional(),
})

export type ConsultaProdutos = z.infer<typeof consultaProdutosSchema>
