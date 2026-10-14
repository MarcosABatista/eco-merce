<script setup lang="ts">
import { RouterLink } from 'vue-router'

const props = defineProps<{
  categoria: string | null
  nomeProduto: string
}>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <RouterLink to="/" class="breadcrumb-link">Início</RouterLink>
        <span class="breadcrumb-separator" aria-hidden="true">&gt;</span>
      </li>
      <li v-if="props.categoria" class="breadcrumb-item">
        <RouterLink to="/" class="breadcrumb-link">{{ props.categoria }}</RouterLink>
        <span class="breadcrumb-separator" aria-hidden="true">&gt;</span>
      </li>
      <li class="breadcrumb-item breadcrumb-item--current" aria-current="page">
        {{ props.nomeProduto }}
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb {
  padding: 0.75rem 0;
  font-size: 0.875rem;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.25rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.breadcrumb-link {
  color: #1a2a4a;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #2d3f5e;
  text-decoration: underline;
}

.breadcrumb-link:focus-visible {
  outline: 2px solid #1a2a4a;
  outline-offset: 2px;
  border-radius: 2px;
}

.breadcrumb-separator {
  color: #9ca3af;
  margin: 0 0.25rem;
}

.breadcrumb-item--current {
  color: #374151;
  font-weight: 500;
}
</style>
