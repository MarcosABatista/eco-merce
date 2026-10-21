package com.daqui.produto.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.daqui.produto.model.Categoria;

public record ProdutoResponse(
    Long id,
    String nome,
    String descricao,
    BigDecimal preco,
    BigDecimal precoDesconto,
    Integer percentualDesconto,
    Categoria categoria,
    String urlImagem,
    Boolean ativo,
    String nomeLoja,
    String telefone,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
