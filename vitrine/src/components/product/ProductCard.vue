<script setup lang="ts">
import { ref } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import WhatsAppButton from '@/components/ui/WhatsAppButton.vue'
import type { Produto } from '@/types/produto'

const props = defineProps<{
  product: Produto
}>()

const emit = defineEmits<{
  'view-detail': [id: number]
}>()

const { formatPrice } = useFormatters()

const imageError = ref(false)

function onImageError() {
  imageError.value = true
}

function handleViewDetail() {
  emit('view-detail', props.product.id)
}
</script>

<template>
  <article class="product-card">
    <div class="product-card__image-container">
      <div
        v-if="!product.urlImagem || imageError"
        class="product-card__placeholder"
        aria-hidden="true"
      />
      <img
        v-else
        :src="product.urlImagem"
        :alt="product.nome"
        class="product-card__image"
        @error="onImageError"
      />
    </div>

    <div class="product-card__content">
      <h3 class="product-card__name">{{ product.nome }}</h3>

      <p v-if="product.nomeLoja" class="product-card__store">
        {{ product.nomeLoja }}
      </p>

      <div class="product-card__pricing">
        <template v-if="product.precoDesconto">
          <span class="product-card__price-original">{{ formatPrice(product.preco) }}</span>
          <span class="product-card__price-discount">{{ formatPrice(product.precoDesconto) }}</span>
          <span class="product-card__badge-discount">-{{ product.percentualDesconto }}%</span>
        </template>
        <span v-else class="product-card__price">{{ formatPrice(product.preco) }}</span>
      </div>

      <div class="product-card__actions">
        <button
          class="product-card__button"
          type="button"
          @click="handleViewDetail"
        >
          Ver Oferta
        </button>

        <WhatsAppButton
          :telefone="product.telefone"
          :nome-produto="product.nome"
          :nome-loja="product.nomeLoja"
          variant="compact"
        />
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  transition: box-shadow 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-card__image-container {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__placeholder {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
}

.product-card__content {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
  flex: 1;
}

.product-card__name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.product-card__store {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.product-card__pricing {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.product-card__price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a2a4a;
  margin: 0;
}

.product-card__price-original {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 0.875rem;
}

.product-card__price-discount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #16a34a;
}

.product-card__badge-discount {
  background: #dc2626;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.product-card__button {
  margin-top: auto;
  padding: 12px 16px;
  min-height: 44px;
  min-width: 44px;
  background-color: #c8a415;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
}

.product-card__button:hover {
  background-color: #a68b0f;
}

.product-card__button:focus-visible {
  outline: 2px solid #1a2a4a;
  outline-offset: 2px;
}

.product-card__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: auto;
}
</style>
