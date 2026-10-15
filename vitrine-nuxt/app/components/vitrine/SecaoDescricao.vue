<!-- app/components/vitrine/SecaoDescricao.vue — Seção de descrição do detalhe (RF-VIT-8). -->
<!-- Renderizada apenas quando há descrição (oculta se vazia/nula). Preserva quebras de linha. -->

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  descricao: string | null
}>()

// Só exibe quando há texto não vazio.
const temDescricao = computed(() => !!props.descricao && props.descricao.trim().length > 0)
</script>

<template>
  <section v-if="temDescricao" aria-labelledby="titulo-descricao" data-testid="secao-descricao">
    <h2 id="titulo-descricao" class="mb-2 text-lg font-bold text-highlighted">
      Descrição
    </h2>
    <p class="whitespace-pre-line text-sm text-muted">
      {{ props.descricao }}
    </p>
  </section>
</template>
