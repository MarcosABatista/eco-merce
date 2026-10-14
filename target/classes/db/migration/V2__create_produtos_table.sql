CREATE TABLE produtos (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT NOT NULL,
    nome        VARCHAR(200) NOT NULL,
    descricao   TEXT,
    preco       NUMERIC(10,2) NOT NULL,
    categoria   VARCHAR(50),
    url_imagem  VARCHAR(500),
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_produtos_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT ck_produtos_preco_positive CHECK (preco > 0)
);

CREATE INDEX idx_produtos_usuario_id ON produtos(usuario_id);
CREATE INDEX idx_produtos_categoria ON produtos(categoria) WHERE ativo = TRUE;
CREATE INDEX idx_produtos_ativo ON produtos(ativo) WHERE ativo = TRUE;

COMMENT ON TABLE produtos IS 'Produtos/Ofertas vinculados a usuários da plataforma';
