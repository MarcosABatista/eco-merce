package com.placeoffers.vaga.dto;

import jakarta.validation.constraints.Size;

public record UpdateVagaRequest(
    @Size(max = 200, message = "Cargo deve ter no máximo 200 caracteres")
    String cargo,

    String descricao,

    Boolean ativo
) {}
