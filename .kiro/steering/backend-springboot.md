# Padrões de Desenvolvimento - Back-end (Java + Spring Boot)

## Stack Tecnológica

- **Linguagem**: Java 21+
- **Framework**: Spring Boot 3.x
- **Build Tool**: Maven ou Gradle (preferir Maven para consistência)
- **Banco de Dados**: PostgreSQL com Spring Data JPA
- **Documentação API**: SpringDoc OpenAPI (Swagger)
- **Testes**: JUnit 5 + Mockito + Spring Boot Test

## Estrutura de Pacotes

Seguir organização por domínio (domain-driven) conforme recomendado pela documentação oficial do Spring Boot:

```
com.placeoffers
├── PlaceOffersApplication.java
├── config/                    # Configurações globais (Security, CORS, etc.)
├── common/                    # Classes utilitárias compartilhadas
│   ├── exception/             # Exceções customizadas e handlers globais
│   ├── dto/                   # DTOs base (ApiResponse, PageResponse)
│   └── util/                  # Utilitários gerais
├── offer/                     # Módulo de Ofertas
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/                 # Entidades JPA
│   ├── dto/                   # DTOs específicos do módulo
│   └── mapper/                # MapStruct mappers
├── store/                     # Módulo de Lojas
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── dto/
│   └── mapper/
└── ...                        # Outros módulos seguem o mesmo padrão
```

A classe principal `@SpringBootApplication` deve ficar no pacote raiz acima de todos os outros pacotes para que o component scan funcione corretamente.

## Convenções de Código

### Controllers (Camada de Apresentação)

- Usar `@RestController` com `@RequestMapping("/api/v1/{recurso}")` no nível da classe
- URLs devem usar substantivos no plural: `/api/v1/offers`, `/api/v1/stores`
- Retornar `ResponseEntity<T>` com status HTTP apropriado
- Validação de entrada com `@Valid` nos parâmetros `@RequestBody`
- Não conter lógica de negócio — apenas delegar ao Service

```java
@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @GetMapping
    public ResponseEntity<PageResponse<OfferResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(offerService.findAll(page, size));
    }

    @PostMapping
    public ResponseEntity<OfferResponse> create(@Valid @RequestBody CreateOfferRequest request) {
        OfferResponse response = offerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

### Services (Camada de Negócio)

- Usar `@Service` e injeção de dependência via construtor (com `@RequiredArgsConstructor` do Lombok ou construtor explícito)
- Nunca usar `@Autowired` em campos — sempre injeção por construtor com campos `final`
- Anotar métodos transacionais com `@Transactional`
- Lançar exceções de negócio customizadas (nunca retornar null para indicar erro)

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OfferService {

    private final OfferRepository offerRepository;
    private final OfferMapper offerMapper;

    @Transactional
    public OfferResponse create(CreateOfferRequest request) {
        Offer offer = offerMapper.toEntity(request);
        offer = offerRepository.save(offer);
        return offerMapper.toResponse(offer);
    }

    public OfferResponse findById(Long id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", id));
        return offerMapper.toResponse(offer);
    }
}
```

### Repositories (Camada de Dados)

- Extender `JpaRepository<Entity, IdType>`
- Usar `@Query` com JPQL para consultas complexas
- Nomear métodos seguindo convenção do Spring Data (findBy, existsBy, countBy)
- Usar `Pageable` para consultas paginadas

```java
public interface OfferRepository extends JpaRepository<Offer, Long> {

    Page<Offer> findByStoreIdAndActiveTrue(Long storeId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.expiresAt > CURRENT_TIMESTAMP AND o.active = true")
    List<Offer> findActiveOffers();

    boolean existsByTitleAndStoreId(String title, Long storeId);
}
```

### Entidades JPA (Model)

- Usar `@Entity` com `@Table(name = "table_name")`
- IDs com `@GeneratedValue(strategy = GenerationType.IDENTITY)` para PostgreSQL
- Audit fields com `@CreatedDate`, `@LastModifiedDate` usando `@EntityListeners(AuditingEntityListener.class)`
- Usar Lombok `@Getter`, `@Setter`, `@NoArgsConstructor` (evitar `@Data` em entidades)
- Definir `equals()` e `hashCode()` baseados apenas no ID

