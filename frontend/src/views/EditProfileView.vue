<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import { usuarioService, type UpdateUsuarioRequest } from '@/services/usuarioService'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const userId = computed(() => authStore.user?.id ?? 0)

const form = ref({
  nome: '',
  email: '',
  telefone: '',
  nomeLoja: '',
  imagemLoja: null as string | null,
  senha: '',
})

const isLoading = ref(false)
const isSaving = ref(false)
const successMessage = ref('')
const originalImagemLoja = ref<string | null>(null)

onMounted(async () => {
  isLoading.value = true
  try {
    const usuario = await usuarioService.getById(userId.value)
    form.value.nome = usuario.nome
    form.value.email = usuario.email
    form.value.telefone = usuario.telefone || ''
    form.value.nomeLoja = usuario.nomeLoja || ''
    form.value.imagemLoja = usuario.imagemLoja
    originalImagemLoja.value = usuario.imagemLoja
  } catch {
    // Usuario pode não existir ainda
  } finally {
    isLoading.value = false
  }
})

async function handleSubmit() {
  isSaving.value = true
  successMessage.value = ''

  try {
    const request: UpdateUsuarioRequest = {}

    if (form.value.nome) request.nome = form.value.nome
    if (form.value.email) request.email = form.value.email
    if (form.value.telefone) request.telefone = form.value.telefone
    if (form.value.nomeLoja) request.nomeLoja = form.value.nomeLoja
    if (form.value.senha) request.senha = form.value.senha

    // Lógica de imagem: se mudou, enviar nova URL ou "" para remover
    if (form.value.imagemLoja !== originalImagemLoja.value) {
      request.imagemLoja = form.value.imagemLoja ?? ''
    }

    const updatedUser = await usuarioService.update(userId.value, request)
    authStore.updateUser(updatedUser)
    originalImagemLoja.value = updatedUser.imagemLoja
    successMessage.value = 'Perfil atualizado com sucesso!'
    form.value.senha = ''
  } catch (err: any) {
    alert(err.response?.data?.message || 'Erro ao atualizar perfil')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="edit-profile">
    <button class="back-btn" @click="router.push('/')">
      <ArrowLeft :size="20" />
      <span>Voltar</span>
    </button>

    <div class="profile-card">
      <h2 class="profile-title">Editar Perfil</h2>

      <div v-if="isLoading" class="loading">Carregando dados...</div>

      <form v-else @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-group form-group--center">
          <label class="form-label">Foto da Loja</label>
          <ImageUpload v-model="form.imagemLoja" :user-id="userId" />
        </div>

        <div class="form-group">
          <label class="form-label" for="nome">Nome</label>
          <input
            id="nome"
            v-model="form.nome"
            type="text"
            class="form-input"
            placeholder="Seu nome completo"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="seu@email.com"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="telefone">Telefone</label>
          <input
            id="telefone"
            v-model="form.telefone"
            type="text"
            class="form-input"
            placeholder="(27) 99999-9999"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="nomeLoja">Nome da Loja</label>
          <input
            id="nomeLoja"
            v-model="form.nomeLoja"
            type="text"
            class="form-input"
            placeholder="Minha Loja"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="senha">Nova Senha (deixe em branco para manter)</label>
          <input
            id="senha"
            v-model="form.senha"
            type="password"
            class="form-input"
            placeholder="••••••••"
          />
        </div>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

        <button type="submit" class="submit-btn" :disabled="isSaving">
          {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-profile {
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

.profile-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.profile-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.loading {
  color: #6b7280;
}

.profile-form {
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

.success-message {
  color: #16a34a;
  font-size: 0.85rem;
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
