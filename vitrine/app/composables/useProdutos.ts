// app/composables/useProdutos.ts — Estado e lógica da listagem de produtos da vitrine.
// Acumula páginas via $fetch client-side (append não remove itens), expõe temMaisPaginas
// (currentPage < totalPages-1), filtro de categoria server-side (RF-VIT-3/8) e busca por nome
// client-side case-insensitive sobre o conjunto carregado (RF-VIT-7; limitação MEDIUM-4). useState.

import { computed } from 'vue'
import {
  anexarProdutos,
  filtrarPorNome,
  temMaisPaginas as calcularTemMaisPaginas,
} from '#shared/utils/paginacaoProdutos'
import type { Categoria, PageResponse, Produto } from '#shared/types/produto'

// Tamanho de página fixo da grade (RF-VIT-6: size=20 por carga).
const VITRINE_PRODUTOS_TAMANHO_PAGINA = 20

export function useProdutos() {
  // Estado SSR-friendly e compartilhado entre componentes (chaves estáveis).
  const produtos = useState<Produto[]>('vitrine-produtos', () => [])
  const paginaAtual = useState<number>('vitrine-produtos-pagina', () => 0)
  const totalPaginas = useState<number>('vitrine-produtos-total-paginas', () => 0)
  const categoriaAtiva = useState<Categoria | null>('vitrine-produtos-categoria', () => null)
  const termoBusca = useState<string>('vitrine-produtos-busca', () => '')
  const carregandoMais = useState<boolean>('vitrine-produtos-carregando-mais', () => false)

  // Produtos exibidos: só ativos, filtrados por nome (case-insensitive) sobre o já carregado.
  const produtosFiltrados = computed<Produto[]>(() =>
    filtrarPorNome(produtos.value.filter(p => p.ativo), termoBusca.value),
  )

  // Há mais páginas no servidor para "Carregar mais" (RF-VIT-6).
  const temMaisPaginas = computed(() =>
    calcularTemMaisPaginas(paginaAtual.value, totalPaginas.value),
  )

  // true quando uma busca client-side não casou nada mas há itens carregados (vazio de busca,
  // distinto do catálogo vazio — RF-VIT-4/MEDIUM-4).
  const buscaSemResultado = computed(() =>
    termoBusca.value.trim().length > 0
    && produtos.value.filter(p => p.ativo).length > 0
    && produtosFiltrados.value.length === 0,
  )

  // Substitui o conjunto a partir de uma PageResponse (primeira carga / troca de categoria).
  function definirPagina(resposta: PageResponse<Produto>): void {
    produtos.value = resposta.content
    paginaAtual.value = resposta.page
    totalPaginas.value = resposta.totalPages
  }

  // Anexa a próxima página sem remover itens já carregados (RF-VIT-6).
  function anexarPagina(resposta: PageResponse<Produto>): void {
    produtos.value = anexarProdutos(produtos.value, resposta.content)
    paginaAtual.value = resposta.page
    totalPaginas.value = resposta.totalPages
  }

  // Zera o estado da listagem (nova busca de servidor / troca de categoria).
  function reiniciar(): void {
    produtos.value = []
    paginaAtual.value = 0
    totalPaginas.value = 0
  }

  // Define a categoria ativa; clicar na mesma remove o filtro (toggle — RF-VIT-3).
  function alternarCategoria(categoria: Categoria): void {
    categoriaAtiva.value = categoriaAtiva.value === categoria ? null : categoria
  }

  // Query do BFF para a próxima carga (categoria server-side quando ativa).
  function queryProxima(pagina: number): Record<string, string | number> {
    const query: Record<string, string | number> = {
      page: pagina,
      size: VITRINE_PRODUTOS_TAMANHO_PAGINA,
    }
    if (categoriaAtiva.value) {
      query.categoria = categoriaAtiva.value
    }
    return query
  }

  // Carrega a próxima página via $fetch client-side e anexa ao conjunto. Desabilita durante a
  // requisição; relança o erro para o chamador exibir EstadoErro inline sem derrubar a página.
  async function carregarMais(): Promise<void> {
    if (carregandoMais.value || !temMaisPaginas.value) {
      return
    }
    carregandoMais.value = true
    try {
      const proxima = paginaAtual.value + 1
      const resposta = await $fetch<PageResponse<Produto>>('/api/produtos', {
        query: queryProxima(proxima),
      })
      anexarPagina(resposta)
    }
    finally {
      carregandoMais.value = false
    }
  }

  return {
    produtos,
    paginaAtual,
    totalPaginas,
    categoriaAtiva,
    termoBusca,
    carregandoMais,
    produtosFiltrados,
    temMaisPaginas,
    buscaSemResultado,
    definirPagina,
    anexarPagina,
    reiniciar,
    alternarCategoria,
    queryProxima,
    carregarMais,
    VITRINE_PRODUTOS_TAMANHO_PAGINA,
  }
}
