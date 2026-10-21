# Padrões de Desenvolvimento - Front-end (Vue.js 3 + TypeScript)

## Stack Tecnológica

- **Framework**: Vue.js 3.4+
- **Linguagem**: TypeScript (obrigatório)
- **Build Tool**: Vite
- **Gerenciamento de Estado**: Pinia
- **Roteamento**: Vue Router 4
- **HTTP Client**: Axios (com interceptors)
- **UI/CSS**: A definir (Tailwind CSS recomendado)
- **Testes**: Vitest + @vue/test-utils + Playwright (E2E)
- **Linting**: ESLint + Prettier

## Estrutura do Projeto

```
src/
├── App.vue
├── main.ts
├── assets/                    # Arquivos estáticos (imagens, fontes, CSS global)
├── components/                # Componentes reutilizáveis globais
│   ├── ui/                    # Componentes genéricos (Button, Modal, Input)
│   └── layout/                # Componentes de layout (Header, Sidebar, Footer)
├── composables/               # Composables reutilizáveis (useAuth, useFetch, etc.)
├── views/                     # Páginas/Telas (mapeadas pelo router)
│   ├── offers/
│   │   ├── OfferListView.vue
│   │   ├── OfferCreateView.vue
│   │   └── components/        # Componentes específicos da view
│   └── stores/
│       ├── StoreListView.vue
│       └── components/
├── stores/                    # Pinia stores
│   ├── useOfferStore.ts
│   ├── useStoreStore.ts
│   └── useAuthStore.ts
├── router/                    # Configuração de rotas
│   └── index.ts
├── services/                  # Camada de comunicação com API
│   ├── api.ts                 # Instância base do Axios
│   ├── offerService.ts
│   └── storeService.ts
├── types/                     # Interfaces e tipos TypeScript
│   ├── offer.ts
│   ├── store.ts
│   └── api.ts
└── utils/                     # Funções utilitárias
    ├── formatters.ts
    └── validators.ts
```

## Composition API e Script Setup

Todos os componentes devem usar `<script setup lang="ts">` — é a forma recomendada oficialmente pelo Vue 3 para Single-File Components (SFC). Não usar Options API em código novo.

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOfferStore } from '@/stores/useOfferStore'
import type { Offer } from '@/types/offer'

// Props com type-based declaration
const props = defineProps<{
  storeId: number
  limit?: number
}>()

// Emits tipados
const emit = defineEmits<{
  select: [offer: Offer]
  delete: [id: number]
}>()

// State reativo
const isLoading = ref(false)
const searchQuery = ref('')

