package com.daqui.vaga.controller;

import com.daqui.common.dto.PageResponse;
import com.daqui.vaga.dto.CreateVagaRequest;
import com.daqui.vaga.dto.UpdateVagaRequest;
import com.daqui.vaga.dto.VagaResponse;
import com.daqui.vaga.service.VagaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vagas")
@RequiredArgsConstructor
public class VagaController {

    private final VagaService vagaService;

    @PostMapping
    public ResponseEntity<VagaResponse> create(@Valid @RequestBody CreateVagaRequest request) {
        VagaResponse response = vagaService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PageResponse<VagaResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String categoria) {
        return ResponseEntity.ok(vagaService.findAll(page, size, usuarioId, categoria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VagaResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(vagaService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VagaResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVagaRequest request) {
        return ResponseEntity.ok(vagaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vagaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
