<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/useProductStore'
import AppHeader from '@/components/layout/AppHeader.vue'
import BannerSection from '@/components/home/BannerSection.vue'
import CategorySection from '@/components/home/CategorySection.vue'
import ProductGrid from '@/components/product/ProductGrid.vue'
import LoadingSkeletons from '@/components/ui/LoadingSkeletons.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const store = useProductStore()
const router = useRouter()

function handleSearch(term: string) {
  store.setSearchQuery(term)
}

function handleCategorySelect(category: string | null) {
  store.setCategory(category)
  store.fetchProducts()
}

function handleViewDetail(id: number) {
  router.push({ name: 'product-detail', params: { id } })
}

function handleRetry() {
  store.fetchProducts()
}

function handleLoadMore() {
  store.fetchProducts({ append: true })
}

onMounted(() => {
  store.fetchProducts()
})
</script>

<template>
  <div class="home-view">
    <AppHeader @search="handleSearch" />

    <main id="main-content" class="home-view__content">
      <BannerSection title="Ofertas do Dia" />

      <CategorySection
        :active-category="store.activeCategory"
        @select="handleCategorySelect"
      />

      <section class="home-view__products">
        <h2 class="home-view__section-title">Ofertas do Dia</h2>

        <LoadingSkeletons
          v-if="store.isLoading && store.products.length === 0"
          :count="6"
        />

        <ErrorState
          v-else-if="store.error"
          :message="store.error"
          @retry="handleRetry"
        />

        <EmptyState
          v-else-if="store.filteredProducts.length === 0 && !store.isLoading"
          message="Nenhum produto encontrado"
        />

        <template v-else>
          <ProductGrid
            :products="store.filteredProducts"
            :is-loading="store.isLoading"
            @view-detail="handleViewDetail"
          />

          <div
            v-if="store.hasMorePages && !store.error"
            class="home-view__load-more"
          >
            <button
              type="button"
              class="home-view__load-more-btn"
              :disabled="store.isLoadingMore"
              @click="handleLoadMore"
            >
              {{ store.isLoadingMore ? 'Carregando...' : 'Carregar mais' }}
            </button>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home-view__content {
  padding-top: 64px;
}

.home-view__products {
  padding: 1.5rem 1rem;
}

.home-view__section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2a4a;
  margin: 0 0 1.5rem 0;
}

.home-view__load-more {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.home-view__load-more-btn {
  padding: 0.75rem 2rem;
  min-width: 44px;
  min-height: 44px;
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
  background-color: #1a2a4a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.home-view__load-more-btn:hover:not(:disabled) {
  background-color: #2d3f5e;
}

.home-view__load-more-btn:focus-visible {
  outline: 2px solid #1a2a4a;
  outline-offset: 2px;
}

.home-view__load-more-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .home-view__products {
    padding: 2rem 1.5rem;
  }

  .home-view__section-title {
    font-size: 1.5rem;
  }
}
</style>