// Computed properties
const filteredOffers = computed(() =>
  offers.value.filter(o =>
    o.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

// Lifecycle hooks
onMounted(async () => {
  await loadOffers()
})

// Métodos
async function loadOffers() {
  isLoading.value = true
  try {
    await offerStore.fetchByStore(props.storeId)
  } finally {
    isLoading.value = false
  }
}
</script>
```

## Tipagem TypeScript

### Interfaces e Tipos

Definir interfaces para todos os modelos de dados em `src/types/`:

```typescript
// types/offer.ts
export interface Offer {
  id: number
  title: string
  description: string | null
  originalPrice: number
  discountPrice: number
  active: boolean
  expiresAt: string | null
  storeName: string
  createdAt: string
}

export interface CreateOfferRequest {
  title: string
  description?: string
  originalPrice: number
  discountPrice: number
  expiresAt?: string
  storeId: number
}

export interface UpdateOfferRequest {
  title?: string
  description?: string
  originalPrice?: number
  discountPrice?: number
  active?: boolean
  expiresAt?: string
}
```

### Tipos de Resposta da API

```typescript
// types/api.ts
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export interface ErrorResponse {
  status: number
  message: string
  timestamp: string
  fieldErrors?: FieldError[]
}

export interface FieldError {
  field: string
  message: string
}
```

## Composables

Encapsular lógica reutilizável em composables. Convenção: nomes começam com `use`.

```typescript
// composables/usePagination.ts
import { ref, computed } from 'vue'

export function usePagination(initialPageSize = 20) {
  const currentPage = ref(0)
  const pageSize = ref(initialPageSize)
  const totalElements = ref(0)

  const totalPages = computed(() =>
    Math.ceil(totalElements.value / pageSize.value)
  )

  const hasNextPage = computed(() =>
    currentPage.value < totalPages.value - 1
  )

  const hasPreviousPage = computed(() => currentPage.value > 0)

  function nextPage() {
    if (hasNextPage.value) currentPage.value++
  }

  function previousPage() {
    if (hasPreviousPage.value) currentPage.value--
  }

  function goToPage(page: number) {
    if (page >= 0 && page < totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
  }
}
```

### Composable para Fetch com Estado

```typescript
// composables/useAsyncData.ts
import { ref, watchEffect, toValue, type Ref, type MaybeRefOrGetter } from 'vue'

export function useAsyncData<T>(url: MaybeRefOrGetter<string>) {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function fetchData() {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(toValue(url))
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      data.value = await response.json()
    } catch (err) {
      error.value = err as Error
    } finally {
      isLoading.value = false
    }
  }

  watchEffect(() => {
    fetchData()
  })

  return { data, error, isLoading, refresh: fetchData }
}
```

## Pinia Stores

Usar `defineStore` com setup syntax (Composition API style):

```typescript
// stores/useOfferStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { offerService } from '@/services/offerService'
import type { Offer, CreateOfferRequest } from '@/types/offer'
import type { PageResponse } from '@/types/api'

export const useOfferStore = defineStore('offer', () => {
  // State
  const offers = ref<Offer[]>([])
  const currentOffer = ref<Offer | null>(null)
  const isLoading = ref(false)
  const totalElements = ref(0)

  // Getters
  const activeOffers = computed(() =>
    offers.value.filter(o => o.active)
  )

  // Actions
  async function fetchAll(page = 0, size = 20) {
    isLoading.value = true
    try {
      const response: PageResponse<Offer> = await offerService.getAll(page, size)
      offers.value = response.content
      totalElements.value = response.totalElements
    } finally {
      isLoading.value = false
    }
  }

  async function create(request: CreateOfferRequest) {
    const newOffer = await offerService.create(request)
    offers.value.unshift(newOffer)
    return newOffer
  }

  async function remove(id: number) {
    await offerService.delete(id)
    offers.value = offers.value.filter(o => o.id !== id)
  }

  return {
    offers,
    currentOffer,
    isLoading,
    totalElements,
    activeOffers,
    fetchAll,
    create,
    remove,
  }
})
```

## Serviços (Camada API)

Centralizar chamadas HTTP em services separados:

```typescript
// services/api.ts
import axios from 'axios'
import type { ErrorResponse } from '@/types/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

```typescript
// services/offerService.ts
import api from './api'
import type { Offer, CreateOfferRequest, UpdateOfferRequest } from '@/types/offer'
import type { PageResponse } from '@/types/api'

export const offerService = {
  async getAll(page = 0, size = 20): Promise<PageResponse<Offer>> {
    const { data } = await api.get('/offers', { params: { page, size } })
    return data
  },

  async getById(id: number): Promise<Offer> {
    const { data } = await api.get(`/offers/${id}`)
    return data
  },

  async create(request: CreateOfferRequest): Promise<Offer> {
    const { data } = await api.post('/offers', request)
    return data
  },

  async update(id: number, request: UpdateOfferRequest): Promise<Offer> {
    const { data } = await api.put(`/offers/${id}`, request)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/offers/${id}`)
  },
}
```

## Componentes — Boas Práticas

### Nomenclatura

- Componentes: PascalCase com múltiplas palavras (`OfferCard.vue`, `StoreSelector.vue`)
- Views: sufixo `View` (`OfferListView.vue`, `OfferCreateView.vue`)
- Composables: prefixo `use` (`useOfferStore.ts`, `usePagination.ts`)

### Estrutura de um SFC

Ordem dos blocos: `<script setup>` → `<template>` → `<style>`

```vue
<script setup lang="ts">
// 1. Imports
// 2. Props e Emits
// 3. Composables e Stores
// 4. Refs e Reactive state
// 5. Computed properties
// 6. Watchers
// 7. Lifecycle hooks
// 8. Métodos
</script>

<template>
  <!-- Template com indentação de 2 espaços -->
</template>

<style scoped>
/* Sempre usar scoped para evitar vazamento de estilos */
</style>
```

### Props e Eventos

- Props devem ser tipadas com type-based declaration
- Usar valores default com destructuring (Vue 3.5+) ou `withDefaults`
- Eventos devem ser tipados com `defineEmits<{}>()`

```vue
<script setup lang="ts">
interface Props {
  title: string
  description?: string
  price: number
  active?: boolean
}

const { title, description = '', active = true } = defineProps<Props>()

const emit = defineEmits<{
  edit: [id: number]
  delete: [id: number]
  toggle: [id: number, active: boolean]
}>()
</script>
```

### Renderização Condicional e Listas

- Usar `v-if` / `v-else-if` / `v-else` para condicionais
- Usar `v-show` quando a visibilidade alterna frequentemente
- Sempre usar `:key` único em `v-for`
- Nunca usar `v-if` junto com `v-for` no mesmo elemento

```vue
<template>
  <div v-if="isLoading" class="loading">Carregando...</div>
  <div v-else-if="error" class="error">{{ error.message }}</div>
  <ul v-else>
    <li v-for="offer in offers" :key="offer.id">
      <OfferCard :offer="offer" @delete="handleDelete" />
    </li>
  </ul>
