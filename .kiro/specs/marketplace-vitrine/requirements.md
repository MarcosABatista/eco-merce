# Requirements Document

## Introduction

O **Marketplace Vitrine** é uma aplicação web pública (somente leitura) que consome a API do backend PlaceOffers para exibir produtos ativos a visitantes. A aplicação funciona como uma vitrine de marketplace, permitindo que visitantes naveguem, busquem e filtrem produtos por categoria sem necessidade de autenticação. O projeto é completamente desacoplado do sistema PlaceOffers existente, sendo construído como um projeto separado utilizando Vue.js 3, TypeScript, Vite e Pinia.

## Glossary

- **Vitrine**: A aplicação web pública que exibe produtos do PlaceOffers para visitantes
- **Visitante**: Usuário não autenticado que acessa a Vitrine para visualizar produtos
- **Produto**: Item cadastrado no PlaceOffers contendo nome, descrição, preço, categoria, imagem e dados do vendedor
- **Produto_Ativo**: Produto cujo campo "ativo" é verdadeiro, elegível para exibição na Vitrine
- **Categoria**: Classificação de produto (VESTUARIO, ELETRODOMESTICOS, ACESSORIOS, SUPLEMENTOS)
- **Card_de_Produto**: Componente visual que exibe imagem, nome, loja, preço, badge de desconto e botão de ação de um Produto
- **PlaceOffers_API**: API REST do backend PlaceOffers disponível em `/api/v1`
- **Banner_Promocional**: Área de destaque no topo da página com conteúdo promocional rotativo
- **Barra_de_Busca**: Campo de texto no cabeçalho que permite ao Visitante buscar produtos por nome
- **Grade_de_Produtos**: Layout em grid que exibe múltiplos Card_de_Produto simultaneamente
- **Seção_de_Categorias**: Área com ícones clicáveis representando as categorias disponíveis
- **Paginação**: Mecanismo de carregamento progressivo de produtos da API

## Requirements

### Requirement 1: Estrutura do Projeto Separado

**User Story:** As a developer, I want the Marketplace Vitrine to be a completely separate project from PlaceOffers, so that it can be developed, deployed and maintained independently.

#### Acceptance Criteria

1. THE Vitrine SHALL be a standalone Vue.js 3 project in its own root directory with its own package.json, vite.config.ts and tsconfig.json, sharing no source code, node_modules or build configuration with the PlaceOffers project
2. THE Vitrine SHALL use TypeScript, Vite, Pinia and Vue Router as its core dependencies, listed explicitly in its own package.json
3. THE Vitrine SHALL communicate exclusively with the PlaceOffers_API via HTTP requests using Axios, with no direct database access, no shared file system resources and no import of modules from the PlaceOffers project
4. THE Vitrine SHALL configure the PlaceOffers_API base URL through an environment variable (VITE_API_BASE_URL), with a default fallback value of "http://localhost:8080/api/v1" used when the variable is not defined
5. WHEN the Vitrine build command is executed, THE Vitrine SHALL complete successfully without the PlaceOffers backend or frontend project being present on the same machine
6. IF the PlaceOffers_API is unreachable, THEN THE Vitrine SHALL display an error message indicating the service is unavailable and SHALL not crash or show a blank screen

### Requirement 2: Cabeçalho da Aplicação

**User Story:** As a Visitante, I want to see a header with the marketplace logo and a search bar, so that I can identify the application and search for products.

#### Acceptance Criteria

1. THE Vitrine SHALL display a header containing the "PLACE OFFERS" logo on the left side
2. THE Vitrine SHALL display the Barra_de_Busca in the header center area
3. WHEN the Visitante types a search term in the Barra_de_Busca and presses Enter or activates the search button, THE Vitrine SHALL filter the Grade_de_Produtos to show only products whose name contains the search term using case-insensitive comparison
4. WHILE the Visitante scrolls the page, THE Vitrine SHALL keep the header fixed at the top of the viewport
5. WHEN the Visitante clears the Barra_de_Busca and submits, THE Vitrine SHALL display all products in the Grade_de_Produtos without filtering

### Requirement 3: Banner Promocional

**User Story:** As a Visitante, I want to see a promotional banner area, so that I can discover highlighted offers and promotions.

#### Acceptance Criteria

