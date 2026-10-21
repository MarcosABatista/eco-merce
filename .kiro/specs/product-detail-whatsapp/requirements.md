# Requirements Document

## Introduction

Este documento especifica os requisitos para a **Página de Detalhes do Produto estilo Mercado Livre** e o **Botão de Contato via WhatsApp** no projeto Vitrine do daqui. A funcionalidade aprimora a experiência do visitante ao navegar produtos, oferecendo uma visualização detalhada rica (imagem em destaque, informações do vendedor, descrição expandida) inspirada no layout do Mercado Livre, além de um botão de contato por WhatsApp disponível tanto no Card_de_Produto na página inicial quanto na página de detalhes.

## Glossary

- **Vitrine**: Aplicação web pública (somente leitura) que exibe produtos ativos do daqui para visitantes
- **Visitante**: Usuário não autenticado que acessa a Vitrine para visualizar produtos
- **Produto**: Item cadastrado no daqui contendo nome, descrição, preço, categoria, imagem, nome da loja e telefone do vendedor
- **Card_de_Produto**: Componente visual na grade da página inicial que exibe resumo do produto
- **Página_de_Detalhes**: Página dedicada que exibe todas as informações de um Produto em layout estilo Mercado Livre
- **Galeria_de_Imagem**: Área principal da Página_de_Detalhes que exibe a imagem do produto em tamanho ampliado
- **Painel_de_Informações**: Seção lateral direita da Página_de_Detalhes contendo nome, preço, condição e ações do produto
- **Seção_Vendedor**: Área na Página_de_Detalhes que exibe informações da loja vendedora (nome da loja e telefone)
- **Seção_Descrição**: Área abaixo da galeria que exibe a descrição completa do produto
- **Botão_WhatsApp**: Botão de ação que abre uma conversa no WhatsApp Web ou app com o número de telefone do vendedor
- **WhatsApp_Link**: URL no formato `https://wa.me/{número}?text={mensagem}` que direciona o Visitante ao WhatsApp do vendedor
- **daqui_API**: API REST do backend daqui disponível em `/api/v1`
- **Breadcrumb**: Componente de navegação que mostra o caminho hierárquico (Início > Categoria > Produto)

## Requirements

### Requirement 1: Navegação para a Página de Detalhes

**User Story:** As a Visitante, I want to click on a product to see its full details, so that I can evaluate the product before contacting the seller.

#### Acceptance Criteria

1. WHEN the Visitante clicks on a Card_de_Produto or on the "Ver Oferta" button in the homepage grid, THE Vitrine SHALL navigate to the Página_de_Detalhes using the route `/produto/{id}` where `{id}` is the product identifier
2. WHEN the Visitante navigates to the Página_de_Detalhes, THE Vitrine SHALL fetch the product data from the daqui_API endpoint GET `/api/v1/produtos/{id}`
3. WHILE the Vitrine is fetching the product data, THE Vitrine SHALL display a loading skeleton matching the layout structure of the Página_de_Detalhes, and SHALL display this skeleton for no longer than 30 seconds before showing a timeout error
4. THE Página_de_Detalhes SHALL display a Breadcrumb component showing the navigation path "Início > {categoria} > {nome do produto}" where each segment except the last is a clickable link
5. WHEN the Visitante clicks on "Início" in the Breadcrumb, THE Vitrine SHALL navigate back to the homepage
6. IF the product categoria field is null, THEN THE Breadcrumb SHALL display only "Início > {nome do produto}" omitting the category segment

### Requirement 2: Layout da Página de Detalhes Estilo Mercado Livre

**User Story:** As a Visitante, I want to see the product details in a professional layout similar to Mercado Livre, so that I have a familiar and trustworthy shopping experience.

#### Acceptance Criteria