</template>
```

## Roteamento

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/offers',
    },
    {
      path: '/offers',
      name: 'offers',
      component: () => import('@/views/offers/OfferListView.vue'),
    },
    {
      path: '/offers/create',
      name: 'offer-create',
      component: () => import('@/views/offers/OfferCreateView.vue'),
    },
    {
      path: '/offers/:id',
      name: 'offer-detail',
      component: () => import('@/views/offers/OfferDetailView.vue'),
      props: true,
    },
  ],
})

// Navigation guard para autenticação
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }
})

export default router
```

Usar lazy loading (importação dinâmica) para todas as rotas para otimizar o bundle.

## Formulários

- Usar `v-model` para binding bidirecional
- Validação no front-end antes de enviar
- Feedback visual para campos com erro
- Desabilitar botão de submit durante o envio

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { CreateOfferRequest } from '@/types/offer'

const form = reactive<CreateOfferRequest>({
  title: '',
  description: '',
  originalPrice: 0,
  discountPrice: 0,
  storeId: 0,
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

function validate(): boolean {
  errors.value = {}
  if (!form.title.trim()) errors.value.title = 'Título é obrigatório'
  if (form.originalPrice <= 0) errors.value.originalPrice = 'Preço deve ser maior que zero'
  if (form.discountPrice >= form.originalPrice) {
    errors.value.discountPrice = 'Desconto deve ser menor que o preço original'
  }
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  isSubmitting.value = true
  try {
    await offerStore.create(form)
    router.push({ name: 'offers' })
  } catch (err) {
    // Tratar erros da API
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

## Performance

1. **Lazy loading de rotas**: usar `() => import(...)` para code splitting
2. **Componentes assíncronos**: `defineAsyncComponent` para componentes pesados
3. **Estabilidade de props**: evitar passar objetos recalculados — usar computed estáveis
4. **`v-once`**: para conteúdo que nunca muda após renderização
5. **`v-memo`**: para listas grandes com atualizações parciais
6. **`shallowRef`**: para listas grandes de objetos imutáveis
7. **Virtualização**: usar `vue-virtual-scroller` para listas com 1000+ itens
8. **Evitar abstrações desnecessárias**: componentes wrapper sem necessidade real geram overhead

## Segurança

1. **Nunca usar templates não confiáveis**: jamais interpolar input do usuário como template Vue
2. **Cuidado com `v-html`**: apenas para conteúdo sanitizado
3. **Sanitizar URLs**: validar URLs dinâmicas para evitar `javascript:` injection
4. **Style binding seguro**: usar object syntax para estilos controlados pelo usuário
5. **Tokens**: armazenar em `httpOnly` cookies quando possível (ou localStorage com cuidado)
6. **CSRF**: garantir que o back-end trata corretamente

## Testes

### Testes Unitários (Vitest)

```typescript
// components/OfferCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OfferCard from './OfferCard.vue'

describe('OfferCard', () => {
  it('renders offer title', () => {
    const wrapper = mount(OfferCard, {
      props: {
        offer: {
          id: 1,
          title: 'Oferta Teste',
          originalPrice: 100,
          discountPrice: 80,
          active: true,
        },
      },
    })
    expect(wrapper.text()).toContain('Oferta Teste')
  })

  it('emits delete event on button click', async () => {
    const wrapper = mount(OfferCard, { props: { offer: mockOffer } })
    await wrapper.find('[data-testid="delete-btn"]').trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)
    expect(wrapper.emitted('delete')![0]).toEqual([mockOffer.id])
  })
})
```

### Testes de Composables

```typescript
import { describe, it, expect } from 'vitest'
import { usePagination } from '@/composables/usePagination'

describe('usePagination', () => {
  it('starts at page 0', () => {
    const { currentPage } = usePagination()
    expect(currentPage.value).toBe(0)
  })

  it('navigates to next page', () => {
    const { currentPage, totalElements, nextPage } = usePagination(10)
    totalElements.value = 50
    nextPage()
    expect(currentPage.value).toBe(1)
  })
})
```

## Variáveis de Ambiente

Usar prefixo `VITE_` para variáveis acessíveis no client-side:

```
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_TITLE=Daqui - Dev

# .env.production
VITE_API_BASE_URL=https://api.daqui.com/api/v1
VITE_APP_TITLE=Daqui
```

Acessar com `import.meta.env.VITE_*`.

## Acessibilidade

- Usar elementos HTML semânticos (`<nav>`, `<main>`, `<article>`, `<button>`)
- Labels em todos os inputs de formulário
- `aria-label` em ícones e botões sem texto visível
- Foco visível para navegação por teclado
- Contraste de cores adequado (WCAG AA mínimo)
- `role` attributes onde necessário
