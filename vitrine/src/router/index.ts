import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/produto/:id',
      name: 'product-detail',
      component: () => import('@/views/ProductDetailView.vue'),
      props: true,
    },
  ],
})

router.beforeEach((to) => {
  if (to.name === 'product-detail') {
    const id = to.params.id as string
    if (!/^\d+$/.test(id)) {
      return { name: 'home' }
    }
  }
})

export default router
