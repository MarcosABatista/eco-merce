<!-- app/components/vitrine/TrilhaNavegacao.vue — Trilha "Início > {categoria} > {nome}" (RF-VIT-8). -->
<!-- UBreadcrumb com itens derivados do produto; omite a categoria quando nula. O item de -->
<!-- categoria navega à home filtrada; o item final (nome) não é link. -->

<script setup lang="ts">
import { computed } from 'vue'
import { rotuloCategoria } from '#shared/constants/categorias'
import type { BreadcrumbItem } from '@nuxt/ui'
import type { Categoria } from '#shared/types/produto'

const props = defineProps<{
  categoria: Categoria | null
  nome: string
}>()

// Monta os itens da trilha; a categoria é opcional (omitida se nula).
const itens = computed<BreadcrumbItem[]>(() => {
  const lista: BreadcrumbItem[] = [{ label: 'Início', icon: 'i-lucide-house', to: '/' }]
  if (props.categoria) {
    lista.push({
      label: rotuloCategoria(props.categoria),
      to: { path: '/', query: { categoria: props.categoria } },
    })
  }
  lista.push({ label: props.nome })
  return lista
})
</script>

<template>
  <UBreadcrumb :items="itens" data-testid="trilha-navegacao" />
</template>