1. THE Vitrine SHALL display a Banner_Promocional section immediately below the header and above the product listing sections, visible without scrolling on viewports of 768px height or greater
2. THE Banner_Promocional SHALL display a promotional title text with a maximum length of 60 characters
3. THE Banner_Promocional SHALL occupy 100% of the content area width and render a background color that differs from the adjacent content sections' background color
4. IF the promotional title text exceeds 60 characters, THEN THE Banner_Promocional SHALL truncate the text at 60 characters and append an ellipsis character

### Requirement 4: Seção de Categorias Populares

**User Story:** As a Visitante, I want to see popular categories with icons, so that I can quickly navigate to products of interest.

#### Acceptance Criteria

1. THE Vitrine SHALL display a Seção_de_Categorias titled "Categorias Populares" below the Banner_Promocional
2. THE Seção_de_Categorias SHALL display one icon for each Categoria available (VESTUARIO, ELETRODOMESTICOS, ACESSORIOS, SUPLEMENTOS), each with an accessible label identifying the category name
3. WHEN the Visitante clicks a Categoria icon, THE Vitrine SHALL filter the Grade_de_Produtos to display only products belonging to the selected Categoria, and SHALL visually highlight the active icon with a distinct border or background color
4. WHEN the Visitante clicks the currently active Categoria icon again, THE Vitrine SHALL remove the filter, restore the default icon styling, and display all Produto_Ativo items

### Requirement 5: Grade de Produtos (Ofertas do Dia)

**User Story:** As a Visitante, I want to see a grid of active products, so that I can browse available offers.

#### Acceptance Criteria

1. THE Vitrine SHALL display a Grade_de_Produtos section titled "Ofertas do Dia"
2. THE Vitrine SHALL fetch products from the PlaceOffers_API endpoint GET `/api/v1/produtos` with pagination parameters `page` (default 0) and `size` (default 20)
3. THE Vitrine SHALL display only Produto_Ativo items (products where ativo is true), showing for each product: the product image (or a placeholder if urlImagem is null), product name (nome), formatted price (preco in BRL currency format), and category (categoria)
4. THE Grade_de_Produtos SHALL use a responsive grid layout with 3 columns on viewports 1024px and above, 2 columns on viewports between 768px and 1023px, and a single column on viewports below 768px
5. WHEN the page loads, THE Vitrine SHALL display a loading indicator (skeleton or spinner) while products are being fetched from the PlaceOffers_API
6. IF the PlaceOffers_API request fails, THEN THE Vitrine SHALL display an error message indicating that products could not be loaded and SHALL offer a retry action to re-fetch the products
7. IF the PlaceOffers_API returns zero Produto_Ativo items, THEN THE Vitrine SHALL display an empty-state message indicating that no offers are currently available

### Requirement 6: Card de Produto

**User Story:** As a Visitante, I want each product to be displayed as a card with image, name, store, price and action button, so that I can quickly evaluate offers.

#### Acceptance Criteria

1. THE Card_de_Produto SHALL display the product image (urlImagem) scaled to fit a fixed container of 200x200 pixels while maintaining aspect ratio, and SHALL display a neutral gray placeholder of the same dimensions when urlImagem is null or the image fails to load
2. THE Card_de_Produto SHALL display the product name (nome) truncated with ellipsis if it exceeds 2 lines of text
3. THE Card_de_Produto SHALL display the seller store name (nomeLoja) when available, and SHALL hide the store name area when nomeLoja is null
4. THE Card_de_Produto SHALL display the product price (preco) formatted as Brazilian currency using the pt-BR locale (e.g., "R$ 1.299,90")
5. THE Card_de_Produto SHALL display a "Ver Oferta" button as the primary call-to-action
6. WHEN the Visitante clicks the "Ver Oferta" button, THE Vitrine SHALL navigate to the product detail page passing the product id as a route parameter

### Requirement 7: Página de Detalhe do Produto

**User Story:** As a Visitante, I want to view full details of a product, so that I can make an informed decision about the offer.

#### Acceptance Criteria

1. WHEN the Visitante navigates to a product detail page, THE Vitrine SHALL fetch the product data from the PlaceOffers_API endpoint GET `/api/v1/produtos/{id}`
2. WHILE the Vitrine is fetching the product data, THE Vitrine SHALL display a loading indicator
3. WHEN the PlaceOffers_API returns the product data successfully, THE Vitrine SHALL display the product image (or a placeholder if no image is available), name, description, price formatted as Brazilian currency (BRL), category, store name, and store phone number
4. IF the PlaceOffers_API returns an error for the product request, THEN THE Vitrine SHALL display an error message indicating the product could not be loaded, and a button that navigates the Visitante back to the home page

