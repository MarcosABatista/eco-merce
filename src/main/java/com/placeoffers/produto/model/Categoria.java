package com.placeoffers.produto.model;

import java.util.Arrays;

import com.placeoffers.common.exception.BusinessException;

public enum Categoria {
    VESTUARIO,
    ELETRODOMESTICOS,
    ACESSORIOS,
    SUPLEMENTOS;

    public static Categoria fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Categoria.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(
                "Categoria inválida: '" + value + "'. Valores válidos: " +
                Arrays.toString(Categoria.values()));
        }
    }
}
