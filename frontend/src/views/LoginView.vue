<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const senha = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleLogin() {
  error.value = ''

  if (!email.value.trim()) {
    error.value = 'Informe o email'
    return
  }
  if (!senha.value) {
    error.value = 'Informe a senha'
    return
  }

  isLoading.value = true
  try {
    await authStore.login(email.value.trim(), senha.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Email ou senha inválidos'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/logo.png" alt="Place Offers" class="login-logo" />        
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="seu@email.com"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="senha">Senha</label>
          <input
            id="senha"
            v-model="senha"
            type="password"
            class="form-input"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f3ee 0%, #e8e4dc 100%);
  padding: 1rem;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  height: 64px;
  margin-bottom: 0.75rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2a4a;
  letter-spacing: 0.5px;
}

.login-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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
  border-color: #1a2a4a;
  box-shadow: 0 0 0 3px rgba(26, 42, 74, 0.1);
}

.error-message {
  color: #dc2626;
  font-size: 0.85rem;
  text-align: center;
}

.login-btn {
  background: #1a2a4a;
  color: white;
  padding: 0.85rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  background: #2d3f5e;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
