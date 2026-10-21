// shared/schemas/vaga.ts — Schema Zod isomórfico da vaga do painel (UForm + borda do BFF).
// Toda escrita carrega _token (CSRF). Categoria é opcional (steering: filtro da vitrine).
import { z } from 'zod'

// Token CSRF HMAC stateless presente em todo payload de escrita.
const tokenCsrf = z.string({ error: 'Token de segurança ausente.' }).min(1).max(200)

export const vagaSchema = z.object({
  cargo: z.string({ error: 'Cargo é obrigatório.' })
    .trim()
    .min(1, 'Cargo é obrigatório.')
    .max(200, 'Cargo deve ter no máximo 200 caracteres.'),
  descricao: z.string()
    .trim()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres.')
    .nullable()
    .optional(),
  categoria: z.string()
    .trim()
    .max(50, 'Categoria deve ter no máximo 50 caracteres.')
    .nullable()
    .optional(),
  _token: tokenCsrf,
})

export type EntradaVaga = z.infer<typeof vagaSchema>

// Schema de EDIÇÃO: os mesmos campos da vaga + `ativo`.
export const atualizacaoVagaSchema = vagaSchema.safeExtend({
  ativo: z.boolean().optional(),
})

export type EntradaAtualizacaoVaga = z.infer<typeof atualizacaoVagaSchema>