```java
@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private BigDecimal originalPrice;

    @Column(nullable = false)
    private BigDecimal discountPrice;

    @Column(nullable = false)
    private Boolean active = true;

    private LocalDateTime expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

### DTOs (Data Transfer Objects)

- Usar Java Records para DTOs imutáveis
- Separar Request DTOs de Response DTOs
- Validação com Bean Validation (`@NotBlank`, `@NotNull`, `@Size`, `@Min`, `@Max`, etc.)
- Nunca expor entidades JPA diretamente na API

```java
public record CreateOfferRequest(
    @NotBlank(message = "Título é obrigatório")
    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    String title,

    @Size(max = 1000)
    String description,

    @NotNull(message = "Preço original é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    BigDecimal originalPrice,

    @NotNull(message = "Preço com desconto é obrigatório")
    @DecimalMin(value = "0.01")
    BigDecimal discountPrice,

    LocalDateTime expiresAt,

    @NotNull(message = "ID da loja é obrigatório")
    Long storeId
) {}

public record OfferResponse(
    Long id,
    String title,
    String description,
    BigDecimal originalPrice,
    BigDecimal discountPrice,
    Boolean active,
    LocalDateTime expiresAt,
    String storeName,
    LocalDateTime createdAt
) {}
```

## Tratamento de Exceções

Usar `@RestControllerAdvice` para tratamento global e centralizado de exceções:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> new FieldError(f.getField(), f.getDefaultMessage()))
                .toList();
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Erro de validação",
            LocalDateTime.now(),
            fieldErrors
        );
        return ResponseEntity.badRequest().body(error);
    }
}
```

## Configurações (application.yml)

- Usar `application.yml` ao invés de `application.properties`
- Separar perfis: `application-dev.yml`, `application-prod.yml`
- Externalizar configurações sensíveis via variáveis de ambiente

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:placeoffers}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: ${SERVER_PORT:8080}
```

## Migrations

- Usar Flyway para versionamento do schema
- Arquivos em `src/main/resources/db/migration/`
- Nomenclatura: `V1__create_stores_table.sql`, `V2__create_offers_table.sql`
- Nunca alterar migrations já aplicadas — criar novas

## Testes

- Testes unitários para Services usando Mockito (`@ExtendWith(MockitoExtension.class)`)
- Testes de integração para Repositories usando `@DataJpaTest`
- Testes de integração para Controllers usando `@WebMvcTest`
- Testes E2E usando `@SpringBootTest` com `TestRestTemplate`
- Cobertura mínima esperada: 80%

```java
@ExtendWith(MockitoExtension.class)
class OfferServiceTest {

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private OfferMapper offerMapper;

    @InjectMocks
    private OfferService offerService;

    @Test
    void shouldCreateOffer() {
        // given
        CreateOfferRequest request = new CreateOfferRequest(...);
        Offer entity = new Offer();
        OfferResponse expected = new OfferResponse(...);

        when(offerMapper.toEntity(request)).thenReturn(entity);
        when(offerRepository.save(entity)).thenReturn(entity);
        when(offerMapper.toResponse(entity)).thenReturn(expected);

        // when
        OfferResponse result = offerService.create(request);

        // then
        assertThat(result).isEqualTo(expected);
        verify(offerRepository).save(entity);
    }
}
```

## Segurança

- Usar Spring Security para autenticação/autorização
- Endpoints públicos explicitamente configurados
- CORS configurado de forma restritiva
- Passwords com BCrypt (nunca em texto plano)
- Rate limiting para endpoints públicos

## Boas Práticas Gerais

1. **Imutabilidade**: usar campos `final` e injeção por construtor
2. **Fail-fast**: validar entradas o mais cedo possível
3. **Logging**: usar SLF4J com níveis adequados (INFO para operações, DEBUG para detalhes, ERROR para falhas)
4. **Paginação**: sempre paginar listagens — nunca retornar coleções sem limite
5. **Lazy Loading**: `FetchType.LAZY` por padrão em relacionamentos JPA
6. **Open-in-view**: desabilitado (`spring.jpa.open-in-view: false`)
7. **Convenção de nomes**: camelCase para Java, snake_case para colunas do banco
