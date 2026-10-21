// server/utils/autorizacao.ts — Autorização por recurso (anti-IDOR) do BFF do painel.
// O Java NÃO verifica dono nas escritas e o ProdutoResponse não traz usuarioId; esta é a única
// borda que impõe propriedade. exigirSessao (401), exigirDonoOuAdmin (403) e exigirProdutoDoDono
// (pagina GET /produtos?usuarioId=sessao.id até achar o id) concentram a regra (design §4.3/§7.7).

import type { H3Event } from 'h3'
import type { SessaoUsuario } from '#shared/types/usuario'
import type { PageResponse as PageResponseProduto, Produto } from '#shared/types/produto'
import type { PageResponse as PageResponseVaga, Vaga } from '#shared/types/vaga'

// Teto de página do backend (Math.min(size, 50)) usado na paginação de verificação de dono.
const AUTORIZACAO_TAMANHO_PAGINA = 50

// Exige uma sessão válida; retorna o usuário logado ou lança 401.
export async function exigirSessao(event: H3Event): Promise<SessaoUsuario> {
  const sessao = await lerSessao(event)
  if (!sessao) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }
  return sessao
}

// Exige que o alvo seja o próprio usuário da sessão OU que a sessão seja admin; senão 403.
export function exigirDonoOuAdmin(sessao: SessaoUsuario, idAlvo: number): void {
  if (idAlvo === sessao.id || sessao.admin) return
  throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
}

// Confirma que o produto pertence à sessão (ou que é admin). Admin curto-circuita sem paginar;
// senão percorre as páginas de /produtos?usuarioId=sessao.id (limite rígido por totalPages) e
// retorna true ao achar o id, false ao esgotar. O caller traduz false em 403.
export async function exigirProdutoDoDono(
  event: H3Event,
  sessao: SessaoUsuario,
  produtoId: number,
): Promise<boolean> {
  if (sessao.admin) return true

  let page = 0
  let totalPages = 1 // provisório; corrigido na 1ª resposta
  do {
    const resposta = await chamarJava<PageResponseProduto<Produto>>(event, '/produtos', {
      method: 'GET',
      query: { usuarioId: sessao.id, page, size: AUTORIZACAO_TAMANHO_PAGINA },
    })
    totalPages = resposta.totalPages
    if (resposta.content.some(p => p.id === produtoId)) return true
    page++
  } while (page < totalPages)

  return false
}

// Confirma que a vaga pertence à sessão (ou que é admin). Admin curto-circuita sem paginar;
// senão percorre as páginas de /vagas?usuarioId=sessao.id (limite rígido por totalPages) e
// retorna true ao achar o id, false ao esgotar. O caller traduz false em 403.
export async function exigirVagaDoDono(
  event: H3Event,
  sessao: SessaoUsuario,
  vagaId: number,
): Promise<boolean> {
  if (sessao.admin) return true

  let page = 0
  let totalPages = 1 // provisório; corrigido na 1ª resposta
  do {
    const resposta = await chamarJava<PageResponseVaga<Vaga>>(event, '/vagas', {
      method: 'GET',
      query: { usuarioId: sessao.id, page, size: AUTORIZACAO_TAMANHO_PAGINA },
    })
    totalPages = resposta.totalPages
    if (resposta.content.some(v => v.id === vagaId)) return true
    page++
  } while (page < totalPages)

  return false
}
