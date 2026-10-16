<!-- app/pages/index.vue — Home da vitrine: banner, categorias, grade e "Carregar mais" (RF-VIT 1-7). -->
<!-- useFetch('/api/produtos') é NÃO-FATAL: captura error/status e mostra EstadoErro inline no slot -->
<!-- da grade, sem throw/createError, para não derrubar cabeçalho/busca/categorias nem cair em -->
<!-- error.vue (design §9/MEDIUM-6). Categoria server-side; busca por nome client-side. -->

<script setup lang="ts">
import { computed, watch } from 'vue'
import {
  VITRINE_MSG_BUSCA_VAZIA,
  VITRINE_MSG_BUSCA_VAZIA_DICA,
  VITRINE_MSG_ERRO_GRADE,
  VITRINE_MSG_SEM_PRODUTOS,
  VITRINE_TITULO_OFERTAS,
} from '#shared/constants/vitrine'
import { CATEGORIAS_VALORES } from '#shared/constants/categorias'
import type { Categoria, PageResponse, Produto } from '#shared/types/produto'

const route = useRoute()

const {
  produtosFiltrados,
  categoriaAtiva,
  termoBusca,
  carregandoMais,
  temMaisPaginas,
  buscaSemResultado,
  produtos,
  definirPagina,
  reiniciar,
  alternarCategoria,
  queryProxima,
  carregarMais,
} = useProdutos()

// Pré-seleciona a categoria vinda do detalhe (?categoria=...) quando válida.
const categoriaInicial = computed<Categoria | null>(() => {
  const q = route.query.categoria
  const valor = Array.isArray(q) ? q[0] : q
  return valor && CATEGORIAS_VALORES.includes(valor as Categoria) ? (valor as Categoria) : null
})
if (categoriaInicial.value && categoriaAtiva.value !== categoriaInicial.value) {
  categoriaAtiva.value = categoriaInicial.value
}

// Carga SSR + hidratação da primeira página. NÃO-FATAL: não lança; erro vira EstadoErro inline.
const { data, status, error, refresh } = await useFetch<PageResponse<Produto>>('/api/produtos', {
  query: computed(() => queryProxima(0)),
})

// Semeia o estado do composable a partir da resposta (primeira página / troca de categoria).
watch(data, (resposta) => {
  if (resposta) {
    definirPagina(resposta)
  }
}, { immediate: true })

const carregando = computed(() => status.value === 'pending')
const temErro = computed(() => !!error.value)
// Catálogo realmente vazio (sem erro, sem itens carregados e sem busca ativa).
const catalogoVazio = computed(() =>
  !carregando.value && !temErro.value && produtos.value.length === 0 && !termoBusca.value.trim(),
)

// Alterna a categoria e recarrega a primeira página server-side.
async function aoAlternarCategoria(categoria: Categoria) {
  alternarCategoria(categoria)
  reiniciar()
  await refresh()
}

// Remove o filtro de categoria ("Todas") e recarrega a primeira página.
async function aoLimparCategoria() {
  if (categoriaAtiva.value === null) return
  categoriaAtiva.value = null
  reiniciar()
  await refresh()
}

// Retry da grade após erro.
async function tentarNovamente() {
  await refresh()
}
</script>

<template>
  <div>
    <VitrineBannerPromocional />

    <UContainer class="flex flex-col gap-8 py-6">
      <!-- Categorias em cards circulares (estilo marketplace); "Todas" limpa o filtro. -->
      <div class="rounded-2xl border border-default bg-default p-4 shadow-sm sm:p-6">
        <VitrineCategoriasPopulares
          :ativa="categoriaAtiva"
          @alternar="aoAlternarCategoria"
          @limpar="aoLimparCategoria"
        />
      </div>

      <section aria-labelledby="titulo-ofertas" data-testid="secao-ofertas">
        <div class="mb-4 flex items-center gap-2">
          <span class="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UIcon name="i-lucide-flame" class="size-5" aria-hidden="true" />
          </span>
          <h2 id="titulo-ofertas" class="text-xl font-bold text-highlighted sm:text-2xl">
            {{ VITRINE_TITULO_OFERTAS }}
          </h2>
          <span
            v-if="!carregando && !temErro && produtosFiltrados.length > 0"
            class="ml-auto text-sm text-muted"
            data-testid="ofertas-contagem"
          >
            {{ produtosFiltrados.length }} {{ produtosFiltrados.length === 1 ? 'produto' : 'produtos' }}
          </span>
        </div>

        <!-- Carregando: esqueletos (>=6). -->
        <VitrineEsqueletosCarregamento v-if="carregando" />

        <!-- Erro da grade: inline, recuperável; cabeçalho/categorias permanecem montados. -->
        <VitrineEstadoErro
          v-else-if="temErro"
          :titulo="VITRINE_MSG_ERRO_GRADE"
          :carregando="carregando"
          @tentar="tentarNovamente"
        />

        <!-- Vazio de busca (há itens, mas o filtro client-side não casou). -->
        <VitrineEstadoVazio
          v-else-if="buscaSemResultado"
          :titulo="VITRINE_MSG_BUSCA_VAZIA"
          :dica="temMaisPaginas ? VITRINE_MSG_BUSCA_VAZIA_DICA : undefined"
        />

        <!-- Vazio de catálogo (nenhum produto). -->
        <VitrineEstadoVazio
          v-else-if="catalogoVazio"
          :titulo="VITRINE_MSG_SEM_PRODUTOS"
        />

        <!-- Grade de produtos. -->
        <template v-else>
          <VitrineGradeProdutos :produtos="produtosFiltrados" />

          <!-- Carregar mais: visível enquanto há páginas; some ao fim; desabilita durante request. -->
          <div v-if="temMaisPaginas" class="mt-6 flex justify-center">
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              icon="i-lucide-chevron-down"
              label="Carregar mais"
              :loading="carregandoMais"
              :disabled="carregandoMais"
              data-testid="carregar-mais"
              @click="carregarMais"
            />
          </div>
        </template>
      </section>
    </UContainer>
  </div>
</template>
