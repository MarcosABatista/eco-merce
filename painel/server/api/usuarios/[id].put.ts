// server/api/usuarios/[id].put.ts — Edita o perfil/usuário (BFF).
// Exige sessão, valida CSRF (_token) e atualizacaoUsuarioSchema, e exige autorização dono-ou-admin
// (anti-IDOR) antes de repassar a PUT /usuarios/{id}. Ao editar o próprio perfil, atualiza o
// subconjunto da sessão (nome/email/nomeLoja/imagemLoja) para refletir a mudança (design §4.3/RF-PAI-7).

import { atualizacaoUsuarioSchema } from '#shared/schemas/usuario'
import type { Usuario } from '#shared/types/usuario'

export default defineEventHandler(async (event): Promise<Usuario> => {
  const sessao = await exigirSessao(event)
  const id = validarIdInteiro(getRouterParam(event, 'id'))
  const { encryptionKey } = useRuntimeConfig(event)

  const corpo = await readBody(event)
  const resultado = atualizacaoUsuarioSchema.safeParse(corpo)
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }
  if (!validarTokenCsrf(resultado.data._token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }
  exigirDonoOuAdmin(sessao, id)

  const { _token, ...dados } = resultado.data
  const atualizado = await chamarJava<Usuario>(event, `/usuarios/${id}`, { method: 'PUT', body: dados })

  // Ao editar o próprio perfil, refletir os dados na sessão (nunca a senha).
  if (id === sessao.id) {
    await gravarSessao(event, {
      id: atualizado.id,
      nome: atualizado.nome,
      email: atualizado.email,
      nomeLoja: atualizado.nomeLoja,
      admin: atualizado.admin,
      ativo: atualizado.ativo,
      imagemLoja: atualizado.imagemLoja,
    })
  }

  return atualizado
})

// curl:
//   # Edita o perfil 7 (cookie de sessão + _token CSRF; só o próprio ou admin; senha em branco omitida):
//   curl -s -b cookies.txt -X PUT 'http://localhost:3000/api/usuarios/7' \
//     -H 'Content-Type: application/json' \
//     -d '{"nome":"Loja do Cacau LTDA","email":"loja@exemplo.com","_token":"<timestamp.hmac>"}'
//   # Respostas: 200 { id, nome, email, ... } (sessão do próprio perfil é atualizada)
//   #            400 { statusMessage: "Dados inválidos" } / "Identificador inválido"
//   #            401 { statusMessage: "Não autenticado" }
//   #            403 { statusMessage: "Acesso negado" }  (CSRF inválido OU id de outro usuário)
//   #            409 { data: { fieldErrors: [{ field: "email"|"cpfCnpj", message }] } }  (duplicado)