1. THE Página_de_Detalhes SHALL use a two-column layout on viewports of 1024px and above, with the Galeria_de_Imagem occupying the left column (60% width) and the Painel_de_Informações occupying the right column (40% width)
2. WHILE the viewport width is less than 1024px, THE Página_de_Detalhes SHALL stack the Galeria_de_Imagem above the Painel_de_Informações in a single-column layout
3. THE Galeria_de_Imagem SHALL display the product image (urlImagem) in a container with a minimum height of 400px, scaled to fit while maintaining aspect ratio, and SHALL display a neutral gray placeholder of the same dimensions when urlImagem is null or the image fails to load
4. THE Painel_de_Informações SHALL display, in the following order from top to bottom: the product category (categoria) as a clickable tag that navigates to the home page filtered by that category, the product name (nome) as a heading, the product price (preco) formatted as Brazilian currency (pt-BR locale, e.g., "R$ 1.299,90") in a font size at least 1.5 times the base body font size and bold weight, and the Botão_WhatsApp
5. THE Seção_Descrição SHALL be displayed below the two-column area spanning the full content width, with the heading "Descrição" followed by the product description text (descricao)
6. IF the product description (descricao) is null or empty, THEN THE Página_de_Detalhes SHALL hide the Seção_Descrição entirely
7. WHILE the viewport width is 1024px or above, THE Página_de_Detalhes SHALL display the Seção_Vendedor below the Painel_de_Informações, containing the store name (nomeLoja) and the store phone number (telefone)
8. WHILE the viewport width is less than 1024px, THE Página_de_Detalhes SHALL display the Seção_Vendedor below the Seção_Descrição, containing the store name (nomeLoja) and the store phone number (telefone)
9. IF the nomeLoja is null, THEN THE Seção_Vendedor SHALL display "Loja não informada" as the store name
10. IF the telefone is null, THEN THE Seção_Vendedor SHALL hide the phone number field entirely

### Requirement 3: Botão de WhatsApp na Página de Detalhes

**User Story:** As a Visitante, I want to contact the seller via WhatsApp directly from the product detail page, so that I can ask questions or negotiate the offer.

#### Acceptance Criteria

