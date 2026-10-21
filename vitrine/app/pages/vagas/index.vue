<!-- app/pages/vagas/index.vue — Tela de vagas da vitrine (RF-VIT). -->
<!-- Lista vagas ativas com barra lateral de filtros por categoria e loja (checkboxes), -->
-->"Carregar mais" e busca client-side pelo termo da cabeça. Erro tratado inline. -->
<!-- definePageMeta.validate barra rotas inválidas. -->

<script setup lang="ts">
import { computed, watch } from 'vue'
import { VITRINE_MSG_ERRO_GRADE } from '#shared/constants/vitrine'
import type { PageResponse, Vaga } from '#shared/types/vaga'

const {
  vagasFiltradas,
  categoriaAtiva,
  lojaAtiva,
  termoBusca,
  carregandoMais,
  temMaisPaginas,
  buscaSemResultado,
  vagas,
  definirPagina,
  reiniciar,
  alternarCategoria,
  alternarLoja,
  queryProxima,
  carregarMais,
  lojasDisponiveis,
  categoriasDisponiveis,
} = useVagas()

// Carga SSR + hidratação da primeira página. NÃO-FATAL: erro vira EstadoErro inline.
const { data, status, error, refresh } = await useFetch<PageResponse<Vaga>>('/api/vagas', {
  query: computed(() => queryProxima(0)),
})

// Semeia o estado do composable a partir da resposta (primeira página / troca de filtro).
watch(data, (resposta) => {
  if (resposta) {
    definirPagina(resposta)
  }
}, { immediate: true })

const carregando = computed(() => status.value === 'pending')
const temErro = computed(() => !!error.value)

// Catálogo realmente vazio (sem erro, sem itens carregados e sem busca ativa).
const catalogoVazio = computed(() =>
  !carregando.value && !temErro.value && vagas.value.length === 0 && !termoBusca.value.trim(),
)

// Alterna o filtro de categoria e recarrega a primeira página server-side.
async function aoAlternarCategoria(categoria: string) {
  alternarCategoria(categoria)
  reiniciar()
  await refresh()
}

// Alterna o filtro de loja e recarrega a primeira página server-side.
async function aoAlternarLoja(usuarioId: number) {
  alternarLoja(usuarioId)
  reiniciar()
  await refresh()
}

// Limpa todos os filtros (categoria e loja) e recarrega.
async function aoLimparFiltros() {
  if (categoriaAtiva.value === null && lojaAtiva.value === null) return
  categoriaAtiva.value = null
  lojaAtiva.value = null
  reiniciar()
  await refresh()
}

// Retry da grade após erro.
async function tentarNovamente() {
  await refresh()
}
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6" data-testid="vagas-pagina">
    <!-- Barra lateral de filtros (oculta no mobile). -->
    <aside
      class="lg:w-72 hidden lg:flex flex-col gap-6 p-4"
      data-testid="vagas-sidebar"
    >
      <!-- Filtro por categoria. -->
      <section class="flex flex-col gap-3">
        <h3 class="text-sm font-semibold text-highlighted uppercase tracking-wider">
          Categorias
        </h3>
        <div class="flex flex-col gap-2">
          <label
            v-for="categoria in categoriasDisponiveis"
            :key="categoria"
            class="flex items-center gap-2 cursor-pointer select-none group"
            :data-testid="`filtro-categoria-${categoria}`"
          >
            <UCheckbox
              :model-value="categoriaAtiva.value === categoria"
              :checked="categoriaAtiva.value === categoria"
              data-testid="checkbox-categoria"
            />
            <span
              class="text-sm text-muted group-hover:text-default transition"
              :class="categoriaAtiva.value === categoria ? 'font-medium text-primary' : ''"
            >
              {{ categoria }}
            </span>
          </label>
        </div>
      </section>

      <!-- Filtro por loja. -->
      <section class="flex flex-col gap-3">
        <h3 class="text-sm font-semibold text-highlighted uppercase tracking-wider">
          Lojas
        </h3>
        <div class="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
          <label
            v-for="loja in lojasDisponiveis"
            :key="loja.usuarioId"
            class="flex items-center gap-2 cursor-pointer select-none group"
            :data-testid="`filtro-loja-${loja.usuarioId}`"
          >
            <UCheckbox
              :model-value="lojaAtiva.value === loja.usuarioId"
              :checked="lojaAtiva.value === loja.usuarioId"
              data-testid="checkbox-loja"
            />
            <span
              class="text-sm text-muted truncate group-hover:text-default transition"
              :class="lojaAtiva.value === loja.usuarioId ? 'font-medium text-primary' : ''"
              :title="loja.nomeLoja"
            >
              {{ loja.nomeLoja }}
            </span>
          </label>
        </div>
      </section>

      <!-- Botão limpar filtros. -->
      <div v-if="categoriaAtiva.value || lojaAtiva.value != null" class="pt-2">
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          label="Limpar filtros"
          data-testid="filtros-limpar"
          @click="aoLimparFiltros"
        />
      </div>
    </aside>

    <!-- Conteúdo principal. -->
    <main class="flex-1 min-w-0" data-testid="vagas-conteudo">
      <div class="flex items-center justify-between gap-3 mb-4">
        <h1 class="text-2xl font-bold text-highlighted" data-testid="vagas-titulo">
          Vagas
        </h1>
        <span
          v-if="!carregando && !temErro && vagasFiltradas.length > 0"
          class="ml-auto text-sm text-muted"
          data-testid="vagas-contagem"
        >
          {{ vagasFiltradas.length }} {{ vagasFiltradas.length === 1 ? 'vaga' : 'vagas' }}
        </span>
      </div>

      <!-- Carregando: esqueletos. -->
      <VitrineEsqueletosCarregamento v-if="carregando" />

      <!-- Erro da grade: inline, recuperável. -->
      <VitrineEstadoErro
        v-else-if="temErro"
        :titulo="VITRINE_MSG_ERRO_GRADE"
        :carregando="carregando"
        @tentar="tentarNovamente"
      />

      <!-- Vazio de busca (há itens, mas o filtro client-side não casou). -->
      <VitrineEstadoVazio
        v-else-if="buscaSemResultado"
        titulo="Nenhuma vaga encontrada para a sua busca"
        :dica="temMaisPaginas ? 'Carregue mais vagas para ampliar a busca.' : undefined"
      />

      <!-- Vazio de catálogo (nenhuma vaga). -->
      <VitrineEstadoVazio
        v-else-if="catalogoVazio"
        titulo="Nenhuma vaga disponível no momento"
      />

      <!-- Grade de vagas. -->
      <template v-else>
        <div
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="vagas-grade"
        >
          <VitrineCartaoVaga
            v-for="vaga in vagasFiltradas"
            :key="vaga.id"
            :vaga="vaga"
          />
        </div>

        <!-- Carregar mais: visível enquanto há páginas; some ao fim. -->
        <div v-if="temMaisPaginas" class="mt-6 flex justify-center">
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            icon="i-lucide-chevron-down"
            label="Carregar mais"
            :loading="carregandoMais"
            :disabled="carregandoMais"
            data-testid="vagas-carregar-mais"
            @click="carregarMais"
          />
        </div>
      </template>
    </main>
  </div>
</template>
