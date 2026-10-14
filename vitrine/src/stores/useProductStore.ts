import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { produtoService } from '@/services/produtoService'
import type { Produto } from '@/types/produto'

export const useProductStore = defineStore('product', () => {
  const products = ref<Produto[]>([])
  const currentProduct = ref<Produto | null>(null)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(0)
  const totalPages = ref(0)
  const searchQuery = ref('')
  const activeCategory = ref<string | null>(null)

  const filteredProducts = computed(() => {
    if (!searchQuery.value.trim()) return products.value
    const query = searchQuery.value.toLowerCase()
    return products.value.filter(p => p.nome.toLowerCase().includes(query))
  })

  const hasMorePages = computed(() => currentPage.value < totalPages.value - 1)

  async function fetchProducts(options?: { append?: boolean }) {
    const append = options?.append ?? false
    if (append) {
      isLoadingMore.value = true
    } else {
      isLoading.value = true
      currentPage.value = 0
    }
    error.value = null

    try {
      const page = append ? currentPage.value + 1 : 0
      const response = await produtoService.findAll(
        page, 20, activeCategory.value ?? undefined
      )
      const activeProducts = response.content.filter(p => p.ativo)
      if (append) {
        products.value = [...products.value, ...activeProducts]
        currentPage.value = page
      } else {
        products.value = activeProducts
        currentPage.value = response.page
      }
      totalPages.value = response.totalPages
    } catch {
      error.value = 'Não foi possível carregar os produtos. Tente novamente mais tarde.'
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  async function fetchProductById(id: number) {
    isLoading.value = true
    error.value = null
    currentProduct.value = null
    try {
      currentProduct.value = await produtoService.findById(id)
    } catch {
      error.value = 'Não foi possível carregar o produto.'
    } finally {
      isLoading.value = false
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setCategory(categoria: string | null) {
    activeCategory.value = categoria
  }

  return {
    products, currentProduct, isLoading, isLoadingMore,
    error, currentPage, totalPages, searchQuery, activeCategory,
    filteredProducts, hasMorePages,
    fetchProducts, fetchProductById, setSearchQuery, setCategory,
  }
})
