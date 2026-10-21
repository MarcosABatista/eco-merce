# Implementation Plan: Backend Domain Setup

## Overview

Implementação da estrutura de domínio back-end da plataforma Daqui usando Java 21+ com Spring Boot 3.x, PostgreSQL e Flyway. O plano segue a arquitetura em camadas (Controller → Service → Repository) com organização por domínio, cobrindo as entidades Usuario e Produto, o enum Categoria, configurações de banco de dados, operações CRUD completas, tratamento de exceções e testes.

## Tasks

- [x] 1. Configuração do projeto e infraestrutura base
  - [x] 1.1 Criar estrutura do projeto Maven com Spring Boot 3.x e Java 21
    - Configurar `pom.xml` com dependências: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-validation, flyway-core, flyway-database-postgresql, postgresql driver, lombok, spring-boot-starter-test, jqwik (test scope), spring-boot-starter-security
    - Criar classe principal `DaquiApplication.java` no pacote `com.daqui`
    - Criar estrutura de diretórios conforme design: config/, common/exception/, common/dto/, usuario/, produto/
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 1.2 Criar arquivo de configuração application.yml
    - Configurar conexão PostgreSQL: jdbc:postgresql://localhost:5432/daqui, username postgres, password 123Mudar
    - Definir hibernate ddl-auto: validate
    - Desabilitar spring.jpa.open-in-view
    - Habilitar Flyway com locations: classpath:db/migration
    - Configurar HikariCP com pool adequado
    - _Requirements: 4.1, 4.3, 4.4_

  - [x] 1.3 Criar migrations Flyway para tabelas do banco de dados
    - Criar `V1__create_usuarios_table.sql` com todos os campos, constraints UNIQUE (cpf_cnpj, email), índice parcial em ativo
    - Criar `V2__create_produtos_table.sql` com FK para usuarios (ON DELETE RESTRICT), CHECK preco > 0, índices em usuario_id, categoria e ativo
    - _Requirements: 4.2, 4.5, 4.6, 4.7, 1.1, 1.6, 1.7, 2.1, 2.2_

  - [x] 1.4 Criar configuração de JPA Auditing
    - Criar `JpaAuditingConfig.java` com `@Configuration` e `@EnableJpaAuditing`
    - _Requirements: 1.3, 2.6_

  - [x] 1.5 Criar configuração de segurança com PasswordEncoder
    - Criar `SecurityConfig.java` com bean `PasswordEncoder` (BCryptPasswordEncoder)
    - Configurar SecurityFilterChain permitindo todos os endpoints (autenticação não implementada ainda)
    - _Requirements: 5.10_

- [x] 2. Modelos de domínio e enum
  - [x] 2.1 Implementar a entidade Usuario
    - Criar classe `Usuario.java` no pacote `com.daqui.usuario.model`
    - Mapear para tabela `usuarios` com todos os campos conforme design: id, cpfCnpj, nome, email, telefone, senha, nomeLoja, ativo, admin, imagemLoja, createdAt, updatedAt
    - Usar `@GeneratedValue(strategy = GenerationType.IDENTITY)`, `@CreatedDate`, `@LastModifiedDate`, `@EntityListeners(AuditingEntityListener.class)`
    - Definir defaults: ativo=true, admin=false
    - Implementar equals/hashCode baseados no id
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.2 Implementar o enum Categoria
    - Criar enum `Categoria.java` no pacote `com.daqui.produto.model`
    - Definir valores: VESTUARIO, ELETRODOMESTICOS, ACESSORIOS, SUPLEMENTOS
    - Implementar método estático `fromString(String value)` com conversão case-insensitive
    - Lançar `BusinessException` com mensagem descritiva para valores inválidos
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.3 Implementar a entidade Produto
    - Criar classe `Produto.java` no pacote `com.daqui.produto.model`
    - Mapear para tabela `produtos` com campos: id, usuario (ManyToOne LAZY), nome, descricao, preco, categoria (EnumType.STRING), urlImagem, ativo, createdAt, updatedAt
    - Implementar método `@Transient getNomeLoja()` derivando do Usuario associado
    - Definir default: ativo=true
    - Implementar equals/hashCode baseados no id
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

  - [ ]* 2.4 Escrever property test para validação de formato CPF/CNPJ
    - **Property 1: CPF/CNPJ Format Validation**
    - **Validates: Requirements 7.1**

  - [ ]* 2.5 Escrever property test para validação do enum Categoria
    - **Property 5: Invalid Categoria Rejection**
    - **Property 6: Case-Insensitive Categoria Acceptance**
    - **Validates: Requirements 3.3, 3.4, 6.10**

