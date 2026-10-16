<!-- app/components/vitrine/GradeProdutos.vue — Grade "Ofertas do Dia" responsiva (RF-VIT-4). -->
<!-- Grid 3/2/1 (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3) de CartaoProduto. Apenas o conteúdo -->
<!-- da grade reage aos estados (carregando/erro/vazio); cabeçalho/busca/categorias ficam no -->
<!-- layout/página e NÃO são afetados (degradação graciosa — design §9). -->

<script setup lang="ts">
import type { Produto } from '#shared/types/produto'

defineProps<{
  // Produtos já filtrados (ativos + busca client-side) a renderizar.
  produtos: Produto[]
}>()
</script>

<template>
  <div
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    data-testid="grade-produtos"
  >
    <VitrineCartaoProduto
      v-for="produto in produtos"
      :key="produto.id"
      :produto="produto"
    />
  </div>
</template>
