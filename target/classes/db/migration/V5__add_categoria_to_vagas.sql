-- src/main/resources/db/migration/V5__add_categoria_to_vagas.sql — Adiciona a coluna
-- categoria à tabela vagas e cria índice parcial para vagas ativas. Migração Flyway
-- (PostgreSQL). Usa IF NOT EXISTS nativo do Postgres para ser idempotente sem depender
-- de catálogos; information_schema.indexes não existe no PostgreSQL (é do MySQL).

ALTER TABLE vagas ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_vagas_categoria ON vagas(categoria) WHERE ativo = TRUE;

COMMENT ON COLUMN vagas.categoria IS 'Categoria da vaga (ex.: VESTUARIO, ELETRODOMESTICOS, ACESSORIOS, SUPLEMENTOS)';
