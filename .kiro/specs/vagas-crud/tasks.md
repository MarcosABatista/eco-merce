# Implementation Plan: Vagas (Job Openings CRUD)

## Overview

Implementar o módulo de vagas seguindo os mesmos padrões do módulo `produto`: domain-package structure, soft delete, manual mapping, Bean Validation, paginação com PageResponse e jqwik para property-based tests.

## Tasks

- [x] 1. Create database migration
  - [x] 1.1 Create V4__create_vagas_table.sql migration file
    - Create file at `src/main/resources/db/migration/V4__create_vagas_table.sql`
    - Table `vagas` with columns: id (BIGSERIAL PK), usuario_id (BIGINT NOT NULL), cargo (VARCHAR(200) NOT NULL), descricao (TEXT), ativo (BOOLEAN NOT NULL DEFAULT TRUE), created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW()), updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
    - FK constraint `fk_vagas_usuario` referencing usuarios(id) ON DELETE RESTRICT
    - Index `idx_vagas_usuario_id` on usuario_id
    - Partial index `idx_vagas_ativo` on ativo WHERE ativo = TRUE
    - Comment on table
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Create Vaga entity and DTOs
  - [x] 2.1 Create Vaga entity class
    - Create `src/main/java/com/placeoffers/vaga/model/Vaga.java`
    - Follow same pattern as Produto entity: @Entity, @Table, @Getter, @Setter, @NoArgsConstructor, @EntityListeners(AuditingEntityListener.class)
    - Fields: id, usuario (ManyToOne LAZY), cargo, descricao, ativo, createdAt, updatedAt
    - Add @Transient helper methods: getNomeUsuario() and getNomeLoja() from usuario
    - Override equals/hashCode based on id
    - _Requirements: 7.1_

  - [x] 2.2 Create CreateVagaRequest DTO
    - Create `src/main/java/com/placeoffers/vaga/dto/CreateVagaRequest.java`
    - Java record with fields: usuarioId (@NotNull), cargo (@NotBlank, @Size max=200), descricao (optional)
    - Validation messages in Portuguese following project convention
    - _Requirements: 1.1, 1.2_

  - [x] 2.3 Create UpdateVagaRequest DTO
    - Create `src/main/java/com/placeoffers/vaga/dto/UpdateVagaRequest.java`
    - Java record with fields: cargo (@Size max=200, nullable), descricao (nullable), ativo (nullable)
    - All fields optional to support partial updates
    - _Requirements: 2.1, 2.3_

  - [x] 2.4 Create VagaResponse DTO
    - Create `src/main/java/com/placeoffers/vaga/dto/VagaResponse.java`
    - Java record with fields: id, usuarioId, nomeUsuario, nomeLoja, cargo, descricao, ativo, createdAt, updatedAt
    - _Requirements: 7.1, 7.2_

- [x] 3. Implement repository and service
  - [x] 3.1 Create VagaRepository
    - Create `src/main/java/com/placeoffers/vaga/repository/VagaRepository.java`
    - Extend JpaRepository<Vaga, Long>
    - Methods: findByAtivoTrue(Pageable), findByUsuarioId(Long, Pageable), findByUsuarioIdAndAtivoTrue(Long, Pageable)
    - _Requirements: 3.1, 3.3_

  - [x] 3.2 Create VagaService
    - Create `src/main/java/com/placeoffers/vaga/service/VagaService.java`
    - @Service, @RequiredArgsConstructor, @Transactional(readOnly = true) at class level
    - Inject VagaRepository and UsuarioRepository
    - Implement create(): validate usuario exists and is active, map request to entity, save, return response
    - Implement findAll(page, size, usuarioId): limit size to 50, if usuarioId provided return all (active+inactive), else return only active
    - Implement findById(id): find or throw ResourceNotFoundException
    - Implement update(id, request): find or throw, update only non-null fields, save
    - Implement delete(id): find or throw, set ativo=false, save
    - Implement private toResponse(Vaga): manual mapping to VagaResponse
    - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 7.1, 7.2_

