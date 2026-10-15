---
inclusion: always
---

# Produto — PlaceOffers

## Propósito

**PlaceOffers** é uma plataforma de ofertas para lojas composta por três partes:

1. **Backend (API)** — serviço Spring Boot que gerencia o cadastro de lojas (usuários) e seus
   produtos, expondo a API REST em `/api/v1`.
2. **Painel administrativo** — aplicação web autenticada onde o lojista cadastra e mantém sua
   loja e seus produtos (criar, editar, desativar), gerencia o próprio perfil e faz upload de
   imagens.
3. **Vitrine** — aplicação web pública (somente leitura) que exibe os produtos ativos a
   visitantes, no estilo de um marketplace. É o que o cliente final consome.

A promessa central é dupla:

1. **A vitrine sempre resolve.** O caminho de leitura pública (navegar, buscar, filtrar e ver
   detalhe de produtos) é o mais frequente e recebe prioridade em desempenho e disponibilidade.
   Indisponibilidade da API degrada graciosamente, com mensagem clara, nunca tela branca.
2. **O contato é direto.** A vitrine aproxima o visitante do lojista via WhatsApp, sem
   intermediação de carrinho ou checkout — a negociação acontece fora da plataforma.

## Usuários-alvo

| Perfil | Como usa | O que espera |
|---|---|---|
| **Visitante anônimo** | Vitrine pública, sem cadastro | Navegar, buscar e filtrar produtos, ver detalhe e falar com a loja pelo WhatsApp |
| **Lojista** (`usuario`) | Painel autenticado | Cadastrar e manter a própria loja e produtos; controlar o que fica ativo na vitrine |
| **Administrador** (`admin`) | Painel + administração | Gerir contas, lojas e o acervo de produtos da plataforma |

## Domínio

### Loja / Usuário

Representa a loja cadastrada. Campos principais: `nome`, `email` (único), `cpfCnpj` (único,
11 dígitos CPF ou 14 CNPJ), `telefone`, `nomeLoja`, `imagemLoja`, `ativo`, `admin`. A senha é
armazenada com hash BCrypt e nunca retorna nas respostas da API.

### Produto

Oferta vinculada a uma loja. Campos principais: `nome`, `descricao`, `preco` (> 0, até
9.999.999,99, duas casas), `categoria`, `urlImagem`, `ativo`, e os derivados da loja
(`nomeLoja`, `telefone`). Soft delete via `ativo = false`. Só produtos com `ativo = true`
aparecem na vitrine.

### Categoria

Enum fixo, aceito case-insensitive na API: **VESTUARIO, ELETRODOMESTICOS, ACESSORIOS,
SUPLEMENTOS**. Novos valores são aditivos; valor inválido retorna HTTP 400 listando os válidos.

## API (contrato que a vitrine consome)

A vitrine faz **exclusivamente requisições GET** (somente leitura, sem credenciais):

- `GET /api/v1/produtos` — lista paginada de produtos ativos. Parâmetros: `page` (padrão 0),
  `size` (padrão 20, máximo 50), e filtros opcionais `categoria` e `usuarioId`. Resposta inclui
  metadados de paginação: `totalElements`, `totalPages`, `page`, `size`.
- `GET /api/v1/produtos/{id}` — detalhe de um produto (retorna mesmo com `ativo` false).

O painel administrativo usa também os verbos de escrita (`POST`/`PUT`/`DELETE`) em
`/api/v1/produtos` e `/api/v1/usuarios`, além do endpoint de upload de imagens.

## Capacidades do produto

### Vitrine (pública, somente leitura)
- **Home**: cabeçalho fixo com logo e barra de busca; banner promocional; seção "Categorias
  Populares" (ícone por categoria, filtro ao clicar); grade "Ofertas do Dia" responsiva
  (3/2/1 colunas) com cards de produto; paginação "Carregar mais".
- **Busca** por nome (case-insensitive) e **filtro por categoria**, com estados de carregamento
  (skeletons), erro (com "Tentar novamente") e vazio ("Nenhum produto encontrado").
- **Card de produto**: imagem (ou placeholder), nome, nome da loja, preço em BRL (pt-BR), botão
  "Ver Oferta" e botão de WhatsApp.
- **Página de detalhe** (estilo Mercado Livre): galeria da imagem, painel de informações
  (categoria como tag, nome, preço em destaque, botão WhatsApp), descrição, seção do vendedor
  (nome da loja e telefone) e breadcrumb "Início > Categoria > Produto".
- **Contato por WhatsApp**: link `https://wa.me/{numero}?text={mensagem}` com o telefone
  normalizado (só dígitos, prefixo "55" quando ausente) e mensagem padrão "Olá! Tenho interesse
  no produto: {nome}". Oculta o botão quando o telefone é inválido.

### Painel administrativo (autenticado)
- Login do lojista; cadastro e edição de produtos; edição de perfil/loja; upload de imagem de
  produto e de loja; ativar/desativar produtos.

## Princípios de produto

- **Leitura vence escrita.** A vitrine pública é o caminho mais acessado e tem prioridade de
  desempenho e disponibilidade.
- **Degradação graciosa.** Se a API falhar, a vitrine mostra mensagem não técnica e um retry,
  nunca tela branca nem detalhe interno de erro.
- **Somente leitura é somente leitura.** A vitrine nunca envia POST/PUT/PATCH/DELETE, não carrega
  credenciais e não expõe rotas de criação/edição/remoção.
- **Negociação fora da plataforma.** O produto conecta visitante e lojista via WhatsApp; não há
  carrinho, checkout ou pagamento.
- **Acessibilidade e responsividade.** Layout mobile/tablet/desktop, HTML semântico, foco
  visível, contraste WCAG AA e alvos de toque de 44×44px no mobile.

## Design System

Toda tela, formulário ou componente visual deve seguir o design system do sistema. Ver o steering
[design-system](design-system.md).

## Fora de escopo

- Carrinho de compras, checkout e pagamento online.
- Avaliações, comentários ou chat interno (o contato é via WhatsApp).
- Logística, frete ou rastreamento de pedidos.
- Múltiplos idiomas/moedas — a plataforma é pt-BR / BRL.

## Glossário

- **Vitrine** — aplicação pública (somente leitura) que exibe produtos ativos aos visitantes.
- **Painel** — aplicação autenticada do lojista para gerir loja e produtos.
- **Visitante** — usuário não autenticado que navega a vitrine.
- **Lojista** (`usuario`) — conta que cadastra e mantém a própria loja e produtos.
- **Produto ativo** — produto com `ativo = true`, elegível para aparecer na vitrine.
- **Categoria** — classificação do produto: `VESTUARIO`, `ELETRODOMESTICOS`, `ACESSORIOS`,
  `SUPLEMENTOS`.
- **Card de produto** — resumo visual do produto na grade da home.
- **Link WhatsApp** — URL `wa.me` que abre a conversa com o telefone do lojista.
