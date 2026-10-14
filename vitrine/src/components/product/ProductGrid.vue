<script setup lang="ts">
import ProductCard from '@/components/product/ProductCard.vue'
import type { Produto } from '@/types/produto'

defineProps<{
  products: Produto[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  'view-detail': [id: number]
}>()

function handleViewDetail(id: number) {
  emit('view-detail', id)
}
</script>

<template>
  <section class="product-grid" aria-label="Grade de produtos">
    <div class="product-grid__container">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @view-detail="handleViewDetail"
      />
    </div>
  </section>
</template>

<style scoped>
.product-grid__container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .product-grid__container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .product-grid__container {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
