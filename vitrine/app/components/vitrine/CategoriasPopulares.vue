<!-- app/components/vitrine/CategoriasPopulares.vue — Filtro de categorias da home (RF-VIT-3). -->
<!-- Um UButton por categoria fixa com ícone lucide e rótulo pt-BR. Ativo via variant -->
<!-- (solid<->outline) + aria-pressed; clicar filtra a grade e clicar de novo remove o filtro -->
<!-- (toggle). Emite a categoria clicada; o estado ativo vem por prop (fonte: useProdutos). -->

<script setup lang="ts">
import { CATEGORIAS } from '#shared/constants/categorias'
import { VITRINE_ICONES_CATEGORIA, VITRINE_TITULO_CATEGORIAS } from '#shared/constants/vitrine'
import type { Categoria } from '#shared/types/produto'

defineProps<{
  // Categoria atualmente ativa (null = nenhum filtro).
  ativa: Categoria | null
}>()

const emit = defineEmits<{
  // Alterna a categoria clicada (o pai aplica a regra de toggle).
  alternar: [categoria: Categoria]
}>()
</script>

<template>
  <section aria-labelledby="titulo-categorias" data-testid="categorias-populares">
    <h2 id="titulo-categorias" class="mb-3 text-lg font-bold text-highlighted">
      {{ VITRINE_TITULO_CATEGORIAS }}
    </h2>
    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="categoria in CATEGORIAS"
        :key="categoria.valor"
        :icon="VITRINE_ICONES_CATEGORIA[categoria.valor]"
        :label="categoria.rotulo"
        :variant="ativa === categoria.valor ? 'solid' : 'outline'"
        :color="ativa === categoria.valor ? 'primary' : 'neutral'"
        :aria-pressed="ativa === categoria.valor"
        :data-testid="`categoria-${categoria.valor}`"
        @click="emit('alternar', categoria.valor)"
      />
    </div>
  </section>
</template>
