<!-- app/components/vitrine/CategoriasPopulares.vue — Categorias em cards circulares (RF-VIT-3). -->
<!-- Estilo marketplace (Shopee/Mercado Livre): um círculo colorido com ícone + rótulo pt-BR por -->
<!-- categoria, mais um círculo "Todas" que limpa o filtro. Selecionado destaca com anel primário -->
<!-- e aria-pressed. Clicar emite a categoria (toggle no pai); "Todas" emite 'limpar'. Rolável no mobile. -->

<script setup lang="ts">
import { CATEGORIAS } from '#shared/constants/categorias'
import {
  VITRINE_CATEGORIA_TODAS,
  VITRINE_CORES_CATEGORIA,
  VITRINE_ICONES_CATEGORIA,
  VITRINE_TITULO_CATEGORIAS,
} from '#shared/constants/vitrine'
import type { Categoria } from '#shared/types/produto'

defineProps<{
  // Categoria atualmente ativa (null = nenhum filtro, "Todas" destacado).
  ativa: Categoria | null
}>()

const emit = defineEmits<{
  // Alterna a categoria clicada (o pai aplica a regra de toggle).
  alternar: [categoria: Categoria]
  // Remove o filtro de categoria (botão "Todas").
  limpar: []
}>()
</script>

<template>
  <section aria-labelledby="titulo-categorias" data-testid="categorias-populares">
    <h2 id="titulo-categorias" class="mb-4 text-lg font-bold text-highlighted sm:text-xl">
      {{ VITRINE_TITULO_CATEGORIAS }}
    </h2>

    <div
      class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:justify-start sm:gap-x-6 sm:gap-y-4 sm:overflow-visible"
    >
      <!-- "Todas": limpa o filtro de categoria. -->
      <button
        type="button"
        class="group flex w-20 shrink-0 flex-col items-center gap-2 focus-visible:outline-none sm:w-24"
        :aria-pressed="ativa === null"
        data-testid="categoria-todas"
        @click="emit('limpar')"
      >
        <span
          class="flex size-16 items-center justify-center rounded-full ring-2 ring-transparent transition sm:size-20"
          :class="ativa === null
            ? 'bg-primary text-inverted ring-primary'
            : 'bg-elevated text-muted group-hover:ring-primary/40'"
        >
          <UIcon name="i-lucide-layout-grid" class="size-7 sm:size-8" aria-hidden="true" />
        </span>
        <span
          class="w-full break-words text-center text-xs font-medium leading-tight sm:text-sm"
          :class="ativa === null ? 'text-primary' : 'text-muted'"
        >
          {{ VITRINE_CATEGORIA_TODAS }}
        </span>
      </button>

      <!-- Um card circular por categoria fixa. -->
      <button
        v-for="categoria in CATEGORIAS"
        :key="categoria.valor"
        type="button"
        class="group flex w-20 shrink-0 flex-col items-center gap-2 focus-visible:outline-none sm:w-24"
        :aria-pressed="ativa === categoria.valor"
        :data-testid="`categoria-${categoria.valor}`"
        @click="emit('alternar', categoria.valor)"
      >
        <span
          class="flex size-16 items-center justify-center rounded-full ring-2 transition sm:size-20"
          :class="ativa === categoria.valor
            ? 'bg-primary text-inverted ring-primary'
            : `${VITRINE_CORES_CATEGORIA[categoria.valor]} ring-transparent group-hover:ring-primary/40`"
        >
          <UIcon :name="VITRINE_ICONES_CATEGORIA[categoria.valor]" class="size-7 sm:size-8" aria-hidden="true" />
        </span>
        <span
          class="w-full break-words text-center text-xs font-medium leading-tight sm:text-sm"
          :class="ativa === categoria.valor ? 'text-primary' : 'text-muted'"
        >
          {{ categoria.rotulo }}
        </span>
      </button>
    </div>
  </section>
</template>
