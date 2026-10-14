# Implementation Plan: Marketplace Vitrine

## Overview

Implementação de uma aplicação Vue.js 3 pública e somente leitura (vitrine de marketplace) em um diretório standalone `vitrine/`. A aplicação consome a API REST do PlaceOffers para exibir produtos ativos a visitantes não autenticados, com busca client-side, filtro por categoria via API, paginação "carregar mais", e design responsivo com acessibilidade WCAG AA.

## Tasks

- [x] 1. Set up project structure and core configuration
  - [x] 1.1 Initialize the Vitrine Vue.js 3 project with Vite, TypeScript, Pinia, Vue Router and Axios
    - Create `vitrine/` directory with `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`
    - Configure Vite with Vue plugin and path alias (`@` → `src/`)
    - Add devDependencies: vitest, @vue/test-utils, fast-check, jsdom
    - Create `.env.development` with `VITE_API_BASE_URL=http://localhost:8080/api/v1`
    - Create `.env.production` with placeholder `VITE_API_BASE_URL`
    - Create `src/main.ts` bootstrapping Vue app with Pinia and Vue Router
    - Create `src/App.vue` with `<router-view>` and base layout structure
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 1.2 Define TypeScript interfaces and types
    - Create `src/types/produto.ts` with `Produto` interface and `Categoria` type
    - Create `src/types/api.ts` with `PageResponse<T>` interface
    - Ensure types match the PlaceOffers API contract (id, nome, descricao, preco, categoria, urlImagem, ativo, nomeLoja, telefone, createdAt, updatedAt)
    - _Requirements: 5.3, 6.1, 6.3, 6.4_

  - [x] 1.3 Create Axios instance and product service layer
    - Create `src/services/api.ts` with Axios instance (baseURL from env, timeout 10s, no auth interceptors)
    - Create `src/services/produtoService.ts` with `findAll(page, size, categoria?)` and `findById(id)` methods
    - Ensure only GET requests are made, no POST/PUT/PATCH/DELETE methods
    - _Requirements: 1.3, 1.4, 10.1, 10.2_

  - [x] 1.4 Configure Vue Router with home and product detail routes
    - Create `src/router/index.ts` with history mode
    - Define route `/` → `HomeView.vue` (lazy loaded)
    - Define route `/produto/:id` → `ProductDetailView.vue` (lazy loaded, props: true)
    - Ensure no routes for creation, editing, or deletion views exist
    - _Requirements: 6.6, 7.1, 10.4_

