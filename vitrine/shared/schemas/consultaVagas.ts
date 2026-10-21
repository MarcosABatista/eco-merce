// shared/schemas/consultaVagas.ts — Schema Zod isomórfico da consulta de vagas da vitrine.
// Valida os parâmetros de GET /api/vagas antes do repasse ao Java (borda do BFF): page>=0,
// size 1..50, categoria opcional e usuarioId opcional (filtro por loja). Mensagens pt-BR via { error }.
import { z } from 'zod'
import { CATEGORIAS_VALORES } from '../constants/categorias'

// Enum de categoria derivado da fonte única CATEGORIAS (whitelist server-side).
const categoriaEnum = z.enum(
  CATEGORIAS_VALORES as unknown as [string, ...string[]],
  { error: 'Categoria inválida.' },
)

// Query da grade de vagas: page/size com defaults; categoria e usuarioId opcionais.
export const consultaVagasSchema = z.object({
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
  usuarioId: z.number({ error: 'ID da loja inválido.' })
    .int('ID da loja deve ser um inteiro.')
    .positive('ID da loja deve ser maior que zero.')
    .optional(),
})

export type ConsultaVagas = z.infer<typeof consultaVagasSchema>
