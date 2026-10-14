# Documento de Requisitos — Preço com Desconto

## Introdução

Esta funcionalidade adiciona o campo de preço com desconto (`preco_desconto`) à tabela de produtos. O back-end calcula automaticamente o percentual de desconto com base no preço original e no preço com desconto informados. Ambos os front-ends (admin Place Offers e Vitrine pública) exibem o preço original riscado, o preço com desconto em destaque e um badge com o percentual de desconto.

## Glossário

- **Sistema_Backend**: Aplicação Spring Boot responsável pela API REST, persistência e lógica de negócio
- **Sistema_Admin**: Front-end Vue.js do projeto Place Offers utilizado para gerenciar produtos
- **Sistema_Vitrine**: Front-end Vue.js público onde consumidores visualizam os produtos
- **Produto**: Entidade de domínio representando um item cadastrado por um usuário
- **Preco_Original**: Valor cheio do produto armazenado na coluna `preco` (NUMERIC(10,2))
- **Preco_Desconto**: Valor promocional do produto armazenado na coluna `preco_desconto` (NUMERIC(10,2), nullable)
- **Percentual_Desconto**: Campo computado que representa a porcentagem de desconto calculada como `((preco - preco_desconto) / preco) * 100`, arredondado para inteiro
- **Badge_Desconto**: Elemento visual que exibe o percentual de desconto (ex: "-20%")

## Requisitos

### Requisito 1: Persistência do campo de preço com desconto

**User Story:** Como administrador do sistema, quero cadastrar um preço com desconto para um produto, para que consumidores vejam ofertas promocionais.

#### Critérios de Aceite

1. THE Sistema_Backend SHALL armazenar o campo `preco_desconto` na tabela `produtos` como NUMERIC(10,2) nullable
2. WHEN o campo `preco_desconto` for informado, THE Sistema_Backend SHALL validar que o valor é maior que zero
3. WHEN o campo `preco_desconto` for informado, THE Sistema_Backend SHALL validar que o valor é estritamente menor que o Preco_Original do Produto
4. WHEN o campo `preco_desconto` não for informado, THE Sistema_Backend SHALL armazenar o valor como NULL na coluna `preco_desconto`
5. THE Sistema_Backend SHALL aplicar uma migration Flyway para adicionar a coluna `preco_desconto` à tabela `produtos` com constraint CHECK garantindo que `preco_desconto > 0`

### Requisito 2: Cálculo do percentual de desconto na API

**User Story:** Como consumidor da API, quero receber o percentual de desconto calculado na resposta, para que os front-ends não precisem duplicar lógica de cálculo.

#### Critérios de Aceite

1. WHEN o Produto possuir Preco_Desconto preenchido, THE Sistema_Backend SHALL calcular o Percentual_Desconto usando a fórmula `((preco - preco_desconto) / preco) * 100` e arredondar para o inteiro mais próximo
2. WHEN o Produto não possuir Preco_Desconto preenchido, THE Sistema_Backend SHALL retornar o campo `percentualDesconto` como NULL na resposta da API
3. THE Sistema_Backend SHALL incluir os campos `precoDesconto` e `percentualDesconto` no DTO de resposta `ProdutoResponse`
4. THE Sistema_Backend SHALL retornar o campo `percentualDesconto` como um valor inteiro entre 1 e 99 inclusive

### Requisito 3: Formulário de cadastro e edição com campo de preço com desconto

**User Story:** Como administrador, quero preencher o preço com desconto ao criar ou editar um produto, para configurar promoções.

#### Critérios de Aceite

1. THE Sistema_Admin SHALL exibir um campo opcional "Preço com desconto" nos formulários de criação e edição de produto
2. WHEN o administrador preencher o campo de preço com desconto, THE Sistema_Admin SHALL validar que o valor informado é menor que o preço original antes de enviar ao back-end
3. WHEN o administrador deixar o campo de preço com desconto vazio, THE Sistema_Admin SHALL enviar o valor como NULL na requisição ao back-end
4. WHEN o back-end retornar erro de validação para o campo de preço com desconto, THE Sistema_Admin SHALL exibir a mensagem de erro associada ao campo

### Requisito 4: Exibição do preço com desconto na listagem do admin

**User Story:** Como administrador, quero ver na listagem de produtos quais possuem desconto configurado, para gerenciar minhas promoções.

#### Critérios de Aceite

1. WHILE um Produto possuir Preco_Desconto preenchido, THE Sistema_Admin SHALL exibir o Preco_Original com estilo riscado (text-decoration: line-through) e o Preco_Desconto em destaque na listagem de produtos
2. WHILE um Produto não possuir Preco_Desconto preenchido, THE Sistema_Admin SHALL exibir apenas o Preco_Original normalmente na listagem de produtos

### Requisito 5: Exibição do preço com desconto no ProductCard da vitrine

**User Story:** Como consumidor, quero visualizar o preço com desconto em destaque nos cards de produtos, para identificar rapidamente as promoções.

#### Critérios de Aceite

1. WHILE um Produto possuir Preco_Desconto preenchido, THE Sistema_Vitrine SHALL exibir o Preco_Original com estilo riscado (text-decoration: line-through) no componente ProductCard
2. WHILE um Produto possuir Preco_Desconto preenchido, THE Sistema_Vitrine SHALL exibir o Preco_Desconto como o preço principal em destaque no componente ProductCard
3. WHILE um Produto possuir Preco_Desconto preenchido, THE Sistema_Vitrine SHALL exibir um Badge_Desconto contendo o Percentual_Desconto no formato "-X%" no componente ProductCard
4. WHILE um Produto não possuir Preco_Desconto preenchido, THE Sistema_Vitrine SHALL exibir apenas o Preco_Original normalmente no componente ProductCard

### Requisito 6: Exibição do preço com desconto na página de detalhe da vitrine

**User Story:** Como consumidor, quero ver o preço original riscado e o preço com desconto em destaque na página de detalhe, para entender a economia antes de comprar.

#### Critérios de Aceite

1. WHILE um Produto possuir Preco_Desconto preenchido, THE Sistema_Vitrine SHALL exibir o Preco_Original com estilo riscado (text-decoration: line-through) na ProductDetailView
2. WHILE um Produto possuir Preco_Desconto preenchido, THE Sistema_Vitrine SHALL exibir o Preco_Desconto como o preço principal em destaque na ProductDetailView
3. WHILE um Produto possuir Preco_Desconto preenchido, THE Sistema_Vitrine SHALL exibir um Badge_Desconto contendo o Percentual_Desconto no formato "-X%" na ProductDetailView
4. WHILE um Produto não possuir Preco_Desconto preenchido, THE Sistema_Vitrine SHALL exibir apenas o Preco_Original normalmente na ProductDetailView

### Requisito 7: Atualização dos tipos TypeScript nos front-ends

**User Story:** Como desenvolvedor, quero que os tipos TypeScript reflitam os novos campos da API, para manter a type-safety nos projetos front-end.

#### Critérios de Aceite

1. THE Sistema_Admin SHALL incluir os campos `precoDesconto` (number | null) e `percentualDesconto` (number | null) na interface Produto do serviço de produtos
2. THE Sistema_Admin SHALL incluir o campo `precoDesconto` (number | null) nas interfaces de request de criação e atualização de produto
3. THE Sistema_Vitrine SHALL incluir os campos `precoDesconto` (number | null) e `percentualDesconto` (number | null) na interface Produto do módulo de tipos
