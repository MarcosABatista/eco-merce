package com.placeoffers.usuario.dto;

import java.time.LocalDateTime;

public record UsuarioResponse(
    Long id,
    String cpfCnpj,
    String nome,
    String email,
    String telefone,
    String nomeLoja,
    Boolean ativo,
    Boolean admin,
    String imagemLoja,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
