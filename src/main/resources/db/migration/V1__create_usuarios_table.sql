CREATE TABLE usuarios (
    id          BIGSERIAL PRIMARY KEY,
    cpf_cnpj    VARCHAR(14) NOT NULL,
    nome        VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    telefone    VARCHAR(20),
    senha       VARCHAR(255) NOT NULL,
    nome_loja   VARCHAR(150),
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    admin       BOOLEAN NOT NULL DEFAULT FALSE,
    imagem_loja VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_usuarios_cpf_cnpj UNIQUE (cpf_cnpj),
    CONSTRAINT uq_usuarios_email UNIQUE (email)
);

CREATE INDEX idx_usuarios_ativo ON usuarios(ativo) WHERE ativo = TRUE;

COMMENT ON TABLE usuarios IS 'Usuários/Lojas cadastrados na plataforma Daqui';
