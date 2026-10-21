# Padrões de Desenvolvimento - Banco de Dados (PostgreSQL)

## Stack

- **SGBD**: PostgreSQL 15+
- **Migrations**: Flyway (gerenciado pelo Spring Boot)
- **ORM**: Spring Data JPA / Hibernate
- **Pool de Conexões**: HikariCP (default do Spring Boot)

## Convenções de Nomenclatura

### Regras Gerais

| Elemento       | Convenção           | Exemplo                     |
|----------------|---------------------|-----------------------------|
| Tabelas        | snake_case, plural  | `offers`, `stores`, `offer_categories` |
| Colunas        | snake_case          | `original_price`, `created_at`, `store_id` |
| Primary Keys   | `id`                | `id BIGSERIAL PRIMARY KEY`  |
| Foreign Keys   | `{tabela_singular}_id` | `store_id`, `category_id`   |
| Índices        | `idx_{tabela}_{colunas}` | `idx_offers_store_id`, `idx_offers_expires_at` |
| Unique Constraints | `uq_{tabela}_{colunas}` | `uq_offers_title_store` |
| Check Constraints | `ck_{tabela}_{regra}` | `ck_offers_price_positive` |
| Sequences      | `{tabela}_id_seq`   | `offers_id_seq`             |

### Regras de Nomes

- Nomes em inglês
- Evitar palavras reservadas do PostgreSQL como nomes de tabelas/colunas
- Máximo de 63 caracteres (limite do PostgreSQL)
- Não usar prefixos como `tbl_` ou `tb_`

## Design de Schema

### Tipos de Dados Recomendados

| Uso                  | Tipo PostgreSQL        | Notas                              |
|----------------------|------------------------|------------------------------------|
| IDs                  | `BIGSERIAL`            | Auto-increment 64-bit              |
| Texto curto          | `VARCHAR(n)`           | Definir tamanho máximo             |
| Texto longo          | `TEXT`                 | Sem limite prático                 |
| Booleano             | `BOOLEAN`              | Sempre definir DEFAULT             |
| Preços/Valores       | `NUMERIC(10,2)`        | Nunca usar FLOAT para dinheiro     |
| Datas                | `DATE`                 | Apenas data, sem hora              |
| Timestamps           | `TIMESTAMP WITH TIME ZONE` | Sempre com timezone (TIMESTAMPTZ) |
| JSON                 | `JSONB`                | Preferir JSONB sobre JSON          |
| Enumerações          | `VARCHAR` com CHECK    | Evitar ENUM type (difícil alterar) |
| UUID                 | `UUID`                 | Usar gen_random_uuid()             |

### Modelo Base de Tabela

Toda tabela deve incluir campos de auditoria:

```sql
CREATE TABLE offers (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    original_price  NUMERIC(10,2) NOT NULL,
    discount_price  NUMERIC(10,2) NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at  TIMESTAMPTZ,
    store_id    BIGINT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT fk_offers_store FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT ck_offers_original_price_positive CHECK (original_price > 0),
    CONSTRAINT ck_offers_discount_price_positive CHECK (discount_price > 0),
    CONSTRAINT ck_offers_discount_less_than_original CHECK (discount_price < original_price)
);
```

### Campos Obrigatórios em Toda Tabela

| Campo        | Tipo          | Descrição                     |
|--------------|---------------|-------------------------------|
| `id`         | `BIGSERIAL`   | Chave primária                |
| `created_at` | `TIMESTAMPTZ` | Data de criação (DEFAULT NOW()) |
| `updated_at` | `TIMESTAMPTZ` | Data de atualização           |

## Índices

### Quando Criar Índices

1. **Sempre**: colunas usadas em WHERE, JOIN, ORDER BY com frequência
2. **Sempre**: Foreign Keys (PostgreSQL NÃO cria índice automático para FK)
3. **Considerar**: colunas usadas em filtros de busca
4. **Evitar**: tabelas muito pequenas (< 1000 linhas), colunas com baixa cardinalidade

### Tipos de Índice

| Tipo       | Quando Usar                                        |
|------------|----------------------------------------------------|
| B-tree     | Default. Igualdade (`=`), range (`<`, `>`, `BETWEEN`), ORDER BY |
| GIN        | Arrays, JSONB, full-text search (`tsvector`)       |
| BRIN       | Dados ordenados naturalmente (timestamps em séries) |
| Hash       | Apenas igualdade exata (raro, B-tree geralmente é melhor) |
| GiST       | Dados geoespaciais, range types                    |

### Exemplos de Índices

