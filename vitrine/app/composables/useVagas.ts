// app/composables/useVagas.ts — Estado e lógica da listagem de vagas da vitrine.
// Acumula páginas via $fetch client-side, expõe temMaisPaginas, filtro por categoria e loja
// (usuarioId) server-side e busca por nome client-side sobre o conjunto carregado. useState.
import { computed } from 'vue'
import { anexarProdutos, temMaisPaginas as calcularTemMaisPaginas } from '#shared/utils/paginacaoProdutos'
import type { PageResponse, Vaga } from '#shared/types/vaga'

// Tamanho de página fixo da grade (size=20 por carga).
const VAGAS_TAMANHO_PAGINA = 20

export function useVagas() {
  const vagas = useState<Vaga[]>('vitrine-vagas', () => [])
  const paginaAtual = useState<number>('vitrine-vagas-pagina', () => 0)
  const totalPaginas = useState<number>('vitrine-vagas-total-paginas', () => 0)
  const categoriaAtiva = useState<string | null>('vitrine-vagas-categoria', () => null)
  const lojaAtiva = useState<number | null>('vitrine-vagas-loja', () => null)
  const termoBusca = useState<string>('vitrine-vagas-busca', () => '')
  const carregandoMais = useState<boolean>('vitrine-vagas-carregando-mais', () => false)

  // Vagas exibidas: só ativas, filtradas por termo de busca (nome da vaga ou da loja).
  const vagasFiltradas = computed<Vaga[]>(() => {
    const alvo = termoBusca.value.trim().toLowerCase()
    return vagas.value
      .filter(v => v.ativo)
      .filter(v => {
        if (!alvo) return true
        const emCargo = v.cargo.toLowerCase().includes(alvo)
        const emLoja = (v.nomeLoja ?? '').toLowerCase().includes(alvo)
        return emCargo || emLoja
      })
  })

  // Há mais páginas no servidor para "Carregar mais".
  const temMaisPaginas = computed(() =>
    calcularTemMaisPaginas(paginaAtual.value, totalPaginas.value),
  )

  // true quando uma busca client-side não casou nada mas há itens carregados.
  const buscaSemResultado = computed(() =>
    termoBusca.value.trim().length > 0
    && vagas.value.filter(v => v.ativo).length > 0
    && vagasFiltradas.value.length === 0,
  )

  // Lojas distintas das vagas carregadas (para o filtro da barra lateral).
  const lojasDisponiveis = computed(() => {
    const mapa = new Map<number, string>()
    for (const v of vagas.value) {
      if (v.nomeLoja && v.usuarioId != null) {
        mapa.set(v.usuarioId, v.nomeLoja)
      }
    }
    return Array.from(mapa.entries()).map(([usuarioId, nomeLoja]) => ({ usuarioId, nomeLoja }))
  })

  // Categorias distintas das vagas carregadas (para o filtro da barra lateral).
  const categoriasDisponiveis = computed(() => {
    const set = new Set<string>()
    for (const v of vagas.value) {
      if (v.categoria) set.add(v.categoria)
    }
    return Array.from(set).sort()
  })

  // Substitui o conjunto a partir de uma PageResponse (primeira carga / troca de filtro).
  function definirPagina(resposta: PageResponse<Vaga>): void {
    vagas.value = resposta.content
    paginaAtual.value = resposta.page
    totalPaginas.value = resposta.totalPages
  }

  // Anexa a próxima página sem remover itens já carregados.
  function anexarPagina(resposta: PageResponse<Vaga>): void {
    vagas.value = anexarProdutos(vagas.value, resposta.content)
    paginaAtual.value = resposta.page
    totalPaginas.value = resposta.totalPages
  }

  // Zera o estado da listagem (nova busca de servidor / troca de filtro).
  function reiniciar(): void {
    vagas.value = []
    paginaAtual.value = 0
    totalPaginas.value = 0
  }

  // Define a categoria ativa; clicar na mesma remove o filtro (toggle).
  function alternarCategoria(categoria: string): void {
    categoriaAtiva.value = categoriaAtiva.value === categoria ? null : categoria
  }

  // Define a loja ativa; clicar na mesma remove o filtro (toggle).
  function alternarLoja(usuarioId: number): void {
    lojaAtiva.value = lojaAtiva.value === usuarioId ? null : usuarioId
  }

  // Query do BFF para a próxima carga (filtros server-side quando ativos).
  function queryProxima(pagina: number): Record<string, string | number> {
    const query: Record<string, string | number> = {
      page: pagina,
      size: VAGAS_TAMANHO_PAGINA,
    }
    if (categoriaAtiva.value) {
      query.categoria = categoriaAtiva.value
    }
    if (lojaAtiva.value != null) {
      query.usuarioId = lojaAtiva.value
    }
    return query
  }

  // Carrega a próxima página via $fetch client-side e anexa ao conjunto.
  async function carregarMais(): Promise<void> {
    if (carregandoMais.value || !temMaisPaginas.value) {
      return
    }
    carregandoMais.value = true
    try {
      const proxima = paginaAtual.value + 1
      const resposta = await $fetch<PageResponse<Vaga>>('/api/vagas', {
        query: queryProxima(proxima),
      })
      anexarPagina(resposta)
    }
    finally {
      carregandoMais.value = false
    }
  }

  return {
    vagas,
    paginaAtual,
    totalPaginas,
    categoriaAtiva,
    lojaAtiva,
    termoBusca,
    carregandoMais,
    vagasFiltradas,
    temMaisPaginas,
    buscaSemResultado,
    lojasDisponiveis,
    categoriasDisponiveis,
    definirPagina,
    anexarPagina,
    reiniciar,
    alternarCategoria,
    alternarLoja,
    queryProxima,
    carregarMais,
    VAGAS_TAMANHO_PAGINA,
  }
}
