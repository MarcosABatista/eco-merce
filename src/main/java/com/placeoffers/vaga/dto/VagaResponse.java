package com.placeoffers.vaga.dto;

import java.time.LocalDateTime;

public record VagaResponse(
    Long id,
    Long usuarioId,
    String nomeUsuario,
    String nomeLoja,
    String cargo,
    String descricao,
    Boolean ativo,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
