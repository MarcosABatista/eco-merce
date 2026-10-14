<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import { usuarioService, type CreateUsuarioRequest } from '@/services/usuarioService'
import { uploadFile } from '@/services/uploadService'

const router = useRouter()

const form = ref({
  cpfCnpj: '',
  nome: '',
  email: '',
  telefone: '',
  senha: '',
  nomeLoja: '',
  imagemLoja: null as string | null,
  ativo: true,
  admin: false,
})

const pendingImageFile = ref<File | null>(null)
const isSaving = ref(false)
const errors = ref<Record<string, string>>({})

function onFileSelected(file: File) {
  pendingImageFile.value = file
}

function validate(): boolean {
  errors.value = {}

  if (!form.value.cpfCnpj.trim()) {
    errors.value.cpfCnpj = 'CPF/CNPJ é obrigatório'
  } else if (!/^\d{11}(\d{3})?$/.test(form.value.cpfCnpj.trim())) {
    errors.value.cpfCnpj = 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos (apenas números)'
  }

  if (!form.value.nome.trim() || form.value.nome.trim().length < 3) {
    errors.value.nome = 'Nome deve ter pelo menos 3 caracteres'
  }

  if (!form.value.email.trim()) {
    errors.value.email = 'Email é obrigatório'
  }

  if (!form.value.senha.trim() || form.value.senha.length < 8) {
    errors.value.senha = 'Senha deve ter pelo menos 8 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true

  try {
    const request: CreateUsuarioRequest = {
      cpfCnpj: form.value.cpfCnpj.trim(),
      nome: form.value.nome.trim(),
      email: form.value.email.trim(),
      senha: form.value.senha,
    }

    if (form.value.telefone.trim()) request.telefone = form.value.telefone.trim()
    if (form.value.nomeLoja.trim()) request.nomeLoja = form.value.nomeLoja.trim()
    request.ativo = form.value.ativo
    request.admin = form.value.admin

    // Cria o usuário primeiro (sem imagem)
    const createdUser = await usuarioService.create(request)

    // Se há imagem pendente, faz upload para o diretório do novo usuário
    if (pendingImageFile.value) {
      const imageUrl = await uploadFile(pendingImageFile.value, createdUser.id)
      // Atualiza o usuário com a URL da imagem
      await usuarioService.update(createdUser.id, { imagemLoja: imageUrl })
    }

    alert('Usuário criado com sucesso!')
    router.push('/')
  } catch (err: any) {
    const response = err.response?.data
    if (response?.errors && response.errors.length > 0) {
      response.errors.forEach((e: { field: string; message: string }) => {
        errors.value[e.field] = e.message
      })
    } else if (response?.message) {
      alert(response.message)
    } else {
      alert('Erro ao criar usuário')
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="create-user">
    <button class="back-btn" @click="router.push('/')">
      <ArrowLeft :size="20" />
      <span>Voltar</span>
    </button>

    <div class="form-card">
      <h2 class="form-title">Adicionar Usuário</h2>

      <form @submit.prevent="handleSubmit" class="user-form">
        <div class="form-group form-group--center">
          <label class="form-label">Foto da Loja</label>
          <ImageUpload v-model="form.imagemLoja" @file-selected="onFileSelected" />
        </div>

        <div class="form-group">
          <label class="form-label" for="cpfCnpj">CPF/CNPJ *</label>
          <input
            id="cpfCnpj"
            v-model="form.cpfCnpj"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.cpfCnpj }"
            placeholder="Apenas números (11 ou 14 dígitos)"
            maxlength="14"
          />
          <span v-if="errors.cpfCnpj" class="error-text">{{ errors.cpfCnpj }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="nome">Nome *</label>
          <input
            id="nome"
            v-model="form.nome"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.nome }"
            placeholder="Nome completo"
          />
          <span v-if="errors.nome" class="error-text">{{ errors.nome }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="email">Email *</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ 'form-input--error': errors.email }"
            placeholder="usuario@email.com"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
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
          <label class="form-label" for="senha">Senha *</label>
          <input
            id="senha"
            v-model="form.senha"
            type="password"
            class="form-input"
            :class="{ 'form-input--error': errors.senha }"
            placeholder="Mínimo 8 caracteres"
          />
          <span v-if="errors.senha" class="error-text">{{ errors.senha }}</span>
        </div>

        <div class="form-row">
          <div class="form-group form-group--toggle">
            <label class="toggle-label">
              <input type="checkbox" v-model="form.ativo" class="toggle-input" />
              <span class="toggle-text">Ativo</span>
            </label>
          </div>

          <div class="form-group form-group--toggle">
            <label class="toggle-label">
              <input type="checkbox" v-model="form.admin" class="toggle-input" />
              <span class="toggle-text">Administrador</span>
            </label>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSaving">
          {{ isSaving ? 'Salvando...' : 'Salvar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.create-user {
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

.user-form {
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

.form-input--error {
  border-color: #ef4444;
}

.form-input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-text {
  font-size: 0.8rem;
  color: #ef4444;
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

.form-row {
  display: flex;
  gap: 2rem;
}

.form-group--toggle {
  flex-direction: row;
  align-items: center;
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
</style>
