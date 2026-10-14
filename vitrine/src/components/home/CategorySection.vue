<script setup lang="ts">
import type { Categoria } from '@/types/produto'

const props = defineProps<{
  activeCategory: string | null
}>()

const emit = defineEmits<{
  select: [category: string | null]
}>()

interface CategoryItem {
  id: Categoria
  label: string
  icon: string
}

const categories: CategoryItem[] = [
  { id: 'VESTUARIO', label: 'Vestuário', icon: '👕' },
  { id: 'ELETRODOMESTICOS', label: 'Eletrodomésticos', icon: '🏠' },
  { id: 'ACESSORIOS', label: 'Acessórios', icon: '👜' },
  { id: 'SUPLEMENTOS', label: 'Suplementos', icon: '💊' },
]

function handleCategoryClick(categoryId: string) {
  if (props.activeCategory === categoryId) {
    emit('select', null)
  } else {
    emit('select', categoryId)
  }
}
</script>

<template>
  <section class="category-section">
    <h2 class="category-title">Categorias Populares</h2>
    <div role="group" aria-label="Categorias populares" class="category-grid">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        class="category-button"
        :class="{ active: activeCategory === category.id }"
        :aria-pressed="activeCategory === category.id"
        :aria-label="category.label"
        @click="handleCategoryClick(category.id)"
      >
        <span class="category-icon" aria-hidden="true">{{ category.icon }}</span>
        <span class="category-label">{{ category.label }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.category-section {
  padding: 1.5rem 1rem;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2a4a;
  margin: 0 0 1rem 0;
}

.category-grid {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.category-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 80px;
  min-height: 80px;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
  flex: 1;
}

.category-button:hover {
  border-color: #c8a415;
  background-color: #fefce8;
}

.category-button:focus-visible {
  outline: 2px solid #1a2a4a;
  outline-offset: 2px;
}

.category-button.active {
  border-color: #c8a415;
  background-color: #fef9c3;
  box-shadow: 0 0 0 1px #c8a415;
}

.category-icon {
  font-size: 1.75rem;
  line-height: 1;
}

.category-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

@media (max-width: 767px) {
  .category-button {
    min-width: 44px;
    min-height: 44px;
    padding: 0.75rem;
  }

  .category-grid {
    gap: 0.5rem;
  }
}

@media (min-width: 768px) {
  .category-section {
    padding: 2rem 1.5rem;
  }

  .category-title {
    font-size: 1.5rem;
  }

  .category-button {
    min-width: 100px;
    min-height: 100px;
    padding: 1rem 1.25rem;
  }

  .category-icon {
    font-size: 2rem;
  }

  .category-label {
    font-size: 0.875rem;
  }
}
</style>