- [x] 2. Implement Pinia store and core logic
  - [x] 2.1 Implement the useProductStore with Pinia (setup syntax)
    - Create `src/stores/useProductStore.ts`
    - Implement state: products, currentProduct, isLoading, isLoadingMore, error, currentPage, totalPages, searchQuery, activeCategory
    - Implement `fetchProducts(options?: { append?: boolean })` action with pagination and category filter
    - Implement `fetchProductById(id)` action
    - Implement `setSearchQuery(query)` and `setCategory(categoria)` actions
    - Implement `filteredProducts` computed (client-side case-insensitive name filter)
    - Implement `hasMorePages` computed (`currentPage < totalPages - 1`)
    - Filter only `ativo === true` products from API response
    - _Requirements: 2.3, 5.2, 5.3, 8.1, 8.2, 8.3, 8.4, 9.1_

  - [x] 2.2 Create useFormatters composable
    - Create `src/composables/useFormatters.ts`
    - Implement `formatPrice(value: number): string` using `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
    - Implement `truncateText(text: string, maxLength: number): string` with ellipsis logic
    - _Requirements: 3.2, 3.4, 6.4_

  - [x] 2.3 Write property test for search filter correctness
    - **Property 1: Search filter correctness**
    - Generate random product lists and search strings with fast-check
    - Verify filtered results contain only products whose `nome` includes the search string (case-insensitive)
    - Verify every matching product from the original list appears in filtered results
    - **Validates: Requirements 2.3, 2.5**

  - [x] 2.4 Write property test for active product filtering
    - **Property 3: Active product filtering**
    - Generate product lists with mixed `ativo` values using fast-check
    - Verify store exposes only products where `ativo === true`
    - Verify count of displayed products equals count of `ativo === true` in original response
    - **Validates: Requirements 5.3**

  - [x] 2.5 Write property test for hasMorePages correctness
    - **Property 6: hasMorePages correctness**
    - Generate random pairs (currentPage, totalPages) with fast-check
    - Verify `hasMorePages` is `true` iff `currentPage < totalPages - 1`
    - **Validates: Requirements 8.3, 8.4**

  - [x] 2.6 Write property test for pagination append without data loss
    - **Property 5: Pagination appends without data loss**
    - Generate random product lists (existing + new page) with fast-check
    - Verify resulting list contains all previous products in original order followed by new products
    - Verify total length equals sum of previous list length plus new page length
    - **Validates: Requirements 8.2**

- [x] 3. Implement shared UI components
  - [x] 3.1 Implement ErrorState component
    - Create `src/components/ui/ErrorState.vue`
    - Props: `message: string`
    - Emits: `retry`
    - Display friendly error message and "Tentar novamente" button
    - Do not expose internal error details or API structure
    - _Requirements: 9.1, 9.4, 10.5_

  - [x] 3.2 Implement EmptyState component
    - Create `src/components/ui/EmptyState.vue`
    - Props: `message: string`
    - Display "Nenhum produto encontrado" message
    - _Requirements: 5.7, 9.2_

  - [x] 3.3 Implement LoadingSkeletons component
    - Create `src/components/ui/LoadingSkeletons.vue`
    - Props: `count: number` (default 6)
    - Render animated skeleton cards matching Card_de_Produto dimensions
    - _Requirements: 5.5, 9.3_

- [x] 4. Implement product components
  - [x] 4.1 Implement ProductCard component
    - Create `src/components/product/ProductCard.vue`
    - Display product image (200x200, maintain aspect ratio) with gray placeholder on null/error
    - Display product name with CSS `line-clamp: 2` and ellipsis
    - Display store name (nomeLoja) when available, hide area when null
    - Display price formatted as BRL (pt-BR locale)
    - Display "Ver Oferta" button as primary CTA
    - Emit `view-detail` with product id on button click
    - Use `alt` attribute with product name for product image
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 11.3_

  - [x] 4.2 Implement ProductGrid component
    - Create `src/components/product/ProductGrid.vue`
    - Props: `products: Produto[]`, `isLoading: boolean`
    - Responsive grid: 3 columns (≥1024px), 2 columns (768px–1023px), 1 column (<768px)
    - Render ProductCard for each product
    - _Requirements: 5.4, 11.1_

  - [x] 4.3 Write property test for price formatting as BRL currency
    - **Property 4: Price formatting as BRL currency**
    - Generate random non-negative numbers with fast-check
    - Verify formatted output starts with "R$", uses comma as decimal separator with 2 decimal places, period as thousands separator
    - Verify numeric value parsed back equals original value rounded to 2 decimal places
    - **Validates: Requirements 6.4**

  - [x] 4.4 Write property test for product image alt text
    - **Property 7: Product image alt text**
    - Generate products with random non-null `nome` using fast-check
    - Verify rendered product card image has `alt` attribute equal to product `nome`
    - **Validates: Requirements 11.3**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement home page sections
  - [x] 6.1 Implement AppHeader component
    - Create `src/components/layout/AppHeader.vue`
    - Display "PLACE OFFERS" logo on the left
    - Display search bar (input + search button) centered
    - Position: fixed at top of viewport (sticky header)
    - Emit `search` event with the typed term on Enter or button click
    - Clear search when input is cleared and submitted
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 6.2 Implement BannerSection component
    - Create `src/components/home/BannerSection.vue`
    - Props: `title: string` (max 60 characters)
    - Truncate title at 60 characters with ellipsis if exceeds
    - Full width with differentiated background color
    - Position immediately below header, above product sections
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.3 Write property test for banner title truncation
    - **Property 2: Banner title truncation**
    - Generate strings of varying length with fast-check
    - Verify: if input ≤ 60 chars → output equals input unchanged
    - Verify: if input > 60 chars → output equals first 60 chars + "…" (61 chars total)
    - **Validates: Requirements 3.2, 3.4**

  - [x] 6.4 Implement CategorySection component
    - Create `src/components/home/CategorySection.vue`
    - Display "Categorias Populares" title
    - Display icons for 4 categories (VESTUARIO, ELETRODOMESTICOS, ACESSORIOS, SUPLEMENTOS) with accessible labels
    - Props: `activeCategory: string | null`
    - Emit `select` with clicked category
    - Toggle behavior: clicking active category removes filter
    - Visual highlight (distinct border/background) on active category
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Implement views and wire everything together
  - [x] 7.1 Implement HomeView page
    - Create `src/views/HomeView.vue`
    - Compose: AppHeader, BannerSection, CategorySection, ProductGrid, LoadingSkeletons, ErrorState, EmptyState
    - Wire search from AppHeader to store `setSearchQuery`
    - Wire category selection to store `setCategory` + `fetchProducts`
    - Display skeleton loading (6 placeholders) while initial fetch in progress
    - Display error state with retry when API fails
    - Display empty state when no products match filters
    - Implement "Carregar mais" button below grid when `hasMorePages` is true
    - Disable and show loading on "Carregar mais" button while fetching next page
    - Hide "Carregar mais" when all pages loaded
    - _Requirements: 5.1, 5.2, 5.5, 5.6, 5.7, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4_

  - [x] 7.2 Implement ProductDetailView page
    - Create `src/views/ProductDetailView.vue`
    - Fetch product by id from route params via store
    - Display loading indicator while fetching
    - Display product image (or placeholder), name, description, price (BRL), category, store name, store phone
    - Display error state with "Voltar para início" button navigating to home on API error
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 7.3 Add global styles and accessibility foundations
    - Create `src/assets/main.css` with base reset, responsive breakpoints, focus indicators (min 2px outline), contrast-safe colors
    - Use semantic HTML elements (nav, main, section, article) throughout components
    - Ensure all interactive elements have min 44×44px touch targets on mobile (<768px)
    - Ensure Tab navigation order is logical and all elements activatable via Enter/Space
    - Use `alt=""` on decorative images
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The Vitrine is strictly read-only: only GET requests, no auth tokens, no mutation forms or routes
- All code lives in `vitrine/` directory, completely independent from the PlaceOffers project

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.4"] },
    { "id": 2, "tasks": ["1.3", "3.1", "3.2", "3.3"] },
    { "id": 3, "tasks": ["2.1", "2.2"] },
    { "id": 4, "tasks": ["2.3", "2.4", "2.5", "2.6", "4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.4"] },
    { "id": 7, "tasks": ["6.3"] },
    { "id": 8, "tasks": ["7.1", "7.2"] },
    { "id": 9, "tasks": ["7.3"] }
  ]
}
```
