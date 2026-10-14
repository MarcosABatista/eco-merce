# Requirements Document

## Introduction

Este documento define os requisitos para a criação da estrutura inicial do domínio back-end da plataforma Place Offers — um sistema de gerenciamento de ofertas para lojas. O escopo cobre a modelagem das entidades Usuario e Produto, o enum Categoria, a configuração de conexão com banco de dados PostgreSQL local, e as operações CRUD básicas para ambas as entidades.

## Glossary

- **Sistema**: A aplicação back-end Spring Boot da plataforma Place Offers
- **Usuario**: Entidade que representa um usuário/loja cadastrado na plataforma
- **Produto**: Entidade que representa um produto/oferta vinculado a um Usuario
- **Categoria**: Enumeração que classifica os produtos em tipos predefinidos
- **CPF**: Cadastro de Pessoa Física — documento com 11 dígitos numéricos
- **CNPJ**: Cadastro Nacional de Pessoa Jurídica — documento com 14 dígitos numéricos
- **Validador_CPF_CNPJ**: Componente responsável por validar o formato de documentos CPF e CNPJ
- **Repositorio_Usuario**: Componente de acesso a dados da entidade Usuario
- **Repositorio_Produto**: Componente de acesso a dados da entidade Produto
- **Servico_Usuario**: Componente de lógica de negócio para operações com Usuario
- **Servico_Produto**: Componente de lógica de negócio para operações com Produto

## Requirements

### Requisito 1: Entidade Usuario

**User Story:** Como desenvolvedor, eu quero ter a entidade Usuario modelada com todos os atributos especificados, para que o sistema possa persistir e gerenciar dados de usuários/lojas.

#### Critérios de Aceitação

1. THE Sistema SHALL mapear a entidade Usuario para a tabela `usuarios` no banco de dados com os campos: id (BIGSERIAL PRIMARY KEY), cpf_cnpj (VARCHAR 14, NOT NULL), nome (VARCHAR 150, NOT NULL), email (VARCHAR 255, NOT NULL), telefone (VARCHAR 20, nullable), senha (VARCHAR 255, NOT NULL), nome_loja (VARCHAR 150, nullable), ativo (BOOLEAN NOT NULL DEFAULT TRUE), admin (BOOLEAN NOT NULL DEFAULT FALSE), imagem_loja (VARCHAR 500, nullable), created_at (TIMESTAMPTZ NOT NULL), updated_at (TIMESTAMPTZ NOT NULL)
2. THE Sistema SHALL gerar o id do Usuario automaticamente usando estratégia IDENTITY
3. WHEN uma entidade Usuario é persistida pela primeira vez, THE Sistema SHALL preencher o campo created_at com o timestamp atual via JPA Auditing, e WHEN uma entidade Usuario é atualizada, THE Sistema SHALL atualizar o campo updated_at com o timestamp atual via JPA Auditing
4. WHEN um novo Usuario é criado sem valor explícito para o campo ativo, THE Sistema SHALL definir o campo ativo com valor padrão TRUE
5. WHEN um novo Usuario é criado sem valor explícito para o campo admin, THE Sistema SHALL definir o campo admin com valor padrão FALSE
6. THE Sistema SHALL impor uma constraint UNIQUE sobre o campo cpf_cnpj na tabela `usuarios`, rejeitando a persistência de um Usuario cujo cpf_cnpj já exista cadastrado
7. THE Sistema SHALL impor uma constraint UNIQUE sobre o campo email na tabela `usuarios`, rejeitando a persistência de um Usuario cujo email já exista cadastrado

### Requisito 2: Entidade Produto

**User Story:** Como desenvolvedor, eu quero ter a entidade Produto modelada com todos os atributos especificados e relacionamento com Usuario, para que o sistema possa persistir e gerenciar dados de produtos vinculados a lojas.

#### Critérios de Aceitação

