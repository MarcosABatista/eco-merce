<!-- app/components/vitrine/EsqueletosCarregamento.vue — Esqueletos da grade em carregamento. -->
<!-- Renderiza >=6 USkeleton no mesmo grid 3/2/1 da grade real, para evitar salto de layout -->
<!-- enquanto os produtos carregam (RF-VIT-4). Decorativo: aria-hidden (o estado é anunciado -->
<!-- pelo contêiner da grade via aria-busy). -->

<script setup lang="ts">
// Quantidade de esqueletos (>=6, igual a uma linha completa de desktop x2).
const VITRINE_ESQUELETOS_QUANTIDADE = 6
</script>

<template>
  <div
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    aria-hidden="true"
    data-testid="esqueletos-carregamento"
  >
    <div
      v-for="n in VITRINE_ESQUELETOS_QUANTIDADE"
      :key="n"
      class="flex flex-col gap-3 rounded-[--ui-radius] border border-default bg-default p-4"
    >
      <USkeleton class="aspect-square w-full" />
      <USkeleton class="h-4 w-16" />
      <USkeleton class="h-4 w-3/4" />
      <USkeleton class="h-6 w-24" />
      <USkeleton class="h-10 w-full" />
    </div>
  </div>
</template>
