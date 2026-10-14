package com.placeoffers.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateUsuarioRequest(
    @NotBlank
    @Pattern(regexp = "^\\d{11}(\\d{3})?$")
    String cpfCnpj,

    @NotBlank
    @Size(min = 3, max = 150)
    String nome,

    @NotBlank
    @Email
    @Size(max = 255)
    String email,

    @Size(max = 20)
    String telefone,

    @NotBlank
    @Size(min = 8, max = 100)
    String senha,

    @Size(max = 150)
    String nomeLoja,

    @Size(max = 500)
    String imagemLoja,

    Boolean ativo,

    Boolean admin
) {}
