import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface AuthUser {
  id: number
  cpfCnpj: string
  nome: string
  email: string
  telefone: string | null
  nomeLoja: string | null
  ativo: boolean
  admin: boolean
  imagemLoja: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(loadFromStorage())

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.admin === true)

  function loadFromStorage(): AuthUser | null {
    const stored = localStorage.getItem('auth_user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  }

  async function login(email: string, senha: string): Promise<void> {
    const { data } = await api.post('/usuarios/login', { email, senha })
    user.value = data
    localStorage.setItem('auth_user', JSON.stringify(data))
  }

  function logout() {
    user.value = null
    localStorage.removeItem('auth_user')
  }

  function updateUser(updatedUser: AuthUser) {
    user.value = updatedUser
    localStorage.setItem('auth_user', JSON.stringify(updatedUser))
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    updateUser,
  }
})