- [x] 3. Camada de exceções e DTOs comuns
  - [x] 3.1 Criar classes de exceção customizadas
    - Criar `ResourceNotFoundException.java` (extends RuntimeException) com construtor (String resourceName, Long id)
    - Criar `DuplicateResourceException.java` (extends RuntimeException) com construtor (String field, String value)
    - Criar `BusinessException.java` (extends RuntimeException)
    - _Requirements: 5.5, 5.9, 6.4, 6.6, 7.7, 7.8, 7.9_

  - [x] 3.2 Implementar GlobalExceptionHandler
    - Criar `GlobalExceptionHandler.java` com `@RestControllerAdvice`
    - Handler para `ResourceNotFoundException` → 404
    - Handler para `DuplicateResourceException` → 409
    - Handler para `MethodArgumentNotValidException` → 400 com lista de erros de campo
    - Handler para `BusinessException` → 400
    - Handler para `HttpMessageNotReadableException` → 400 (JSON/enum inválido)
    - _Requirements: 7.7, 7.8, 7.9, 3.3_

  - [x] 3.3 Criar DTOs comuns (ErrorResponse, FieldErrorDto, PageResponse)
    - Criar `ErrorResponse.java` (record) com campos: status, message, timestamp, errors (List<FieldErrorDto>)
    - Criar `FieldErrorDto.java` (record) com campos: field, message
    - Criar `PageResponse<T>` (record) com campos: content, totalElements, totalPages, page, size
    - _Requirements: 5.3, 6.2, 7.7_

- [x] 4. Checkpoint — Verificação de compilação e migrations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Camada de repositório
  - [x] 5.1 Implementar UsuarioRepository
    - Criar interface `UsuarioRepository extends JpaRepository<Usuario, Long>`
    - Métodos: findByAtivoTrue(Pageable), existsByCpfCnpj(String), existsByEmail(String), existsByCpfCnpjAndIdNot(String, Long), existsByEmailAndIdNot(String, Long)
    - _Requirements: 5.3, 7.8, 7.9, 1.6, 1.7_

  - [x] 5.2 Implementar ProdutoRepository
    - Criar interface `ProdutoRepository extends JpaRepository<Produto, Long>`
    - Métodos: findByAtivoTrue(Pageable), findByUsuarioIdAndAtivoTrue(Long, Pageable), findByCategoriaAndAtivoTrue(Categoria, Pageable), findByUsuarioIdAndCategoriaAndAtivoTrue(Long, Categoria, Pageable)
    - _Requirements: 6.2, 6.8, 6.9_

