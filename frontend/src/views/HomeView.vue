<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Pencil, Trash2 } from 'lucide-vue-next'
import { produtoService, type Produto } from '@/services/produtoService'
import { useAuthStore } from '@/stores/useAuthStore'
import { normalizeImageUrl } from '@/utils/imageUrl'

const router = useRouter()
const authStore = useAuthStore()

const userId = computed(() => authStore.user?.id ?? 0)

const produtos = ref<Produto[]>([])
const isLoading = ref(false)

onMounted(() => {
  loadProdutos()
})

async function loadProdutos() {
  isLoading.value = true
  try {
    const response = await produtoService.findByUsuario(userId.value)
    produtos.value = response.content
  } catch {
    // API pode não estar rodando
  } finally {
    isLoading.value = false
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

function goToCreateProduto() {
  router.push({ name: 'create-produto' })
}

function goToEditProduto(id: number) {
  router.push({ name: 'edit-produto', params: { id } })
}

async function deleteProduto(id: number) {
  if (!confirm('Tem certeza que deseja deletar este produto?')) return

  try {
    await produtoService.delete(id)
    produtos.value = produtos.value.filter(p => p.id !== id)
  } catch {
    alert('Erro ao deletar produto')
  }
}
</script>

<template>
  <div class="home">
    <div class="add-product-card">
      <button class="add-product-btn" @click="goToCreateProduto">
        <ShoppingCart :size="20" />
        <span>Adicionar Novo Produto</span>
      </button>
    </div>

    <section class="products-section">
      <h2 class="products-title">Meus Produtos</h2>

      <p v-if="isLoading" class="loading-text">Carregando...</p>
      <p v-else-if="produtos.length === 0" class="empty-text">
        Nenhum produto cadastrado.
      </p>

      <div class="product-list">
        <div
          v-for="produto in produtos"
          :key="produto.id"
          class="product-card"
          :class="{ 'product-card--inactive': !produto.ativo }"
        >
          <div class="product-image-wrapper">
            <img
              v-if="produto.urlImagem"
              :src="normalizeImageUrl(produto.urlImagem) ?? ''"
              :alt="produto.nome"
              class="product-image"
            />
            <div v-else class="product-image-placeholder"></div>
          </div>

          <div class="product-info">
            <h3 class="product-name">{{ produto.nome }}</h3>
            <div class="product-pricing">
              <template v-if="produto.precoDesconto">
                <p class="product-price product-price--original">{{ formatPrice(produto.preco) }}</p>
                <p class="product-price product-price--discount">{{ formatPrice(produto.precoDesconto) }}</p>
              </template>
              <p v-else class="product-price">{{ formatPrice(produto.preco) }}</p>
            </div>
            <span v-if="!produto.ativo" class="product-badge-inactive">Inativo</span>
          </div>

          <div class="product-actions">
            <button class="btn-edit" @click="goToEditProduto(produto.id)">
              <Pencil :size="14" />
              <span>Editar</span>
            </button>
            <button class="btn-delete" @click="deleteProduto(produto.id)">
              <Trash2 :size="14" />
              <span>Deletar</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.add-product-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.add-product-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #c8a415;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
}

.add-product-btn:hover {
  background: #a68b0f;
}

.products-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.products-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.loading-text,
.empty-text {
  color: #6b7280;
  font-size: 0.9rem;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  transition: opacity 0.2s;
}

.product-card--inactive {
  opacity: 0.5;
  background: #f3f4f6;
  filter: grayscale(60%);
}

.product-image-wrapper {
  flex-shrink: 0;
}

.product-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  background: #f3f4f6;
}

.product-image-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background: #e5e7eb;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
}

.product-pricing {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.product-price {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 0;
}

.product-price--original {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 0.8rem;
}

.product-price--discount {
  color: #16a34a;
  font-weight: 700;
  font-size: 0.95rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #16a34a;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.btn-edit:hover {
  background: #15803d;
}

.btn-delete {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #dc2626;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.btn-delete:hover {
  background: #b91c1c;
}

.product-badge-inactive {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b7280;
  background: #e5e7eb;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
}
</style>
