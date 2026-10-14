package com.placeoffers.produto.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;

public record UpdateProdutoRequest(
    @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
    String nome,

    String descricao,

    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    @DecimalMax(value = "9999999.99", message = "Preço deve ser no máximo 9999999.99")
    @Digits(integer = 7, fraction = 2, message = "Preço deve ter no máximo 7 dígitos inteiros e 2 decimais")
    BigDecimal preco,

    @DecimalMin(value = "0.01", message = "Preço com desconto deve ser maior que zero")
    BigDecimal precoDesconto,

    String categoria,

    @Size(max = 500, message = "URL da imagem deve ter no máximo 500 caracteres")
    String urlImagem,

    Boolean ativo
) {}
