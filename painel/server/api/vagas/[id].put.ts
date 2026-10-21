// server/api/vagas/[id].put.ts — Edita uma vaga do lojista (BFF).
// Exige sessão, valida CSRF (_token) e atualizacaoVagaSchema, e confirma a PROPRIEDADE da
// vaga (anti-IDOR) antes de repassar a PUT /vagas/{id}. Vaga de outro dono -> 403 sem
// repassar a escrita ao Java (design §4.3/§7.7).
import { atualizacaoVagaSchema } from '#shared/schemas/vaga'
import type { Vaga } from '#shared/types/vaga'

export default defineEventHandler(async (event): Promise<Vaga> => {
  const sessao = await exigirSessao(event)
  const id = validarIdInteiro(getRouterParam(event, 'id'))
  const { encryptionKey } = useRuntimeConfig(event)

  const corpo = await readBody(event)
  const resultado = atualizacaoVagaSchema.safeParse(corpo)
  if (!resultado.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }
  if (!validarTokenCsrf(resultado.data._token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  // Propriedade: só o dono (ou admin) edita; senão 403 sem repassar a escrita.
  if (!(await exigirVagaDoDono(event, sessao, id))) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  const { _token, ...dados } = resultado.data
  return chamarJava<Vaga>(event, `/vagas/${id}`, { method: 'PUT', body: dados })
})

// curl:
//   # Edita a vaga 42 (cookie de sessão + _token CSRF; só dono/admin):
//   curl -s -b cookies.txt -X PUT 'http://localhost:3000/api/vagas/42' \
//     -H 'Content-Type: application/json' \
//     -d '{"cargo":"Vendedor Sênior","descricao":"Atendimento e vendas","categoria":"VESTUARIO","ativo":true,"_token":"<timestamp.hmac>"}'
//   # Respostas: 200 { id, cargo, descricao, ... }
//   #            400 { statusMessage: "Dados inválidos" } / "Identificador inválido"
//   #            401 { statusMessage: "Não autenticado" }
//   #            403 { statusMessage: "Acesso negado" }  (CSRF inválido OU vaga de outro dono)
