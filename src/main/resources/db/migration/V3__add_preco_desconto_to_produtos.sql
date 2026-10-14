DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'produtos' AND column_name = 'preco_desconto'
    ) THEN
        ALTER TABLE produtos ADD COLUMN preco_desconto NUMERIC(10,2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'ck_produtos_preco_desconto_positive'
    ) THEN
        ALTER TABLE produtos ADD CONSTRAINT ck_produtos_preco_desconto_positive CHECK (preco_desconto > 0);
    END IF;
END $$;