1. THE Sistema SHALL mapear a entidade Produto para a tabela `produtos` no banco de dados com os campos: id (BIGSERIAL PRIMARY KEY), usuario_id (BIGINT NOT NULL), nome (VARCHAR 200 NOT NULL), descricao (TEXT, nullable), preco (NUMERIC 10,2 NOT NULL, CHECK preco > 0), categoria (VARCHAR 50, nullable), url_imagem (VARCHAR 500, nullable), ativo (BOOLEAN NOT NULL DEFAULT TRUE), created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW()), updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
2. THE Sistema SHALL estabelecer um relacionamento ManyToOne com FetchType.LAZY entre Produto e Usuario usando a coluna usuario_id como chave estrangeira, e SHALL criar um índice na coluna usuario_id (idx_produtos_usuario_id)
3. WHEN um Produto é criado, THE Sistema SHALL derivar o campo nome_loja como atributo transiente (não persistido) a partir do campo nome_loja do Usuario associado via relacionamento JPA, sem armazenar redundância no banco
4. IF uma requisição de exclusão for realizada para um Usuario que possua Produtos associados, THEN THE Sistema SHALL rejeitar a operação (ON DELETE RESTRICT) e retornar uma mensagem de erro indicando que existem produtos vinculados ao usuário
5. WHEN um novo Produto é criado sem valor explícito para o campo ativo, THE Sistema SHALL definir o campo ativo com valor padrão TRUE
6. WHEN um Produto é criado, THE Sistema SHALL preencher automaticamente o campo created_at com o timestamp atual, e WHEN um Produto é atualizado, THE Sistema SHALL atualizar automaticamente o campo updated_at com o timestamp atual
7. IF o campo usuario_id referenciar um Usuario inexistente, THEN THE Sistema SHALL rejeitar a criação do Produto e retornar uma mensagem de erro indicando que o usuário não foi encontrado

### Requisito 3: Enum Categoria

**User Story:** Como desenvolvedor, eu quero ter o enum Categoria definido com os valores de classificação de produtos, para que o sistema possa categorizar produtos de forma padronizada.

#### Critérios de Aceitação

1. THE Sistema SHALL definir o enum Categoria com os valores: VESTUARIO, ELETRODOMESTICOS, ACESSORIOS, SUPLEMENTOS
2. THE Sistema SHALL armazenar o valor da Categoria como VARCHAR(50) na coluna categoria da tabela produtos
3. IF um valor de Categoria inválido é fornecido na requisição, THEN THE Sistema SHALL retornar erro HTTP 400 com mensagem descritiva indicando os valores válidos (VESTUARIO, ELETRODOMESTICOS, ACESSORIOS, SUPLEMENTOS)
4. THE Sistema SHALL aceitar valores de Categoria de forma case-insensitive na entrada da API, convertendo para o formato correto antes da persistência

### Requisito 4: Configuração de Conexão com Banco de Dados

**User Story:** Como desenvolvedor, eu quero ter a conexão com PostgreSQL local configurada, para que o sistema possa persistir dados durante o desenvolvimento e testes.

#### Critérios de Aceitação

1. WHILE o perfil de desenvolvimento estiver ativo, THE Sistema SHALL configurar a conexão com PostgreSQL usando a URL jdbc:postgresql://localhost:5432/placeoffers, username postgres e password 123Mudar
2. THE Sistema SHALL usar Flyway para gerenciamento de migrations com arquivos localizados em classpath:db/migration
3. THE Sistema SHALL configurar o Hibernate com ddl-auto definido como validate para garantir que o schema seja gerenciado exclusivamente por migrations
4. THE Sistema SHALL desabilitar a propriedade spring.jpa.open-in-view
5. THE Sistema SHALL criar migrations Flyway para as tabelas usuarios e produtos seguindo a nomenclatura V{numero}__descricao.sql, onde cada tabela inclui obrigatoriamente as colunas id (BIGSERIAL PRIMARY KEY), created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW()) e updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
6. THE Sistema SHALL definir na migration da tabela usuarios as colunas: nome (VARCHAR(150) NOT NULL), email (VARCHAR(255) NOT NULL com constraint UNIQUE) e senha (VARCHAR(255) NOT NULL)
7. THE Sistema SHALL definir na migration da tabela produtos as colunas: nome (VARCHAR(200) NOT NULL), descricao (TEXT), preco (NUMERIC(10,2) NOT NULL com CHECK > 0) e ativo (BOOLEAN NOT NULL DEFAULT TRUE)

