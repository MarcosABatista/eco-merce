// shared/schemas/usuario.ts — Schema Zod isomórfico do cadastro de usuário/lojista do painel.
// Regras alinhadas ao CreateUsuarioRequest do Java: cpfCnpj com 11 (CPF) ou 14 (CNPJ) dígitos,
// nome >= 3, email válido, senha >= 8, flags ativo/admin. Toda escrita carrega _token (CSRF).
// Mensagens pt-BR via { error } (Zod v4), cobrindo campo intocado (undefined).

import { z } from 'zod'

// Token CSRF HMAC stateless presente em todo payload de escrita (steering nuxt-server-csrf).
const tokenCsrf = z.string({ error: 'Token de segurança ausente.' }).min(1).max(200)

export const usuarioSchema = z.object({
  cpfCnpj: z.string({ error: 'CPF/CNPJ é obrigatório.' })
    .trim()
    .regex(/^(?:\d{11}|\d{14})$/, 'CPF/CNPJ deve ter 11 (CPF) ou 14 (CNPJ) dígitos.'),
  nome: z.string({ error: 'Nome é obrigatório.' })
    .trim()
    .min(3, 'Nome deve ter no mínimo 3 caracteres.')
    .max(150, 'Nome deve ter no máximo 150 caracteres.'),
  email: z.email({ error: 'E-mail inválido.' }).max(255, 'E-mail muito longo.'),
  telefone: z.string().trim().max(20, 'Telefone deve ter no máximo 20 caracteres.').nullable().optional(),
  nomeLoja: z.string().trim().max(150, 'Nome da loja muito longo.').nullable().optional(),
  senha: z.string({ error: 'Senha é obrigatória.' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres.')
    .max(100, 'Senha deve ter no máximo 100 caracteres.'),
  ativo: z.boolean().default(true),
  admin: z.boolean().default(false),
  imagemLoja: z.string().trim().max(500, 'URL da imagem muito longa.').nullable().optional(),
  _token: tokenCsrf,
})

export type EntradaUsuario = z.infer<typeof usuarioSchema>