- [x] 6. CRUD de Usuario (DTOs, Service, Controller)
  - [x] 6.1 Criar DTOs de Usuario
    - Criar `CreateUsuarioRequest.java` (record) com validações Bean Validation: @NotBlank cpfCnpj (@Pattern "^\\d{11}(\\d{3})?$"), @NotBlank @Size(min=3, max=150) nome, @NotBlank @Email @Size(max=255) email, @Size(max=20) telefone, @NotBlank @Size(min=8, max=100) senha, @Size(max=150) nomeLoja, @Size(max=500) imagemLoja
    - Criar `UpdateUsuarioRequest.java` (record) com validações opcionais (mesmas regras sem @NotBlank nos campos não obrigatórios)
    - Criar `UsuarioResponse.java` (record) com campos: id, cpfCnpj, nome, email, telefone, nomeLoja, ativo, admin, imagemLoja, createdAt, updatedAt (sem senha)
    - _Requirements: 5.1, 5.4, 5.6, 7.1, 7.2, 7.3_

  - [x] 6.2 Implementar UsuarioService
    - Criar `UsuarioService.java` com `@Service`, `@Transactional(readOnly = true)`, injeção de UsuarioRepository e PasswordEncoder
    - Método `create`: validar unicidade cpfCnpj/email, hash senha com BCrypt, persistir, retornar UsuarioResponse
    - Método `findAll`: paginar com findByAtivoTrue, limitar size a 100, converter para PageResponse
    - Método `findById`: buscar por id ou lançar ResourceNotFoundException
    - Método `update`: validar unicidade excluindo id atual, atualizar campos não-nulos, hash senha se informada
    - Método `delete`: soft delete (ativo=false)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 7.8, 7.9_

  - [x] 6.3 Implementar UsuarioController
    - Criar `UsuarioController.java` com `@RestController`, `@RequestMapping("/api/v1/usuarios")`
    - POST / → create (201), GET / → findAll (200), GET /{id} → findById (200), PUT /{id} → update (200), DELETE /{id} → delete (204)
    - Usar `@Valid` em request bodies
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ]* 6.4 Escrever testes unitários para UsuarioService
    - Testar criação com dados válidos
    - Testar rejeição de email duplicado (409)
    - Testar rejeição de cpfCnpj duplicado (409)
    - Testar busca por id inexistente (404)
    - Testar soft delete
    - Testar hash de senha com BCrypt
    - _Requirements: 5.1, 5.5, 5.8, 5.10, 7.8, 7.9_

  - [ ]* 6.5 Escrever property tests para Usuario
    - **Property 7: Unique CPF/CNPJ Enforcement**
    - **Property 8: Unique Email Enforcement**
    - **Property 10: BCrypt Password Storage Round Trip**
    - **Property 17: Response Excludes Senha**
    - **Validates: Requirements 1.6, 1.7, 5.1, 5.4, 5.6, 5.10, 7.8, 7.9**

- [x] 7. Checkpoint — Validar CRUD de Usuario
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. CRUD de Produto (DTOs, Service, Controller)
  - [x] 8.1 Criar DTOs de Produto
    - Criar `CreateProdutoRequest.java` (record) com validações: @NotNull Long usuarioId, @NotBlank @Size(max=200) String nome, String descricao, @NotNull @DecimalMin("0.01") @DecimalMax("9999999.99") @Digits(integer=7, fraction=2) BigDecimal preco, @NotNull String categoria, @Size(max=500) String urlImagem
    - Criar `UpdateProdutoRequest.java` (record) com campos opcionais: nome, descricao, preco, categoria, urlImagem
    - Criar `ProdutoResponse.java` (record) com campos: id, nome, descricao, preco, categoria, urlImagem, ativo, nomeLoja, createdAt, updatedAt
    - _Requirements: 6.1, 6.5, 7.4, 7.5_

  - [x] 8.2 Implementar ProdutoService
    - Criar `ProdutoService.java` com `@Service`, `@Transactional(readOnly = true)`, injeção de ProdutoRepository e UsuarioRepository
    - Método `create`: validar que usuarioId existe e está ativo, converter categoria com Categoria.fromString, persistir, retornar ProdutoResponse com nomeLoja
    - Método `findAll`: suportar filtros opcionais (usuarioId, categoria), limitar size a 50, retornar PageResponse
    - Método `findById`: buscar por id independente de ativo, ou lançar ResourceNotFoundException
    - Método `update`: atualizar campos não-nulos, converter categoria case-insensitive
    - Método `delete`: soft delete (ativo=false, atualizar updatedAt)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 7.4, 7.5, 7.6_

  - [x] 8.3 Implementar ProdutoController
    - Criar `ProdutoController.java` com `@RestController`, `@RequestMapping("/api/v1/produtos")`
    - POST / → create (201), GET / → findAll (200 com params: page, size, usuarioId, categoria), GET /{id} → findById (200), PUT /{id} → update (200), DELETE /{id} → delete (204)
    - Usar `@Valid` em request bodies
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [ ]* 8.4 Escrever testes unitários para ProdutoService
    - Testar criação com dados válidos e usuario ativo
    - Testar rejeição para usuario inexistente (404)
    - Testar rejeição para usuario inativo (400)
    - Testar conversão de categoria case-insensitive
    - Testar filtros de listagem (por usuarioId, por categoria)
    - Testar soft delete
    - _Requirements: 6.1, 6.4, 6.7, 6.8, 6.9, 7.6_

  - [ ]* 8.5 Escrever property tests para Produto
    - **Property 4: Price Range Validation**
    - **Property 9: Soft Delete Preserves Data**
    - **Property 11: Active-Only Listing**
    - **Property 12: Filter by UsuarioId**
    - **Property 13: Filter by Categoria**
    - **Property 14: Transient NomeLoja Derivation**
    - **Property 15: Produto Creation Requires Active Usuario**
    - **Property 18: Produto Response Contains All Required Fields**
    - **Validates: Requirements 2.3, 2.5, 2.7, 5.3, 5.8, 6.1, 6.2, 6.7, 6.8, 6.9, 7.4, 7.6**

