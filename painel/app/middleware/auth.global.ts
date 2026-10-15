// app/middleware/auth.global.ts — Guarda global de autenticação do painel.
// Hidrata a sessão httpOnly (useUserSession do nuxt-auth-utils, lastro do GET /api/sessao/me) e
// decide o acesso: rota pública (/login) com sessão -> home; rota protegida sem sessão -> /login.
// Única borda de navegação client/SSR; a autorização por recurso continua no BFF (design §4.3).

// Rotas que NÃO exigem sessão (acessíveis deslogado). As demais são protegidas.
const ROTAS_PUBLICAS = new Set<string>(['/login'])

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch: hidratarSessao } = useUserSession()

  // Garante o estado da sessão a partir do cookie httpOnly antes de decidir (reload/SSR).
  await hidratarSessao()

  const ehPublica = ROTAS_PUBLICAS.has(to.path)

  // Logado tentando abrir o login -> manda para a home do painel.
  if (ehPublica && loggedIn.value) {
    return navigateTo('/')
  }

  // Rota protegida sem sessão -> login.
  if (!ehPublica && !loggedIn.value) {
    return navigateTo('/login')
  }
})
