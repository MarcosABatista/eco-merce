// server/utils/clienteJava.ts — Cliente server-only (BFF) para o backend Java do painel.
// chamarJava faz $fetch ao Java com apiBaseUrl de runtimeConfig e timeout de 30s; mapearErroJava
// traduz o status do Java sem vazar stack/mensagem bruta. O 409 (duplicado) é tratado à parte:
// identifica o campo colidido por match de palavra na message (email/cpfCnpj) e descarta o valor.

import type { H3Event } from 'h3'
import { TEMPO_LIMITE_JAVA_MS } from '#shared/constants/bff'

// Opções aceitas no repasse (subconjunto do $fetch): método, query, corpo e headers.
export interface OpcoesChamadaJava {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: Record<string, unknown>
  body?: unknown
  headers?: Record<string, string>
}

// Extrai o status HTTP de um erro do $fetch (ofetch), quando houver.
function statusDoErro(erro: unknown): number | undefined {
  const e = erro as { statusCode?: number, response?: { status?: number } }
  return e?.statusCode ?? e?.response?.status
}

// Extrai a message bruta do corpo de erro do Java (ErrorResponse.message), quando houver.
function messageDoErro(erro: unknown): string {
  const e = erro as { data?: { message?: unknown } }
  const msg = e?.data?.message
  return typeof msg === 'string' ? msg : ''
}

// Repassa uma requisição ao backend Java e devolve o JSON tipado. Em erro, delega ao
// mapearErroJava, que converte para um createError genérico (sem vazar detalhe interno).
export async function chamarJava<T>(
  event: H3Event,
  caminho: string,
  opcoes: OpcoesChamadaJava = {},
): Promise<T> {
  const { apiBaseUrl } = useRuntimeConfig(event)
  // Guarda de configuração: sem apiBaseUrl (NUXT_API_BASE_URL ausente) o $fetch cairia em URL
  // relativa e bateria no PRÓPRIO Nuxt — o POST "parece" dar certo (302->/login) mas nada chega
  // ao Java/banco. Falhamos alto aqui para a má configuração nunca se disfarçar de sucesso.
  if (!apiBaseUrl) {
    console.error('[BFF] NUXT_API_BASE_URL não configurado — chamada ao Java abortada', { caminho })
    throw createError({ statusCode: 500, statusMessage: 'Backend não configurado (NUXT_API_BASE_URL ausente)' })
  }
  // Tipagem larga do $fetch: a URL é um host externo (Java), não uma rota interna tipada do
  // Nitro — a inferência de rota tipada estoura "excessive stack depth" com string dinâmica.
  const buscar = $fetch as unknown as (url: string, opts: Record<string, unknown>) => Promise<T>
  try {
    return await buscar(apiBaseUrl + caminho, {
      timeout: TEMPO_LIMITE_JAVA_MS,
      method: opcoes.method,
      query: opcoes.query,
      body: opcoes.body as Record<string, unknown> | undefined,
      headers: opcoes.headers,
    })
  }
  catch (erro) {
    throw mapearErroJava(erro, caminho)
  }
}

// Mapeia o erro do $fetch para um erro de borda genérico (ou de campo, no caso do 409 duplicado).
// Loga o detalhe real server-side; o cliente recebe status + mensagem pt-BR não técnica.
export function mapearErroJava(erro: unknown, caminho = '') {
  const status = statusDoErro(erro)

  console.error('[BFF] falha no repasse ao Java', {
    caminho,
    status: status ?? 'rede/timeout',
    detalhe: erro instanceof Error ? erro.message : String(erro),
  })

  // 409 duplicado: o Java traz o campo colidido apenas embutido na message livre
  // ("Já existe um registro com {campo}: {valor}"). Identificamos o campo por MATCH DE PALAVRA,
  // descartando o valor bruto (info disclosure). errors do Java é null — não é fonte confiável.
  if (status === 409) {
    const message = messageDoErro(erro)
    if (/\bemail\b/i.test(message)) {
      return createError({
        statusCode: 409,
        statusMessage: 'Conflito',
        data: { fieldErrors: [{ field: 'email', message: 'Este e-mail já está cadastrado.' }] },
      })
    }
    if (/\bcpfcnpj\b/i.test(message)) {
      return createError({
        statusCode: 409,
        statusMessage: 'Conflito',
        data: { fieldErrors: [{ field: 'cpfCnpj', message: 'Este CPF/CNPJ já está cadastrado.' }] },
      })
    }
    return createError({ statusCode: 409, statusMessage: 'Registro já existe.' })
  }

  if (status === 400) {
    return createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }
  if (status === 404) {
    return createError({ statusCode: 404, statusMessage: 'Recurso não encontrado' })
  }
  // 5xx, rede, timeout ou status inesperado -> 502 genérico (serviço indisponível).
  return createError({ statusCode: 502, statusMessage: 'Serviço temporariamente indisponível' })
}
