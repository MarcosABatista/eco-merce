package com.daqui.vaga.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateVagaRequest(
    @NotNull(message = "ID do usuário é obrigatório")
    Long usuarioId,

    @NotBlank(message = "Cargo é obrigatório")
    @Size(max = 200, message = "Cargo deve ter no máximo 200 caracteres")
    String cargo,

    String descricao,

    @Size(max = 50, message = "Categoria deve ter no máximo 50 caracteres")
    String categoria
) {}
