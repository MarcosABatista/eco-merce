# Implementation Plan: Product Detail Page with WhatsApp Contact

## Overview

This plan implements the Product Detail Page (Mercado Livre style) and WhatsApp Contact Button for the PlaceOffers frontend. The implementation is 100% frontend — no backend changes needed. We start with the reusable composable and components, then build the detail page view, update the router, and finally modify the HomeView to integrate WhatsApp buttons and clickable cards.

## Tasks

- [x] 1. Create the `useWhatsAppLink` composable
  - [x] 1.1 Create `src/composables/useWhatsAppLink.ts` with phone formatting and WhatsApp URL generation logic
    - Implement `formatWhatsAppNumber(telefone: string | null | undefined): string | null` that strips non-numeric chars, removes leading "0", prepends "55" if not already present, and validates digit count (10-11 after strip, resulting in 12-13 with country code)
    - Implement `buildWhatsAppUrl(telefone: string | null | undefined, nomeProduto: string | null | undefined): string | null` that calls formatWhatsAppNumber and constructs the full `https://wa.me/{number}?text={encoded_message}` URL
    - Export `useWhatsAppLink(telefone, nomeProduto): WhatsAppLinkResult` composable returning `{ whatsappUrl, isValid }`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 1.2 Write property tests for `useWhatsAppLink` composable using fast-check
    - **Property 1: Phone number formatting produces valid international format**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
    - **Property 2: Invalid phone numbers are rejected**
    - **Validates: Requirements 3.4, 3.6, 5.6**
    - **Property 3: Message text is correctly URL-encoded in WhatsApp link**
    - **Validates: Requirements 5.7**

  - [ ]* 1.3 Write unit tests for `useWhatsAppLink` composable
    - Test specific cases from the design: `(11) 99999-8888`, `+55 11 99999-8888`, `011999998888`, `999998888`, empty string, null
    - Test URL encoding with special characters, accents, emojis
    - Test edge cases: whitespace-only strings, numbers with exactly 10 and 11 digits
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 2. Create reusable `WhatsAppButton.vue` component
  - [x] 2.1 Create `src/components/ui/WhatsAppButton.vue`
    - Accept props: `telefone: string | null`, `nomeProduto: string | null`, `nomeLoja?: string | null`, `variant?: 'full' | 'compact'`
    - Use `useWhatsAppLink` composable internally for URL generation
    - Render nothing (v-if) when `isValid` is false (telefone null, empty, whitespace, or invalid digit count)
    - For `variant="full"`: display WhatsApp icon + "Chamar no WhatsApp" text, green (#25D366) background, white text
    - For `variant="compact"`: display WhatsApp icon + "WhatsApp" text, same styling but more compact
    - Open WhatsApp link in new tab (`window.open(url, '_blank')`) on click
    - Add `aria-label="Entrar em contato com a loja via WhatsApp"` for full variant
    - Add `aria-label="Entrar em contato com a loja {nomeLoja} via WhatsApp"` (or without nomeLoja if null) for compact variant
    - Ensure minimum touch target of 44x44 CSS pixels
    - Stop event propagation on click (prevent card navigation in compact variant)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.2 Write unit tests for `WhatsAppButton.vue`
    - Test conditional rendering: hidden when telefone is null/empty/invalid
    - Test that click opens correct WhatsApp URL in new tab
    - Test event propagation is stopped
    - Test aria-label content for both variants
    - Test minimum touch target size via CSS
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.3, 4.4, 4.5_

- [x] 3. Create `ProductBreadcrumb.vue` component
  - [x] 3.1 Create `src/components/ui/ProductBreadcrumb.vue`
    - Accept props: `categoria: string | null`, `nomeProduto: string`
    - Render `<nav>` with semantic breadcrumb markup
    - Display "Início > {categoria} > {nome}" when categoria is present
    - Display "Início > {nome}" when categoria is null
    - "Início" is a clickable `<router-link>` to homepage
    - Category segment is a clickable link (future: filter by category)
    - Last segment (product name) is plain text (not clickable)
    - _Requirements: 1.4, 1.5, 1.6_

  - [ ]* 3.2 Write unit tests for `ProductBreadcrumb.vue`
    - Test rendering with and without categoria
    - Test that "Início" links to homepage
    - Test that product name is not a link
    - _Requirements: 1.4, 1.5, 1.6_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create `ProdutoDetailView.vue` page
  - [x] 5.1 Create `src/views/ProdutoDetailView.vue` with full page structure
    - Use `<main>` as content wrapper with semantic HTML
    - Implement two-column layout: left column (60%) for image gallery, right column (40%) for product info panel
    - Stack to single column below 1024px viewport
    - Fetch product data from `produtoService.findById(id)` on mount
    - Handle route param `id` — redirect to home if non-numeric
    - Implement loading state with skeleton matching page layout structure
    - Implement error states: "Produto não encontrado" (404) with "Voltar para a página inicial" button, "Não foi possível carregar o produto" (5xx/network) with "Tentar novamente" button
    - Include `ProductBreadcrumb` at the top
    - _Requirements: 1.2, 1.3, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.4_

  - [x] 5.2 Implement the image gallery section (Galeria_de_Imagem)
    - Display product image with `object-fit: contain` and minimum height 400px
    - Show neutral gray placeholder when `urlImagem` is null or image fails to load (`@error` handler)
    - Add `alt` text with product name on image
    - Use `role="img"` with `aria-label="Imagem indisponível"` on placeholder
    - Responsive: 100% width with max-height 300px on mobile (<768px), 400px on tablet (768-1023px)
    - _Requirements: 2.1, 2.2, 2.3, 7.2, 7.3, 7.5_

  - [x] 5.3 Implement the product info panel (Painel_de_Informações)
    - Display category as clickable tag
    - Display product name as `<h1>` heading
    - Display price formatted as Brazilian currency (pt-BR locale, "R$ 1.299,90") with font-size 1.5x base and bold
    - Include `WhatsAppButton` with `variant="full"`
    - _Requirements: 2.4, 3.1, 3.2_

  - [x] 5.4 Implement the description section (Seção_Descrição) and seller section (Seção_Vendedor)
    - Description section: heading "Descrição" + description text, hidden entirely when `descricao` is null/empty
    - Seller section: display `nomeLoja` (or "Loja não informada" if null) and `telefone` (hidden if null)
    - Desktop (≥1024px): seller section below info panel in right column
    - Mobile/Tablet (<1024px): seller section below description section
    - Use `<section>` with `<h2>` for section titles
    - _Requirements: 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 7.4_

  - [x] 5.5 Implement accessibility and responsive styles
    - Ensure all interactive elements reachable via Tab in logical order: breadcrumb, category tag, WhatsApp button, description, seller info, back/retry buttons
    - Add visible focus indicator (minimum 2px outline offset) on all interactive elements
    - Maintain 4.5:1 contrast ratio for all text (WCAG AA)
    - Ensure content reflows at 200% zoom without horizontal scrolling
    - _Requirements: 7.1, 7.6, 7.7, 7.8, 7.9_

  - [ ]* 5.6 Write unit tests for `ProdutoDetailView.vue`
    - Test loading state rendering
    - Test successful data display
    - Test 404 error state with navigation button
    - Test 5xx error state with retry button
    - Test non-numeric ID redirect
    - Test description section visibility logic
    - Test seller section fallback text
    - _Requirements: 1.2, 1.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6. Update Vue Router with product detail route
  - [x] 6.1 Add `/produto/:id` route to `src/router/index.ts`
    - Add route with name `produto-detail`, lazy-loaded component `ProdutoDetailView.vue`
    - Mark route as `meta: { public: true }` so unauthenticated visitors can access it
    - Add navigation guard: redirect to home if `:id` param is non-numeric
    - _Requirements: 1.1, 6.3_

- [x] 7. Update `HomeView.vue` with WhatsApp buttons and clickable cards
  - [x] 7.1 Modify `src/views/HomeView.vue` to integrate WhatsApp button and card navigation
    - Import and add `WhatsAppButton` component with `variant="compact"` in each product card
    - Place the WhatsApp button below existing action buttons (edit/delete)
    - Make the product card clickable — navigate to `/produto/{id}` on card click
    - Ensure WhatsApp button click does NOT propagate to card (stops navigation)
    - Ensure edit/delete button clicks do NOT propagate to card
    - _Requirements: 1.1, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 7.2 Write unit tests for HomeView WhatsApp integration
    - Test WhatsApp button appears for products with valid telefone
    - Test WhatsApp button hidden for products without telefone
    - Test card click navigates to product detail
    - Test WhatsApp button click does not trigger card navigation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses Vitest + @vue/test-utils for component tests and fast-check for property-based tests
- All styles use pure scoped CSS (no Tailwind) following existing project conventions
- The `lucide-vue-next` library is already installed for icons

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1", "3.2"] },
    { "id": 2, "tasks": ["2.2", "5.1", "6.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.4"] },
    { "id": 4, "tasks": ["5.5", "7.1"] },
    { "id": 5, "tasks": ["5.6", "7.2"] }
  ]
}
```