### Requisito 5: CRUD de Usuario

**User Story:** Como desenvolvedor, eu quero ter as operações CRUD completas para Usuario, para que a API possa criar, consultar, atualizar e desativar usuários.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em /api/v1/usuarios com dados válidos (nome com 3 a 150 caracteres, email válido com até 255 caracteres, e senha com 8 a 100 caracteres), THE Servico_Usuario SHALL criar um novo Usuario e retornar HTTP 201 com os dados do Usuario criado, excluindo o campo senha da resposta
2. IF uma requisição POST é recebida em /api/v1/usuarios com dados inválidos ou campos obrigatórios ausentes, THEN THE Servico_Usuario SHALL retornar HTTP 400 com mensagem indicando os campos com erro de validação
3. WHEN uma requisição GET é recebida em /api/v1/usuarios, THE Servico_Usuario SHALL retornar uma lista paginada de Usuarios ativos com HTTP 200, usando page=0 e size=20 como valores padrão e limitando size a no máximo 100
4. WHEN uma requisição GET é recebida em /api/v1/usuarios/{id}, THE Servico_Usuario SHALL retornar os dados do Usuario correspondente com HTTP 200, excluindo o campo senha da resposta
5. IF uma requisição GET é recebida em /api/v1/usuarios/{id} com um id inexistente, THEN THE Servico_Usuario SHALL retornar HTTP 404 com mensagem indicando que o Usuario não foi encontrado
6. WHEN uma requisição PUT é recebida em /api/v1/usuarios/{id} com dados válidos (mesmas regras de validação do POST para os campos informados), THE Servico_Usuario SHALL atualizar os dados do Usuario e retornar HTTP 200 com os dados atualizados, excluindo o campo senha da resposta
7. IF uma requisição PUT é recebida em /api/v1/usuarios/{id} com dados inválidos ou id inexistente, THEN THE Servico_Usuario SHALL retornar HTTP 400 para dados inválidos ou HTTP 404 para id inexistente, com mensagem indicando o erro
8. WHEN uma requisição DELETE é recebida em /api/v1/usuarios/{id}, THE Servico_Usuario SHALL realizar soft delete definindo o campo ativo como FALSE e retornar HTTP 204
9. IF uma requisição DELETE é recebida em /api/v1/usuarios/{id} com um id inexistente, THEN THE Servico_Usuario SHALL retornar HTTP 404 com mensagem indicando que o Usuario não foi encontrado
10. THE Servico_Usuario SHALL armazenar a senha do Usuario usando hash BCrypt, sem persistir o texto original

### Requisito 6: CRUD de Produto