### Requirement 8: Paginação de Produtos

**User Story:** As a Visitante, I want to load more products as I browse, so that I can explore all available offers without a slow initial load.

#### Acceptance Criteria

1. THE Vitrine SHALL request products with a page size of 20 items per request
2. WHEN the Visitante clicks the "Carregar mais" button, THE Vitrine SHALL fetch the next page of products from the PlaceOffers_API and append the results to the existing Grade_de_Produtos without removing previously loaded items
3. WHILE more pages are available (current page is less than totalPages - 1), THE Vitrine SHALL display the "Carregar mais" button below the Grade_de_Produtos
4. WHEN all pages have been loaded (current page equals totalPages - 1), THE Vitrine SHALL hide the "Carregar mais" button
5. WHILE the next page request is in progress, THE Vitrine SHALL display a loading indicator on the "Carregar mais" button and disable it to prevent duplicate requests

### Requirement 9: Tratamento de Erros e Estados Vazios

**User Story:** As a Visitante, I want clear feedback when something goes wrong or no products are found, so that I understand the current state of the application.

#### Acceptance Criteria

1. IF the PlaceOffers_API is unavailable or returns a network error, THEN THE Vitrine SHALL replace the Grade_de_Produtos content with a non-technical message indicating the service is temporarily unavailable and a "Tentar novamente" button that, when activated, re-triggers the product loading request
2. WHEN the Visitante applies a search or category filter that returns zero results, THE Vitrine SHALL display a "Nenhum produto encontrado" message in the Grade_de_Produtos area while keeping the search and filter controls visible and interactive so the Visitante can adjust the criteria
3. WHILE products are being loaded from the PlaceOffers_API, THE Vitrine SHALL display at least 6 skeleton loading placeholders in the Grade_de_Produtos area, each matching the dimensions of a Card_de_Produto
4. IF the Visitante activates the "Tentar novamente" button, THEN THE Vitrine SHALL display the skeleton loading state while the request is in progress, and if the request fails again, THE Vitrine SHALL return to the error state with the "Tentar novamente" button still available

### Requirement 10: Acesso Somente Leitura

**User Story:** As a system architect, I want the Vitrine to be strictly read-only, so that public visitors cannot modify product data.

#### Acceptance Criteria

1. THE Vitrine SHALL perform only GET requests to the PlaceOffers_API, and SHALL NOT issue POST, PUT, PATCH, or DELETE requests under any user interaction
2. THE Vitrine SHALL not include any authentication tokens, session cookies, or credentials in API requests sent to the PlaceOffers_API
3. THE Vitrine SHALL not provide any forms, buttons, input fields, or interactive elements for creating, editing, or deleting products
4. THE Vitrine SHALL not expose routes or navigation paths that lead to product creation, editing, or deletion views
5. IF the PlaceOffers_API returns an error or is unavailable, THEN THE Vitrine SHALL display a user-facing message indicating that product data could not be loaded, without exposing internal error details or API structure

### Requirement 11: Responsividade e Acessibilidade

**User Story:** As a Visitante, I want the marketplace to work well on any device and be accessible, so that I can browse products regardless of my device or abilities.

#### Acceptance Criteria

1. THE Vitrine SHALL adapt its layout to mobile (< 768px), tablet (768px–1024px), and desktop (> 1024px) viewports
2. THE Vitrine SHALL use semantic HTML elements (nav, main, section, article) for proper document structure
3. THE Vitrine SHALL provide alt text containing the product name on all product images, and use an empty alt attribute (alt="") on decorative images that convey no informational content
4. THE Vitrine SHALL ensure all interactive elements are reachable via Tab key in a logical reading order, activatable via Enter or Space key, and display a visible focus indicator with a minimum 2px outline offset
5. THE Vitrine SHALL maintain a minimum contrast ratio of 4.5:1 for text content (WCAG AA)
6. WHILE the viewport width is less than 768px, THE Vitrine SHALL render all interactive elements (buttons, links, inputs) with a minimum touch target size of 44×44 CSS pixels
