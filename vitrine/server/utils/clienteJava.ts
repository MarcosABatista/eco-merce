// server/utils/clienteJava.ts — Cliente server-only (BFF) para o backend Java da vitrine.
// chamarJava faz $fetch ao Java com apiBaseUrl de runtimeConfig e timeout de 30s; mapearErroJava
// traduz o status do Java para erro genérico ao cliente (nunca repassa stack/mensagem bruta).
// Único ponto de contato Nitro -> Java (RF-ARQ-2): o browser jamais fala direto com o Java.

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

// Repassa uma requisição ao backend Java e devolve o JSON tipado. Em erro, delega ao
// mapearErroJava, que converte para um createError genérico (sem vazar detalhe interno).
export async function chamarJava<T>(
  event: H3Event,
  caminho: string,
  opcoes: OpcoesChamadaJava = {},
): Promise<T> {
  const { apiBaseUrl } = useRuntimeConfig(event)
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

// Mapeia o erro do $fetch (status do Java, rede ou timeout) para um erro de borda genérico.
// Loga o detalhe server-side; o cliente recebe apenas status + mensagem pt-BR não técnica.
export function mapearErroJava(erro: unknown, caminho = '') {
  const status = statusDoErro(erro)

  // Log server-side com o detalhe real (nunca enviado ao cliente).
  console.error('[BFF] falha no repasse ao Java', {
    caminho,
    status: status ?? 'rede/timeout',
    detalhe: erro instanceof Error ? erro.message : String(erro),
  })

  if (status === 400) {
    return createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }
  if (status === 404) {
    return createError({ statusCode: 404, statusMessage: 'Recurso não encontrado' })
  }
  // 5xx, rede, timeout ou status inesperado -> 502 genérico (serviço indisponível).
  return createError({ statusCode: 502, statusMessage: 'Serviço temporariamente indisponível' })
}
