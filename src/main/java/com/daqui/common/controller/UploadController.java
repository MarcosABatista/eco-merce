package com.daqui.common.controller;

import com.daqui.common.exception.ResourceNotFoundException;
import com.daqui.common.service.StorageService;
import com.daqui.usuario.model.Usuario;
import com.daqui.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UploadController {

    private final StorageService storageService = null;
    private final UsuarioRepository usuarioRepository = null;

    /**
     * Upload de arquivo para o diretório do usuário no bucket.
     * O diretório é: {userId}-{nomeLoja normalizado}
     */
    @PostMapping("/api/v1/upload/{userId}")
    public ResponseEntity<Map<String, String>> upload(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));

        String userDirectory = storageService.buildUserDirectoryName(usuario.getId(), usuario.getNomeLoja());
        String url = storageService.uploadFile(file, userDirectory);
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * Serve imagens do MinIO via backend (proxy).
     * Acessa: /api/v1/images/{objectName}
     */
    @GetMapping("/api/v1/images/**")
    public ResponseEntity<byte[]> serveImage(jakarta.servlet.http.HttpServletRequest request) {
        String fullPath = request.getRequestURI();
        // Remove o prefixo "/api/v1/images/" para obter o objectName
        String objectName = fullPath.substring("/api/v1/images/".length());

        try {
            byte[] data = storageService.getFile(objectName);
            String contentType = guessContentType(objectName);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String guessContentType(String filename) {
        if (filename.endsWith(".png")) return "image/png";
        if (filename.endsWith(".gif")) return "image/gif";
        if (filename.endsWith(".webp")) return "image/webp";
        if (filename.endsWith(".svg")) return "image/svg+xml";
        return "image/jpeg";
    }
}
