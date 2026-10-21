package com.daqui.vaga.dto;

import java.time.LocalDateTime;

public record VagaResponse(
    Long id,
    Long usuarioId,
    String nomeUsuario,
    String nomeLoja,
    String cargo,
    String descricao,
    String categoria,
    Boolean ativo,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