- [x] 9. Checkpoint — Validar CRUD de Produto
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Testes de integração
  - [ ]* 10.1 Escrever testes de integração para UsuarioController
    - Usar `@WebMvcTest(UsuarioController.class)` com MockMvc
    - Testar POST /api/v1/usuarios com dados válidos → 201
    - Testar POST com dados inválidos → 400
    - Testar GET /api/v1/usuarios → 200 com paginação
    - Testar GET /api/v1/usuarios/{id} → 200 e 404
    - Testar PUT com dados válidos → 200 e inválidos → 400
    - Testar DELETE → 204 e 404
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ]* 10.2 Escrever testes de integração para ProdutoController
    - Usar `@WebMvcTest(ProdutoController.class)` com MockMvc
    - Testar POST /api/v1/produtos com dados válidos → 201
    - Testar GET com filtros (usuarioId, categoria) → 200
    - Testar GET /{id} → 200 e 404
    - Testar PUT → 200 e DELETE → 204
    - Testar categoria inválida → 400
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [ ]* 10.3 Escrever testes de integração para repositórios (com Testcontainers)
    - Usar `@DataJpaTest` com Testcontainers PostgreSQL
    - Testar que migrations Flyway executam sem erro
    - Testar constraints UNIQUE de cpfCnpj e email
    - Testar ON DELETE RESTRICT ao tentar excluir usuario com produtos
    - Testar JPA Auditing (created_at/updated_at preenchidos automaticamente)
    - Testar queries de paginação e filtros
    - _Requirements: 1.6, 1.7, 2.4, 1.3, 2.6, 4.5_

  - [ ]* 10.4 Escrever property tests para validação de campos (Property 2, 3)
    - **Property 2: Email Format Validation**
    - **Property 3: Required Fields Rejection**
    - **Validates: Requirements 7.2, 7.3, 7.5**

  - [ ]* 10.5 Escrever property test para Delete Restriction (Property 16)
    - **Property 16: Delete Restriction with Associated Produtos**
    - **Validates: Requirements 2.4**

- [x] 11. Final checkpoint — Garantir que todos os testes passam
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property tests validam propriedades universais de corretude (jqwik com mínimo 100 iterações)
- Testes unitários validam exemplos específicos e edge cases
- A linguagem de implementação é Java 21+ com Spring Boot 3.x conforme definido no design
- O framework de PBT é jqwik (integrado ao JUnit 5)
- Testcontainers é usado para testes de integração com PostgreSQL real

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "1.5"] },
    { "id": 2, "tasks": ["2.1", "2.2", "3.1", "3.3"] },
    { "id": 3, "tasks": ["2.3", "3.2"] },
    { "id": 4, "tasks": ["2.4", "2.5", "5.1", "5.2"] },
    { "id": 5, "tasks": ["6.1", "8.1"] },
    { "id": 6, "tasks": ["6.2", "8.2"] },
    { "id": 7, "tasks": ["6.3", "8.3"] },
    { "id": 8, "tasks": ["6.4", "6.5", "8.4", "8.5"] },
    { "id": 9, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5"] }
  ]
}
```
