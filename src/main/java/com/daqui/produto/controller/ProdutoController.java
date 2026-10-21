package com.daqui.produto.controller;

import com.daqui.common.dto.PageResponse;
import com.daqui.produto.dto.CreateProdutoRequest;
import com.daqui.produto.dto.ProdutoResponse;
import com.daqui.produto.dto.UpdateProdutoRequest;
import com.daqui.produto.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    @PostMapping
    public ResponseEntity<ProdutoResponse> create(@Valid @RequestBody CreateProdutoRequest request) {
        ProdutoResponse response = produtoService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PageResponse<ProdutoResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String categoria) {
        return ResponseEntity.ok(produtoService.findAll(page, size, usuarioId, categoria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProdutoRequest request) {
        return ResponseEntity.ok(produtoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        produtoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