1. THE Página_de_Detalhes SHALL display the Botão_WhatsApp within the Painel_de_Informações, styled with a WhatsApp brand green background color (#25D366), white text, and the WhatsApp icon
2. WHEN the Visitante clicks the Botão_WhatsApp, THE Vitrine SHALL open a new browser tab with the WhatsApp_Link formatted as `https://wa.me/{telefone_formatado}?text={mensagem_encoded}` where telefone_formatado is the telefone field with all non-numeric characters removed and prefixed with "55" (Brazil country code) if not already present, and mensagem_encoded is a URL-encoded default message "Olá! Tenho interesse no produto: {nome do produto}"
3. THE Botão_WhatsApp SHALL have a minimum touch target size of 44x44 CSS pixels and display the text "Chamar no WhatsApp"
4. IF the product telefone field is null, empty, or contains only whitespace characters, THEN THE Página_de_Detalhes SHALL hide the Botão_WhatsApp entirely and not render it in the DOM
5. THE Botão_WhatsApp SHALL include an accessible label (aria-label) with the text "Entrar em contato com a loja via WhatsApp"
6. IF the telefone field, after removing all non-numeric characters, contains fewer than 10 digits or more than 13 digits, THEN THE Página_de_Detalhes SHALL hide the Botão_WhatsApp entirely

### Requirement 4: Botão de WhatsApp no Card de Produto (Página Inicial)

**User Story:** As a Visitante, I want to contact the seller via WhatsApp directly from the product card on the homepage, so that I can quickly reach the seller without needing to open the full product details.

#### Acceptance Criteria

1. THE Card_de_Produto SHALL display a Botão_WhatsApp below the existing "Ver Oferta" button, styled with a green background color (#25D366), white text, the WhatsApp icon, and the text "WhatsApp"
2. WHEN the Visitante clicks the Botão_WhatsApp on a Card_de_Produto, THE Vitrine SHALL open a new browser tab with the WhatsApp_Link constructed using the formatting rules defined in Requirement 5 (strip non-numeric characters, apply "55" country code prefix logic, and URL-encode the default message "Olá! Tenho interesse no produto: {nome}")
3. WHEN the Visitante clicks the Botão_WhatsApp on a Card_de_Produto, THE Vitrine SHALL NOT navigate to the Página_de_Detalhes (the click event propagation to the card is stopped)
4. IF the product telefone field is null, empty, or contains fewer than 10 digits after stripping non-numeric characters, THEN THE Card_de_Produto SHALL hide the Botão_WhatsApp for that specific product
5. THE Botão_WhatsApp on the Card_de_Produto SHALL have a minimum touch target size of 44x44 CSS pixels and include an accessible aria-label with the text "Entrar em contato com a loja {nomeLoja} via WhatsApp", or "Entrar em contato via WhatsApp" when nomeLoja is null

### Requirement 5: Formatação do Link WhatsApp

**User Story:** As a developer, I want a consistent and reusable function for generating WhatsApp links, so that the link format is correct across all components.

#### Acceptance Criteria

1. THE Vitrine SHALL generate WhatsApp_Link URLs using the format `https://wa.me/{numero}?text={mensagem}` where numero contains only digits and has a length between 12 and 13 characters (country code + area code + number)
2. WHEN the telefone field contains non-numeric characters (parentheses, dashes, spaces, plus signs, or any other non-digit character), THE Vitrine SHALL strip all non-numeric characters before applying any further formatting rules
3. WHEN the telefone field, after stripping non-numeric characters, contains a number starting with "0" (e.g., "011999998888"), THE Vitrine SHALL remove the leading "0" and prepend "55" to form the international format
4. WHEN the telefone field, after stripping non-numeric characters, already starts with "55" followed by 10 or 11 digits (total length of 12 or 13 digits), THE Vitrine SHALL use the number as-is without adding an additional country code prefix
5. WHEN the telefone field, after stripping non-numeric characters and removing any leading "0", contains a number that does not start with "55" and has 10 or 11 digits, THE Vitrine SHALL prepend "55" to form the international format
6. IF the telefone field, after stripping all non-numeric characters and removing any leading "0", results in fewer than 10 digits or more than 11 digits (excluding the "55" country code prefix), THEN THE Vitrine SHALL treat the number as invalid and hide the Botão_WhatsApp
7. THE Vitrine SHALL URL-encode the default message text "Olá! Tenho interesse no produto: {nome}" using encodeURIComponent before appending to the WhatsApp_Link, where {nome} is replaced by the product nome field value (or an empty string if nome is null)

### Requirement 6: Tratamento de Erros na Página de Detalhes

**User Story:** As a Visitante, I want clear feedback when a product cannot be loaded, so that I understand what happened and can navigate back.

#### Acceptance Criteria

1. IF the daqui_API returns HTTP 404 for the product request, THEN THE Página_de_Detalhes SHALL hide the loading indicator and display a message "Produto não encontrado" and a button labeled "Voltar para a página inicial" that navigates to the homepage
2. IF the daqui_API returns a network error or HTTP 5xx for the product request, THEN THE Página_de_Detalhes SHALL hide the loading indicator and display a message "Não foi possível carregar o produto" and a "Tentar novamente" button that re-triggers the product fetch
3. IF the Visitante navigates to a product route with a non-numeric ID, THEN THE Vitrine SHALL redirect the Visitante to the homepage without displaying the Página_de_Detalhes
4. WHILE the Página_de_Detalhes is fetching the product data, THE Página_de_Detalhes SHALL display a loading indicator and SHALL NOT display error messages or product content
5. IF the Visitante clicks "Tentar novamente" and the retry request also fails with a network error or HTTP 5xx, THEN THE Página_de_Detalhes SHALL continue displaying the error message and the "Tentar novamente" button, allowing unlimited manual retries

### Requirement 7: Responsividade e Acessibilidade da Página de Detalhes

**User Story:** As a Visitante, I want the product detail page to work well on any device and be accessible, so that I can browse products regardless of my device or abilities.

#### Acceptance Criteria

1. THE Página_de_Detalhes SHALL adapt its layout to mobile (below 768px), tablet (768px to 1023px), and desktop (1024px and above) viewports
2. WHILE the viewport width is below 768px, THE Galeria_de_Imagem SHALL occupy 100% of the viewport width with a maximum height of 300px
3. WHILE the viewport width is between 768px and 1023px, THE Galeria_de_Imagem SHALL occupy 100% of the content width with a maximum height of 400px, and the Painel_de_Informações SHALL be displayed in a single column below it
4. THE Página_de_Detalhes SHALL use semantic HTML elements: main for the content area, nav for the Breadcrumb, section for Seção_Descrição and Seção_Vendedor, and heading elements (h1 for product name, h2 for section titles)
5. THE Página_de_Detalhes SHALL provide alt text containing the product name on the product image, and use role="img" with aria-label="Imagem indisponível" on the placeholder when no image is available
6. THE Página_de_Detalhes SHALL ensure all interactive elements (buttons, links) are reachable via Tab key in the following logical order: Breadcrumb links, category tag, Botão_WhatsApp, description content, seller info links, and back/retry buttons
7. THE Página_de_Detalhes SHALL display a visible focus indicator with a minimum 2px outline offset on all interactive elements
8. THE Página_de_Detalhes SHALL maintain a minimum contrast ratio of 4.5:1 for all text content (WCAG AA compliance)
9. WHEN the browser zoom is set to 200%, THE Página_de_Detalhes SHALL reflow content to fit within the viewport without horizontal scrolling
