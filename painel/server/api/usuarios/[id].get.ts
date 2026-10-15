// server/api/usuarios/[id].get.ts — Detalhe de um usuário/perfil para edição (BFF).
// Exige sessão e autorização dono-ou-admin (anti-IDOR) antes de repassar a GET /usuarios/{id}.
// Base do fluxo "editar perfil" (design §4.3/RF-PAI-7). O UsuarioResponse do Java nunca traz senha.

import type { Usuario } from '#shared/types/usuario'

export default defineEventHandler(async (event): Promise<Usuario> => {
  const sessao = await exigirSessao(event)
  const id = validarIdInteiro(getRouterParam(event, 'id'))
  exigirDonoOuAdmin(sessao, id)

  return chamarJava<Usuario>(event, `/usuarios/${id}`, { method: 'GET' })
})

// curl:
//   # Carrega o usuário 7 para edição (cookie de sessão; só o próprio ou admin):
//   curl -s -b cookies.txt 'http://localhost:3000/api/usuarios/7'
//   # Respostas: 200 { id, cpfCnpj, nome, email, nomeLoja, ativo, admin, imagemLoja, ... }
//   #            400 { statusMessage: "Identificador inválido" }
//   #            401 { statusMessage: "Não autenticado" }
//   #            403 { statusMessage: "Acesso negado" }  (id de outro usuário sem ser admin)
