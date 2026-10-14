CREATE TABLE vagas (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT NOT NULL,
    cargo       VARCHAR(200) NOT NULL,
    descricao   TEXT,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_vagas_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE INDEX idx_vagas_usuario_id ON vagas(usuario_id);
CREATE INDEX idx_vagas_ativo ON vagas(ativo) WHERE ativo = TRUE;

COMMENT ON TABLE vagas IS 'Vagas de emprego vinculadas a usuários da plataforma';