```sql
-- Índice simples em FK (obrigatório)
CREATE INDEX idx_offers_store_id ON offers(store_id);

-- Índice composto para queries comuns
CREATE INDEX idx_offers_store_active ON offers(store_id, active) WHERE active = TRUE;

-- Índice parcial para ofertas ativas não expiradas
CREATE INDEX idx_offers_active_not_expired
    ON offers(expires_at)
    WHERE active = TRUE AND expires_at > NOW();

-- Índice para busca textual
CREATE INDEX idx_offers_title_gin ON offers USING GIN (to_tsvector('portuguese', title));

-- Índice único composto
CREATE UNIQUE INDEX uq_offers_title_store ON offers(title, store_id);
```

### Boas Práticas de Índices

1. **Criar índice em toda FK** — PostgreSQL não faz isso automaticamente
2. **Índices parciais** — filtrar apenas os registros que importam (WHERE clause)
3. **Índices compostos** — colocar colunas mais seletivas primeiro
4. **Monitorar índices não usados** — remover índices que o planner não utiliza
5. **Não indexar demais** — cada índice tem custo em INSERT/UPDATE/DELETE
6. **CONCURRENTLY** — usar `CREATE INDEX CONCURRENTLY` em produção para não bloquear

## Migrations (Flyway)

### Estrutura de Arquivos

```
src/main/resources/db/migration/
├── V1__create_stores_table.sql
├── V2__create_offers_table.sql
├── V3__create_categories_table.sql
├── V4__add_category_to_offers.sql
└── V5__create_users_table.sql
```

### Regras de Migration

1. **Nomenclatura**: `V{número}__descricao_em_snake_case.sql`
2. **Imutabilidade**: nunca alterar uma migration já aplicada
3. **Atomicidade**: cada migration deve ser auto-contida e reversível conceitualmente
4. **Tamanho**: preferir migrations pequenas e focadas
5. **Sem dados de seed em migrations**: usar `R__` (repeatable) ou scripts separados para seed

### Template de Migration

```sql
-- V1__create_stores_table.sql

CREATE TABLE stores (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    slug        VARCHAR(150) NOT NULL,
    description TEXT,
    address     VARCHAR(500),
    phone       VARCHAR(20),
    email       VARCHAR(255),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_stores_slug ON stores(slug);
CREATE INDEX idx_stores_active ON stores(active) WHERE active = TRUE;

COMMENT ON TABLE stores IS 'Lojas cadastradas na plataforma';
COMMENT ON COLUMN stores.slug IS 'Identificador URL-friendly da loja';
```

### Alterações de Schema

```sql
-- V4__add_category_to_offers.sql

ALTER TABLE offers
    ADD COLUMN category_id BIGINT,
    ADD CONSTRAINT fk_offers_category FOREIGN KEY (category_id) REFERENCES categories(id);

CREATE INDEX idx_offers_category_id ON offers(category_id);

COMMENT ON COLUMN offers.category_id IS 'Categoria da oferta (opcional)';
```

## Constraints

### Regras de Integridade

1. **NOT NULL**: usar em toda coluna obrigatória — não confiar apenas na validação da aplicação
2. **DEFAULT**: definir valores padrão quando fizer sentido (active = TRUE, created_at = NOW())
3. **CHECK**: validar regras de negócio no banco (preço > 0, desconto < original)
4. **UNIQUE**: garantir unicidade onde necessário (email, slug, combinações)
5. **FOREIGN KEY**: toda relação deve ter FK explícita com ON DELETE definido

### Política de ON DELETE

| Cenário                              | Ação             |
|--------------------------------------|------------------|
| Dados filhos devem ser removidos     | `CASCADE`        |
| Impedir remoção se houver filhos     | `RESTRICT`       |
| Manter filhos com FK nula            | `SET NULL`       |
| Default recomendado                  | `RESTRICT`       |

```sql
-- Exemplo: ao deletar loja, impedir se houver ofertas
CONSTRAINT fk_offers_store FOREIGN KEY (store_id)
    REFERENCES stores(id) ON DELETE RESTRICT;

-- Exemplo: ao deletar categoria, tornar nulo nas ofertas
CONSTRAINT fk_offers_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE SET NULL;
```

## Queries e Performance

### Regras de Query

1. **Sempre usar paginação**: `LIMIT` + `OFFSET` ou cursor-based
2. **Selecionar apenas colunas necessárias**: evitar `SELECT *` em produção
3. **Usar EXPLAIN ANALYZE**: antes de publicar queries complexas
4. **Parametrizar queries**: nunca concatenar valores — prevenir SQL injection
5. **Evitar N+1**: usar JOIN ou batch loading no ORM

### Paginação

