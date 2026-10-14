# Requirements Document

## Introduction

Módulo de CRUD completo para vagas de emprego (job openings) na plataforma Place Offers. Permite que usuários publiquem, listem, editem e desativem vagas, seguindo os mesmos padrões arquiteturais e convenções do módulo de produtos existente.

## Glossary

- **Sistema**: O backend da aplicação Place Offers (Spring Boot)
- **Vaga**: Uma vaga de emprego publicada por um usuário, contendo cargo e descrição
- **Usuario**: Entidade já existente que representa um usuário cadastrado na plataforma
- **Soft_Delete**: Padrão de exclusão lógica onde o registro é marcado como inativo (ativo=false) ao invés de ser removido fisicamente
- **PageResponse**: DTO padrão do projeto para respostas paginadas contendo content, totalElements, totalPages, page e size

## Requirements

### Requirement 1: Criar Vaga

**User Story:** As a usuário ativo da plataforma, I want to criar uma vaga de emprego vinculada ao meu perfil, so that I can divulgar oportunidades de trabalho.

#### Acceptance Criteria

1. WHEN a valid CreateVagaRequest is received with an existing and active usuarioId, THE Sistema SHALL create a new Vaga record and return HTTP 201 with the VagaResponse
2. WHEN a CreateVagaRequest contains a cargo that is blank or exceeds 200 characters, THE Sistema SHALL reject the request with HTTP 400 and field-level error details
3. WHEN a CreateVagaRequest references a usuarioId where the usuario has ativo=false, THE Sistema SHALL reject the request with HTTP 422 and message "Não é possível criar vaga para um usuário inativo"
4. WHEN a CreateVagaRequest references a usuarioId that does not exist, THE Sistema SHALL return HTTP 404 with message indicating usuario not found

### Requirement 2: Atualizar Vaga

**User Story:** As a usuário, I want to atualizar os dados de uma vaga existente, so that I can corrigir informações ou alterar o status da vaga.

#### Acceptance Criteria

1. WHEN a valid UpdateVagaRequest is received for an existing vaga id, THE Sistema SHALL update only the provided non-null fields and return HTTP 200 with the updated VagaResponse
2. WHEN an UpdateVagaRequest is received for a non-existing vaga id, THE Sistema SHALL return HTTP 404 with message indicating vaga not found
3. WHEN an UpdateVagaRequest contains a cargo that exceeds 200 characters, THE Sistema SHALL reject the request with HTTP 400 and field-level error details

### Requirement 3: Listar Vagas

**User Story:** As a usuário, I want to listar vagas de emprego com paginação, so that I can visualizar oportunidades disponíveis de forma organizada.

#### Acceptance Criteria

1. WHEN a GET request is made to /api/v1/vagas without filters, THE Sistema SHALL return only vagas with ativo=true in a paginated response
2. THE Sistema SHALL limit the page size to a maximum of 50 items regardless of the requested size parameter
3. WHEN a GET request includes the usuarioId parameter, THE Sistema SHALL return all vagas for that usuario (both ativo=true and ativo=false) to support management
4. WHEN no page and size parameters are provided, THE Sistema SHALL use default values of page=0 and size=20

### Requirement 4: Buscar Vaga por ID

**User Story:** As a usuário, I want to buscar uma vaga específica pelo ID, so that I can ver todos os detalhes de uma vaga.

#### Acceptance Criteria

1. WHEN a GET request is made to /api/v1/vagas/{id} with an existing id, THE Sistema SHALL return HTTP 200 with the complete VagaResponse
2. WHEN a GET request is made to /api/v1/vagas/{id} with a non-existing id, THE Sistema SHALL return HTTP 404 with message indicating vaga not found

### Requirement 5: Excluir Vaga (Soft Delete)

**User Story:** As a usuário, I want to desativar uma vaga, so that ela não apareça mais nas listagens públicas sem perder os dados históricos.

#### Acceptance Criteria

1. WHEN a DELETE request is made for an existing vaga id, THE Sistema SHALL set ativo=false on the record, preserve all other data, and return HTTP 204
2. WHEN a DELETE request is made for a non-existing vaga id, THE Sistema SHALL return HTTP 404 with message indicating vaga not found

### Requirement 6: Migração de Banco de Dados

**User Story:** As a developer, I want a migração Flyway para criar a tabela vagas, so that o schema do banco de dados suporte o novo módulo.

#### Acceptance Criteria

1. THE Sistema SHALL create a Flyway migration V4__create_vagas_table.sql that creates the vagas table with columns: id (BIGSERIAL PK), usuario_id (BIGINT NOT NULL FK), cargo (VARCHAR 200 NOT NULL), descricao (TEXT), ativo (BOOLEAN NOT NULL DEFAULT TRUE), created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW), updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW)
2. THE migration SHALL include a foreign key constraint from usuario_id to usuarios(id) with ON DELETE RESTRICT
3. THE migration SHALL include an index on usuario_id and a partial index on ativo where ativo=TRUE

### Requirement 7: Resposta com Dados do Usuário

**User Story:** As a consumidor da API, I want que a resposta de vaga inclua nome do usuário e nome da loja, so that I can exibir informações contextuais sem chamadas adicionais.

#### Acceptance Criteria

1. THE VagaResponse SHALL include the fields: id, usuarioId, nomeUsuario, nomeLoja, cargo, descricao, ativo, createdAt, updatedAt
2. WHEN the associated usuario has nomeLoja as null, THE Sistema SHALL return null for the nomeLoja field in VagaResponse
