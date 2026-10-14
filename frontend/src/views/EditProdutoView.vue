<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import { produtoService, type UpdateProdutoRequest } from '@/services/produtoService'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const produtoId = computed(() => Number(route.params.id))
const userId = computed(() => authStore.user?.id ?? 0)

const categorias = [
  { value: 'VESTUARIO', label: 'Vestuário' },
  { value: 'ELETRODOMESTICOS', label: 'Eletrodomésticos' },
  { value: 'ACESSORIOS', label: 'Acessórios' },
  { value: 'SUPLEMENTOS', label: 'Suplementos' },
]

const form = ref({
  nome: '',
  descricao: '',
  preco: '',
  precoDesconto: '',
  categoria: '',
  urlImagem: null as string | null,
  ativo: true,
})

const isLoading = ref(false)
const isSaving = ref(false)
const errors = ref<Record<string, string>>({})
const originalUrlImagem = ref<string | null>(null)

onMounted(async () => {
  isLoading.value = true
  try {
    const produto = await produtoService.findById(produtoId.value)
    form.value.nome = produto.nome
    form.value.descricao = produto.descricao || ''
    form.value.preco = produto.preco.toString()
    form.value.precoDesconto = produto.precoDesconto?.toString() ?? ''
    form.value.categoria = produto.categoria
    form.value.urlImagem = produto.urlImagem
    form.value.ativo = produto.ativo
    originalUrlImagem.value = produto.urlImagem
  } catch {
    alert('Erro ao carregar produto')
    router.push({ name: 'home' })
  } finally {
    isLoading.value = false
  }
})

function validate(): boolean {
  errors.value = {}

  if (!form.value.nome.trim()) {
    errors.value.nome = 'Nome é obrigatório'
  }

  if (!form.value.preco || parseFloat(form.value.preco) <= 0) {
    errors.value.preco = 'Preço deve ser maior que zero'
  }

  if (form.value.precoDesconto && parseFloat(form.value.precoDesconto) >= parseFloat(form.value.preco)) {
    errors.value.precoDesconto = 'Preço com desconto deve ser menor que o preço original'
  }

  if (!form.value.categoria) {
    errors.value.categoria = 'Categoria é obrigatória'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true

  try {
    const request: UpdateProdutoRequest = {
      nome: form.value.nome.trim(),
      descricao: form.value.descricao.trim() || undefined,
      preco: parseFloat(form.value.preco),
      precoDesconto: form.value.precoDesconto ? parseFloat(form.value.precoDesconto) : null,
      categoria: form.value.categoria,
      ativo: form.value.ativo,
    }

    // Lógica de imagem: se mudou, enviar nova URL ou "" para remover
    if (form.value.urlImagem !== originalUrlImagem.value) {
      request.urlImagem = form.value.urlImagem ?? ''
    }

    await produtoService.update(produtoId.value, request)
    router.push({ name: 'home' })
  } catch (err: any) {
    const response = err.response?.data
    if (response?.errors && response.errors.length > 0) {
      response.errors.forEach((e: { field: string; message: string }) => {
        errors.value[e.field] = e.message
      })
    } else if (response?.message) {
      alert(response.message)
    } else {
      alert('Erro ao atualizar produto')
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="edit-produto">
    <button class="back-btn" @click="router.push('/')">
      <ArrowLeft :size="20" />
      <span>Voltar</span>
    </button>

    <div class="form-card">
      <h2 class="form-title">Editar Produto</h2>

      <div v-if="isLoading" class="loading">Carregando...</div>

      <form v-else @submit.prevent="handleSubmit" class="produto-form">
        <div class="form-group form-group--center">
          <label class="form-label">Foto do Produto</label>
          <ImageUpload v-model="form.urlImagem" :user-id="userId" />
        </div>

        <div class="form-group">
          <label class="form-label" for="nome">Nome *</label>
          <input
            id="nome"
            v-model="form.nome"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.nome }"
            placeholder="Nome do produto"
          />
          <span v-if="errors.nome" class="error-text">{{ errors.nome }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="descricao">Descrição</label>
          <textarea
            id="descricao"
            v-model="form.descricao"
            class="form-input form-textarea"
            placeholder="Descrição do produto (opcional)"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="preco">Preço *</label>
          <input
            id="preco"
            v-model="form.preco"
            type="number"
            step="0.01"
            min="0.01"
            class="form-input"
            :class="{ 'form-input--error': errors.preco }"
            placeholder="0.00"
          />
          <span v-if="errors.preco" class="error-text">{{ errors.preco }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="precoDesconto">Preço com desconto</label>
          <input
            id="precoDesconto"
            v-model="form.precoDesconto"
            type="number"
            step="0.01"
            min="0.01"
            class="form-input"
            :class="{ 'form-input--error': errors.precoDesconto }"
            placeholder="0.00 (opcional)"
          />
          <span v-if="errors.precoDesconto" class="error-text">{{ errors.precoDesconto }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="categoria">Categoria *</label>
          <select
            id="categoria"
            v-model="form.categoria"
            class="form-input"
            :class="{ 'form-input--error': errors.categoria }"
          >
            <option value="" disabled>Selecione uma categoria</option>
            <option v-for="cat in categorias" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
          <span v-if="errors.categoria" class="error-text">{{ errors.categoria }}</span>
        </div>

        <div class="form-group form-group--toggle">
          <label class="toggle-label">
            <input type="checkbox" v-model="form.ativo" class="toggle-input" />
            <span class="toggle-text">Produto ativo</span>
          </label>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSaving">
          {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-produto {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 0;
}

.back-btn:hover {
  color: #111827;
}

.form-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.loading {
  color: #6b7280;
}

.produto-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group--center {
  align-items: center;
}

.form-group--toggle {
  flex-direction: row;
  align-items: center;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input--error {
  border-color: #ef4444;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.error-text {
  font-size: 0.8rem;
  color: #ef4444;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
}

.toggle-input {
  width: 18px;
  height: 18px;
  accent-color: #1a2a4a;
  cursor: pointer;
}

.toggle-text {
  font-weight: 500;
}

.submit-btn {
  background: #1a2a4a;
  color: white;
  padding: 0.85rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: #2d3f5e;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