```sql
-- Offset-based (simples, mas lento para offsets grandes)
SELECT id, title, discount_price
FROM offers
WHERE store_id = :storeId AND active = TRUE
ORDER BY created_at DESC
LIMIT :size OFFSET :offset;

-- Cursor-based (melhor performance para grandes datasets)
SELECT id, title, discount_price
FROM offers
WHERE store_id = :storeId AND active = TRUE
  AND created_at < :lastCreatedAt
ORDER BY created_at DESC
LIMIT :size;
```

### Full-Text Search

```sql
-- Criar coluna de busca
ALTER TABLE offers ADD COLUMN search_vector TSVECTOR;

-- Atualizar via trigger
CREATE FUNCTION offers_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('portuguese', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_offers_search
    BEFORE INSERT OR UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION offers_search_trigger();

-- Índice GIN para busca
CREATE INDEX idx_offers_search ON offers USING GIN(search_vector);

-- Query de busca
SELECT id, title, ts_rank(search_vector, query) AS rank
FROM offers, plainto_tsquery('portuguese', :searchTerm) query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

## Configuração do HikariCP

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000        # 5 minutos
      max-lifetime: 1800000       # 30 minutos
      connection-timeout: 30000   # 30 segundos
      leak-detection-threshold: 60000  # 1 minuto
```

### Regras de Pool

- **maximum-pool-size**: fórmula `(core_count * 2) + effective_spindle_count` (geralmente 10-20)
- **minimum-idle**: manter algumas conexões prontas
- **idle-timeout**: liberar conexões ociosas após 5 min
- **max-lifetime**: reciclar conexões antes do timeout do PostgreSQL
- **leak-detection-threshold**: detectar conexões não devolvidas

## Soft Delete vs Hard Delete

Preferir **soft delete** para dados de negócio:

```sql
-- Coluna de soft delete
ALTER TABLE offers ADD COLUMN deleted_at TIMESTAMPTZ;

-- Índice que exclui registros deletados
CREATE INDEX idx_offers_active_not_deleted
    ON offers(store_id, active)
    WHERE deleted_at IS NULL;
```

No JPA, usar `@Where(clause = "deleted_at IS NULL")` ou filtros no repository.

## Monitoramento e Manutenção

### Queries Úteis para Monitoramento

```sql
-- Índices não utilizados
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexname NOT LIKE 'uq_%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Tabelas sem vacuum recente
SELECT relname, last_vacuum, last_autovacuum, n_dead_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Queries lentas (requer pg_stat_statements)
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Boas Práticas de Manutenção

1. **VACUUM**: confiar no autovacuum, ajustar thresholds se necessário
2. **ANALYZE**: executar após bulk loads para atualizar estatísticas
3. **REINDEX**: reconstruir índices bloated periodicamente
4. **pg_stat_statements**: habilitar para monitorar queries lentas
5. **Backups**: pg_dump diário + WAL archiving para point-in-time recovery

## Segurança

1. **Princípio do menor privilégio**: aplicação usa role com apenas SELECT, INSERT, UPDATE, DELETE
2. **Sem SUPERUSER para aplicação**: criar role dedicada
3. **SSL obrigatório**: `sslmode=require` na connection string
4. **Senhas fortes**: nunca usar defaults ou senhas fracas
5. **pg_hba.conf**: restringir acesso por IP
6. **Schemas separados**: isolar dados por schema se necessário

```sql
-- Criar role para a aplicação
CREATE ROLE daqui_app LOGIN PASSWORD 'strong_password_here';
GRANT CONNECT ON DATABASE daqui TO daqui_app;
GRANT USAGE ON SCHEMA public TO daqui_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO daqui_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO daqui_app;

-- Permitir acesso a tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO daqui_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO daqui_app;
```

## Modelo Inicial Sugerido

```
┌─────────────┐       ┌─────────────┐       ┌──────────────────┐
│   stores    │       │   offers    │       │   categories     │
├─────────────┤       ├─────────────┤       ├──────────────────┤
│ id          │◄──┐   │ id          │   ┌──►│ id               │
│ name        │   │   │ title       │   │   │ name             │
│ slug        │   │   │ description │   │   │ slug             │
│ description │   └───│ store_id    │   │   │ active           │
│ address     │       │ category_id │───┘   │ created_at       │
│ phone       │       │ original_price│     │ updated_at       │
│ email       │       │ discount_price│     └──────────────────┘
│ active      │       │ active      │
│ created_at  │       │ expires_at  │
│ updated_at  │       │ created_at  │
└─────────────┘       │ updated_at  │
                      │ deleted_at  │
                      └─────────────┘
```