- [x] 4. Implement controller
  - [x] 4.1 Create VagaController
    - Create `src/main/java/com/placeoffers/vaga/controller/VagaController.java`
    - @RestController, @RequestMapping("/api/v1/vagas"), @RequiredArgsConstructor
    - POST / → create (201 CREATED)
    - GET / → findAll with params: page (default 0), size (default 20), usuarioId (optional)
    - GET /{id} → findById (200 OK)
    - PUT /{id} → update (200 OK)
    - DELETE /{id} → delete (204 NO CONTENT)
    - _Requirements: 1.1, 2.1, 3.1, 3.4, 4.1, 5.1_

- [x] 5. Checkpoint - Verify compilation and basic wiring
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 6. Write property-based tests
  - [ ]* 6.1 Write property test for soft delete data preservation
    - **Property 1: Soft delete preserves data integrity**
    - Use jqwik to generate random Vaga entities, call delete, verify all fields except ativo and updatedAt remain unchanged
    - **Validates: Requirement 5.1**

  - [ ]* 6.2 Write property test for create round-trip
    - **Property 2: Create vaga round-trip consistency**
    - Use jqwik to generate random valid cargo strings (1-200 chars, non-blank) and optional descricao, create vaga, retrieve by ID, assert fields match
    - **Validates: Requirements 1.1, 7.1**

  - [ ]* 6.3 Write property test for whitespace cargo rejection
    - **Property 3: Whitespace cargo rejection**
    - Use jqwik to generate random whitespace-only strings, attempt validation of CreateVagaRequest, assert validation fails
    - **Validates: Requirement 1.2**

  - [ ]* 6.4 Write property test for pagination size cap
    - **Property 4: Pagination bounded size**
    - Use jqwik to generate random integers > 50, call findAll with that size, verify effective page size <= 50
    - **Validates: Requirement 3.2**

  - [ ]* 6.5 Write property test for inactive usuario blocking
    - **Property 5: Inactive usuario blocks vaga creation**
    - Use jqwik to generate random valid request data, mock an inactive usuario, verify BusinessException is thrown
    - **Validates: Requirement 1.3**

  - [ ]* 6.6 Write property test for active-only listing
    - **Property 6: Listing without filters returns only active vagas**
    - Use jqwik to generate a mix of active/inactive vagas, call findAll without filter, assert all results have ativo=true
    - **Validates: Requirement 3.1**

  - [ ]* 6.7 Write property test for partial update
    - **Property 7: Partial update only modifies provided fields**
    - Use jqwik to generate random existing Vaga state and random partial UpdateVagaRequest (some fields null), apply update, verify only non-null fields changed
    - **Validates: Requirement 2.1**

- [ ]* 7. Write unit tests for VagaService
  - [ ]* 7.1 Write unit tests for create scenarios
    - Test: successful creation with valid usuario
    - Test: ResourceNotFoundException when usuario not found
    - Test: BusinessException when usuario inactive
    - _Requirements: 1.1, 1.3, 1.4_

  - [ ]* 7.2 Write unit tests for update and delete
    - Test: successful partial update
    - Test: ResourceNotFoundException on update with invalid id
    - Test: successful soft delete
    - Test: ResourceNotFoundException on delete with invalid id
    - _Requirements: 2.1, 2.2, 5.1, 5.2_

  - [ ]* 7.3 Write unit tests for findAll and findById
    - Test: findAll without filter returns only active
    - Test: findAll with usuarioId returns all for that user
    - Test: findById success and not found
    - _Requirements: 3.1, 3.3, 4.1, 4.2_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The module follows the EXACT same patterns as the existing `produto` module
- jqwik is already configured in pom.xml for property-based testing
- Manual mapping (no MapStruct) as per project convention
