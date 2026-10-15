// server/api/sessao/me.get.ts — Devolve o usuário logado para hidratar o estado do cliente (BFF).
// Lê apenas a sessão httpOnly (NÃO chama o Java). Sem sessão -> 401. Serve ao middleware/estado do
// painel para saber quem está autenticado após reload (design §4.3).

export default defineEventHandler(async (event) => {
  return exigirSessao(event)
})

// curl:
//   # Contrato LOCAL (sem repasse ao Java): precisa do cookie de sessão httpOnly.
//   curl -s -b cookies.txt 'http://localhost:3000/api/sessao/me'
//   # Respostas: 200 { id, nome, email, nomeLoja, admin, imagemLoja }  (sessão válida)
//   #            401 { statusMessage: "Não autenticado" }               (sem cookie de sessão)
