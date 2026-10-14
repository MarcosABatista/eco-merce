import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('@/views/EditProfileView.vue'),
    },
    {
      path: '/usuarios/novo',
      name: 'create-user',
      component: () => import('@/views/CreateUserView.vue'),
    },
    {
      path: '/produtos/novo',
      name: 'create-produto',
      component: () => import('@/views/CreateProdutoView.vue'),
    },
    {
      path: '/produtos/:id/editar',
      name: 'edit-produto',
      component: () => import('@/views/EditProdutoView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (!to.meta.public && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
