<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/useProductStore'
import { useFormatters } from '@/composables/useFormatters'
import ProductBreadcrumb from '@/components/ui/ProductBreadcrumb.vue'
import WhatsAppButton from '@/components/ui/WhatsAppButton.vue'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const store = useProductStore()
const { formatPrice } = useFormatters()

const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%23666666" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESem imagem%3C/text%3E%3C/svg%3E'

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = placeholderImage
}

function goHome() {
  router.push('/')
}

function retry() {
  store.fetchProductById(Number(props.id))
}

onMounted(() => {
  const numId = Number(props.id)
  if (isNaN(numId) || !Number.isInteger(numId)) {
    router.replace('/')
    return
  }
  store.fetchProductById(numId)
})
</script>

<template>
  <main class="produto-detail">
    <!-- Loading State -->
    <div v-if="store.isLoading" class="skeleton-wrapper" role="status" aria-live="polite">
      <div class="skeleton-breadcrumb"></div>
      <div class="skeleton-content">
        <div class="skeleton-gallery"></div>
        <div class="skeleton-info">
          <div class="skeleton-tag"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-price"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="error-state" role="alert">
      <h1 class="error-title">{{ store.error }}</h1>
      <div class="error-actions">
        <button class="btn-primary" type="button" @click="retry">
          Tentar novamente
        </button>
        <button class="btn-secondary" type="button" @click="goHome">
          Voltar para a página inicial
        </button>
      </div>
    </div>

    <!-- Product Content -->
    <template v-else-if="store.currentProduct">
      <ProductBreadcrumb
        :categoria="store.currentProduct.categoria"
        :nome-produto="store.currentProduct.nome"
      />

      <div class="produto-layout">
        <!-- Left Column: Image Gallery -->
        <div class="produto-gallery">
          <img
            :src="store.currentProduct.urlImagem ?? placeholderImage"
            :alt="store.currentProduct.nome"
            class="produto-image"
            @error="handleImageError"
          />
        </div>

        <!-- Right Column: Info Panel -->
        <div class="produto-info-panel">
          <span v-if="store.currentProduct.categoria" class="produto-category-tag">
            {{ store.currentProduct.categoria }}
          </span>

          <h1 class="produto-name">{{ store.currentProduct.nome }}</h1>

          <div class="produto-pricing">
            <template v-if="store.currentProduct.precoDesconto">
              <p class="produto-price-original">{{ formatPrice(store.currentProduct.preco) }}</p>
              <div class="produto-price-row">
                <p class="produto-price-discount">{{ formatPrice(store.currentProduct.precoDesconto) }}</p>
                <span class="produto-badge-discount">-{{ store.currentProduct.percentualDesconto }}%</span>
              </div>
            </template>
            <p v-else class="produto-price">{{ formatPrice(store.currentProduct.preco) }}</p>
          </div>

          <WhatsAppButton
            :telefone="store.currentProduct.telefone"
            :nome-produto="store.currentProduct.nome"
            :nome-loja="store.currentProduct.nomeLoja"
            variant="full"
          />

          <!-- Seller Name (Desktop) -->
          <p v-if="store.currentProduct.nomeLoja" class="produto-seller-name produto-seller-name--desktop">
            {{ store.currentProduct.nomeLoja }}
          </p>
        </div>
      </div>

      <!-- Description Section -->
      <section v-if="store.currentProduct.descricao" class="produto-description">
        <h2 class="section-title">Descrição</h2>
        <p class="description-text">{{ store.currentProduct.descricao }}</p>
      </section>

      <!-- Seller Name (Mobile/Tablet) -->
      <p v-if="store.currentProduct.nomeLoja" class="produto-seller-name produto-seller-name--mobile">
        {{ store.currentProduct.nomeLoja }}
      </p>

      <button class="btn-back" type="button" @click="goHome">
        ← Voltar para a vitrine
      </button>
    </template>
  </main>
</template>

<style scoped>
.produto-detail {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* ============================
   Skeleton Loading State
   ============================ */
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-breadcrumb {
  height: 1rem;
  width: 40%;
  background: #e5e7eb;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
}

.skeleton-gallery {
  min-height: 400px;
  background: #e5e7eb;
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-tag {
  width: 80px;
  height: 1.5rem;
  background: #e5e7eb;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-title {
  width: 100%;
  height: 2rem;
  background: #e5e7eb;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-price {
  width: 50%;
  height: 2.5rem;
  background: #e5e7eb;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-button {
  width: 100%;
  height: 44px;
  background: #e5e7eb;
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ============================
   Error States
   ============================ */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 4rem 1rem;
  text-align: center;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #374151;
}

.error-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #1a2a4a;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #2d3f5e;
}

.btn-primary:focus-visible {
  outline: 2px solid #1a2a4a;
  outline-offset: 2px;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #333;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid #ccc;
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-secondary:focus-visible {
  outline: 2px solid #1a2a4a;
  outline-offset: 2px;
}

/* ============================
   Product Layout (Two-Column)
   ============================ */
.produto-layout {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
  margin-top: 0.5rem;
}

/* ============================
   Image Gallery
   ============================ */
.produto-gallery {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
}

.produto-image {
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-height: 600px;
  object-fit: contain;
}

/* ============================
   Info Panel
   ============================ */
.produto-info-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.produto-category-tag {
  display: inline-block;
  width: fit-content;
  background: #eef2ff;
  color: #1a2a4a;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.produto-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.3;
}

.produto-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2e7d32;
  margin: 0;
}

.produto-pricing {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.produto-price-original {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}

.produto-price-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.produto-price-discount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2e7d32;
  margin: 0;
}

.produto-badge-discount {
  background: #dc2626;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
}

/* ============================
   Seller Name
   ============================ */
.produto-seller-name {
  font-size: 0.9rem;
  color: #4b5563;
  margin: 0;
  margin-top: 0.5rem;
}

.produto-seller-name--desktop {
  display: block;
}

.produto-seller-name--mobile {
  display: none;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

/* ============================
   Description Section
   ============================ */
.produto-description {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.description-text {
  font-size: 1rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

/* ============================
   Back Button
   ============================ */
.btn-back {
  display: inline-flex;
  align-items: center;
  margin-top: 2rem;
  padding: 0.6rem 1.25rem;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  min-height: 44px;
  transition: background-color 0.2s;
}

.btn-back:hover {
  background-color: #e0e0e0;
}

.btn-back:focus-visible {
  outline: 2px solid #1a2a4a;
  outline-offset: 2px;
}

/* ============================
   Responsive Styles
   ============================ */
@media (max-width: 1023px) {
  .produto-layout {
    grid-template-columns: 1fr;
  }

  .skeleton-content {
    grid-template-columns: 1fr;
  }

  .produto-gallery {
    min-height: 300px;
    max-height: 400px;
  }

  .produto-image {
    min-height: 300px;
    max-height: 400px;
  }

  .produto-seller-name--desktop {
    display: none;
  }

  .produto-seller-name--mobile {
    display: block;
    margin-top: 1.5rem;
  }
}

@media (max-width: 767px) {
  .produto-gallery {
    min-height: auto;
    max-height: 300px;
  }

  .produto-image {
    min-height: auto;
    max-height: 300px;
  }

  .produto-name {
    font-size: 1.25rem;
  }
}

/* ============================
   Accessibility: Focus Indicators
   ============================ */
.produto-detail a:focus-visible,
.produto-detail button:focus-visible {
  outline: 2px solid #1a2a4a;
  outline-offset: 2px;
}
</style>