**User Story:** Como desenvolvedor, eu quero ter as operações CRUD completas para Produto, para que a API possa criar, consultar, atualizar e desativar produtos.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em /api/v1/produtos com dados válidos, THE Servico_Produto SHALL criar um novo Produto associado ao Usuario informado e retornar HTTP 201 com os dados do Produto criado incluindo os campos: id, nome, descricao, preco, categoria, url_imagem, ativo, nome_loja, created_at e updated_at
2. WHEN uma requisição GET é recebida em /api/v1/produtos, THE Servico_Produto SHALL retornar uma lista paginada de Produtos ativos com HTTP 200 usando os parâmetros page (padrão 0) e size (padrão 20, máximo 50), incluindo metadados de paginação: totalElements, totalPages, page e size
3. WHEN uma requisição GET é recebida em /api/v1/produtos/{id} e o Produto existe, THE Servico_Produto SHALL retornar os dados do Produto correspondente com HTTP 200 independentemente do estado do campo ativo
4. IF uma requisição GET é recebida em /api/v1/produtos/{id} com um id inexistente, THEN THE Servico_Produto SHALL retornar HTTP 404 com mensagem indicando que o Produto não foi encontrado
5. WHEN uma requisição PUT é recebida em /api/v1/produtos/{id} com dados válidos e o Produto existe, THE Servico_Produto SHALL atualizar os campos nome, descricao, preco, categoria e url_imagem do Produto e retornar HTTP 200 com os dados atualizados
6. IF uma requisição PUT ou DELETE é recebida em /api/v1/produtos/{id} com um id inexistente, THEN THE Servico_Produto SHALL retornar HTTP 404 com mensagem indicando que o Produto não foi encontrado
7. WHEN uma requisição DELETE é recebida em /api/v1/produtos/{id} e o Produto existe, THE Servico_Produto SHALL realizar soft delete definindo o campo ativo como FALSE e atualizar o campo updated_at, retornando HTTP 204
8. WHEN uma requisição GET é recebida em /api/v1/produtos com o parâmetro usuarioId, THE Servico_Produto SHALL retornar uma lista paginada de Produtos ativos pertencentes ao Usuario especificado
9. WHEN uma requisição GET é recebida em /api/v1/produtos com o parâmetro categoria, THE Servico_Produto SHALL retornar uma lista paginada de Produtos ativos filtrados pela Categoria informada
10. IF uma requisição GET é recebida em /api/v1/produtos com um valor de categoria que não corresponde a nenhum valor do enum Categoria, THEN THE Servico_Produto SHALL retornar HTTP 400 com mensagem indicando os valores válidos de Categoria

### Requisito 7: Validação de Campos

**User Story:** Como desenvolvedor, eu quero que os campos das entidades sejam validados na entrada da API, para que dados inválidos sejam rejeitados antes de serem persistidos.

#### Critérios de Aceitação

1. WHEN um Usuario é criado ou atualizado, THE Sistema SHALL validar que o campo cpf_cnpj contém exatamente 11 dígitos (CPF) ou 14 dígitos (CNPJ), apenas numéricos
2. WHEN um Usuario é criado ou atualizado, THE Sistema SHALL validar que o campo email possui formato de e-mail válido conforme RFC 5322 e comprimento máximo de 255 caracteres
3. WHEN um Usuario é criado ou atualizado, THE Sistema SHALL validar que os campos nome (máximo 150 caracteres), email (máximo 255 caracteres), senha (mínimo 8, máximo 100 caracteres) e cpf_cnpj estão preenchidos — não nulos e não compostos apenas por espaços em branco
4. WHEN um Produto é criado ou atualizado, THE Sistema SHALL validar que o campo preco é maior que zero e menor ou igual a 9999999.99, com no máximo 2 casas decimais
5. WHEN um Produto é criado ou atualizado, THE Sistema SHALL validar que os campos nome (máximo 200 caracteres), preco e categoria estão preenchidos — não nulos e, para campos de texto, não compostos apenas por espaços em branco
6. WHEN um Produto é criado, THE Sistema SHALL validar que o campo usuario_id referencia um Usuario existente cujo campo ativo seja true
7. IF qualquer validação falha, THEN THE Sistema SHALL retornar HTTP 400 com uma lista de erros de validação contendo o campo e a mensagem de erro correspondente
8. IF o campo email informado na criação ou atualização de Usuario já estiver cadastrado para outro Usuario, THEN THE Sistema SHALL retornar HTTP 409 com mensagem de erro indicando duplicidade do email
9. IF o campo cpf_cnpj informado na criação ou atualização de Usuario já estiver cadastrado para outro Usuario, THEN THE Sistema SHALL retornar HTTP 409 com mensagem de erro indicando duplicidade do CPF/CNPJ
