package com.daqui.vaga.dto;

import jakarta.validation.constraints.Size;

public record UpdateVagaRequest(
    @Size(max = 200, message = "Cargo deve ter no máximo 200 caracteres")
    String cargo,

    String descricao,

    @Size(max = 50, message = "Categoria deve ter no máximo 50 caracteres")
    String categoria,

    Boolean ativo
) {}
