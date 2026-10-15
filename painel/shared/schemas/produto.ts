// shared/schemas/produto.ts — Schema Zod isomórfico do produto do painel (UForm + borda do BFF).
// Regras de preço/desconto mais estritas que o Java (MEDIUM-2): preco > 0 e <= 9.999.999,99 com
// 2 casas; precoDesconto, quando informado, > 0 E < preco. Toda escrita carrega _token (CSRF).
// Mensagens pt-BR via { error } (Zod v4), cobrindo campo intocado (undefined).

import { z } from 'zod'
import { CATEGORIAS_VALORES } from '../constants/categorias'

// Teto de preço do domínio (NUMERIC(10,2) do banco: 9.999.999,99).
const PRODUTO_PRECO_MAXIMO = 9_999_999.99

// Enum de categoria derivado da fonte única CATEGORIAS (whitelist server-side).
const categoriaEnum = z.enum(
  CATEGORIAS_VALORES as unknown as [string, ...string[]],
  { error: 'Categoria é obrigatória.' },
)

// Token CSRF HMAC stateless presente em todo payload de escrita (steering nuxt-server-csrf).
const tokenCsrf = z.string({ error: 'Token de segurança ausente.' }).min(1).max(200)

export const produtoSchema = z.object({
  nome: z.string({ error: 'Nome é obrigatório.' })
    .trim()
    .min(1, 'Nome é obrigatório.')
    .max(200, 'Nome deve ter no máximo 200 caracteres.'),
  descricao: z.string()
    .trim()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres.')
    .nullable()
    .optional(),
  preco: z.number({ error: 'Preço é obrigatório.' })
    .positive('Preço deve ser maior que zero.')
    .max(PRODUTO_PRECO_MAXIMO, 'Preço acima do máximo permitido.'),
  precoDesconto: z.number({ error: 'Preço com desconto inválido.' })
    .positive('Preço com desconto deve ser maior que zero.')
    .max(PRODUTO_PRECO_MAXIMO, 'Preço com desconto acima do máximo permitido.')
    .nullable(),
  categoria: categoriaEnum,
  urlImagem: z.string().trim().max(500, 'URL da imagem muito longa.').nullable().optional(),
  _token: tokenCsrf,
}).refine(
  dados => dados.precoDesconto == null || dados.precoDesconto < dados.preco,
  { error: 'Desconto deve ser menor que o preço.', path: ['precoDesconto'] },
)

export type EntradaProduto = z.infer<typeof produtoSchema>
