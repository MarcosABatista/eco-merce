// server/api/produtos/index.post.ts — Cria um produto do lojista logado (BFF).
// Exige sessão, valida CSRF (_token) e produtoSchema (preco>0, precoDesconto>0 E <preco) ANTES do
// Java e FORÇA usuarioId = sessao.id (anti-IDOR). Antecipa usuário inativo pela sessão com mensagem
// clara (o Java recusaria com 400 genérico — design §9/RF-PAI-4). Repassa a POST /produtos.

import { produtoSchema } from '#shared/schemas/produto'
import type { Produto } from '#shared/types/produto'

export default defineEventHandler(async (event): Promise<Produto> => {
  const sessao = await exigirSessao(event)
  const { encryptionKey } = useRuntimeConfig(event)

  const corpo = await readBody(event)
  const resultado = produtoSchema.safeParse(corpo)
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }
  if (!validarTokenCsrf(resultado.data._token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  // Antecipa a recusa do Java para usuário inativo com feedback claro (otimização de UX, §9).
  if (!sessao.ativo) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Sua conta está inativa; não é possível cadastrar produtos.',
    })
  }

  const { _token, ...dados } = resultado.data
  // usuarioId SEMPRE da sessão (o cliente não escolhe o dono).
  return chamarJava<Produto>(event, '/produtos', {
    method: 'POST',
    body: { ...dados, usuarioId: sessao.id },
  })
})

// curl:
//   # Cria produto (precisa do cookie de sessão e do _token CSRF; usuarioId vem da sessão):
//   curl -s -b cookies.txt -X POST 'http://localhost:3000/api/produtos' \
//     -H 'Content-Type: application/json' \
//     -d '{"nome":"Camiseta","preco":79.9,"precoDesconto":59.9,"categoria":"VESTUARIO","_token":"<timestamp.hmac>"}'
//   # Respostas: 201/200 { id, nome, preco, ... }
//   #            400 { statusMessage: "Dados inválidos" }  (schema inválido)
//   #            400 { statusMessage: "Sua conta está inativa; ..." }  (sessão inativa)
//   #            401 { statusMessage: "Não autenticado" }  (sem sessão)
//   #            403 { statusMessage: "Acesso negado" }    (CSRF inválido/expirado)
