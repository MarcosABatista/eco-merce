<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { normalizeImageUrl } from '@/utils/imageUrl'

const router = useRouter()
const authStore = useAuthStore()
const showMenu = ref(false)

const userImage = computed(() => normalizeImageUrl(authStore.user?.imagemLoja))
const userInitial = computed(() => {
  const nomeLoja = authStore.user?.nomeLoja
  if (nomeLoja && nomeLoja.trim()) {
    return nomeLoja.trim().charAt(0).toUpperCase()
  }
  const nome = authStore.user?.nome
  if (nome && nome.trim()) {
    return nome.trim().charAt(0).toUpperCase()
  }
  return '?'
})

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function goToAddUser() {
  showMenu.value = false
  router.push('/usuarios/novo')
}

function goToProfile() {
  showMenu.value = false
  router.push('/perfil')
}

function logout() {
  showMenu.value = false
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="header">
    <div class="header-left" @click="router.push('/')">
      <img src="@/assets/logo.png" alt="Place Offers" class="header-logo" />
      <div class="header-title">
      </div>
    </div>

    <div class="header-right">
      <button class="user-btn" @click="toggleMenu" aria-label="Menu do usuário">
        <img
          v-if="userImage"
          :src="userImage"
          alt="Foto do usuário"
          class="user-avatar"
        />
        <span v-else class="user-initial">{{ userInitial }}</span>
      </button>

      <div v-if="showMenu" class="dropdown-menu">
        <button
          v-if="authStore.isAdmin"
          class="dropdown-item"
          @click="goToAddUser"
        >
          Adicionar Usuário
        </button>
        <button class="dropdown-item" @click="goToProfile">
          Editar Perfil
        </button>
        <button class="dropdown-item dropdown-item--danger" @click="logout">
          Sair
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.header-logo {
  height: 48px;
  width: auto;
}

.header-title {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a2a4a;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.header-right {
  position: relative;
}

.user-btn {
  background: none;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
  width: 40px;
  height: 40px;
}

.user-btn:hover {
  transform: scale(1.05);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.user-initial {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1a2a4a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  overflow: hidden;
  z-index: 200;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  font-size: 0.9rem;
  color: #374151;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.dropdown-item--danger {
  color: #dc2626;
}

.dropdown-item--danger:hover {
  background: #fef2f2;
}
</style>
