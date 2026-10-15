<!-- app/components/vitrine/EstadoVazio.vue — Estado vazio da grade (RF-VIT-4). -->
<!-- Distingue, via props, o vazio de catálogo ("Nenhum produto encontrado") do vazio de busca -->
<!-- client-side (mensagem própria + dica para carregar mais). Mensagem/dica vêm do pai. -->

<script setup lang="ts">
defineProps<{
  // Mensagem principal do estado vazio.
  titulo: string
  // Dica opcional (ex.: ampliar a busca carregando mais).
  dica?: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 py-16 text-center"
    data-testid="estado-vazio"
  >
    <UIcon name="i-lucide-package-search" class="size-12 text-muted" aria-hidden="true" />
    <p class="text-base font-semibold text-highlighted">
      {{ titulo }}
    </p>
    <p v-if="dica" class="max-w-sm text-sm text-muted">
      {{ dica }}
    </p>
  </div>
</template>
