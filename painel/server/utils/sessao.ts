// server/utils/sessao.ts — Camada de sessão do painel sobre o nuxt-auth-utils (cookie httpOnly).
// Encapsula setUserSession/getUserSession/clearUserSession com o payload SessaoUsuario (id, nome,
// email, nomeLoja, admin, imagemLoja) — NUNCA a senha. Centraliza o formato da sessão para o
// login gravar e a autorização anti-IDOR ler (design §4.3).

import type { H3Event } from 'h3'
import type { SessaoUsuario } from '#shared/types/usuario'

// Tipa o payload da sessão do nuxt-auth-utils com o nosso SessaoUsuario (sem senha).
declare module '#auth-utils' {
  interface User extends SessaoUsuario {}
}

// Grava a sessão httpOnly assinada com o subconjunto seguro do usuário (sem senha).
export async function gravarSessao(event: H3Event, usuario: SessaoUsuario): Promise<void> {
  await setUserSession(event, { user: usuario })
}

// Lê a sessão atual; retorna o usuário logado ou null quando não houver sessão.
export async function lerSessao(event: H3Event): Promise<SessaoUsuario | null> {
  const sessao = await getUserSession(event)
  return (sessao?.user as SessaoUsuario | undefined) ?? null
}

// Encerra a sessão (logout): limpa o cookie assinado.
export async function encerrarSessao(event: H3Event): Promise<void> {
  await clearUserSession(event)
}
