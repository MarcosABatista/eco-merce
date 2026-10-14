package com.placeoffers.common.service;

import io.minio.*;
import io.minio.errors.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.Normalizer;
import java.util.UUID;

@Service
public class StorageService {

    private final MinioClient minioClient;
    private final String bucket;
    private final String endpoint;

    public StorageService(MinioClient minioClient,
                          @Value("${minio.bucket}") String bucket,
                          @Value("${minio.endpoint}") String endpoint) {
        this.minioClient = minioClient;
        this.bucket = bucket;
        this.endpoint = endpoint;
    }

    /**
     * Faz upload de um arquivo no diretório do usuário dentro do bucket.
     */
    public String uploadFile(MultipartFile file, String userDirectory) {
        try {
            ensureBucketExists();

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String objectName = userDirectory + "/" + UUID.randomUUID() + extension;

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return "/api/v1/images/" + objectName;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao fazer upload do arquivo: " + e.getMessage(), e);
        }
    }

    /**
     * Faz upload sem diretório específico (compatibilidade).
     */
    public String uploadFile(MultipartFile file) {
        try {
            ensureBucketExists();

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String objectName = UUID.randomUUID() + extension;

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return "/api/v1/images/" + objectName;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao fazer upload do arquivo: " + e.getMessage(), e);
        }
    }

    /**
     * Cria o diretório (prefixo) do usuário dentro do bucket.
     * O nome do diretório é: {id}-{nomeLoja normalizado}
     */
    public void createUserDirectory(Long userId, String nomeLoja) {
        try {
            ensureBucketExists();

            String directoryName = buildUserDirectoryName(userId, nomeLoja);

            // MinIO/S3 não tem diretórios reais — criamos um objeto vazio com trailing "/"
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(directoryName + "/")
                            .stream(new ByteArrayInputStream(new byte[0]), 0, -1)
                            .contentType("application/x-directory")
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Erro ao criar diretório do usuário: " + e.getMessage(), e);
        }
    }

    /**
     * Monta o nome do diretório do usuário: {id}-{nomeLoja normalizado}
     */
    public String buildUserDirectoryName(Long userId, String nomeLoja) {
        String normalized = normalizeDirectoryName(nomeLoja);
        return userId + "-" + normalized;
    }

    /**
     * Deleta um arquivo do bucket pela URL relativa.
     * URL esperada: /place-offers-images/1-cacau/uuid.jpeg
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }
        try {
            String objectName = extractObjectName(fileUrl);
            if (objectName == null) return;

            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar arquivo do bucket: " + e.getMessage(), e);
        }
    }

    /**
     * Busca um arquivo do bucket pelo objectName.
     */
    public byte[] getFile(String objectName) {
        try {
            try (var stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build())) {
                return stream.readAllBytes();
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar arquivo do bucket: " + e.getMessage(), e);
        }
    }

    /**
     * Extrai o objectName a partir de uma URL de imagem.
     */
    private String extractObjectName(String fileUrl) {
        // Novo formato: /api/v1/images/objectName
        String apiPrefix = "/api/v1/images/";
        if (fileUrl.contains(apiPrefix)) {
            int idx = fileUrl.indexOf(apiPrefix);
            return fileUrl.substring(idx + apiPrefix.length());
        }

        // Formato com bucket path: /place-offers-images/objectName
        String bucketPrefix = "/" + bucket + "/";
        int idx = fileUrl.indexOf(bucketPrefix);
        if (idx >= 0) {
            return fileUrl.substring(idx + bucketPrefix.length());
        }

        // URL antiga com endpoint completo: http://localhost:9000/bucket/objectName
        String altPrefix = endpoint + "/" + bucket + "/";
        if (fileUrl.startsWith(altPrefix)) {
            return fileUrl.substring(altPrefix.length());
        }
        return null;
    }

    private String normalizeDirectoryName(String name) {
        if (name == null || name.isBlank()) {
            return "sem-loja";
        }
        // Remove acentos
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        // Converte para minúsculas, substitui espaços por hifens, remove caracteres especiais
        return normalized.toLowerCase()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9\\-]", "");
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucket).build()
        );
        if (!exists) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucket).build()
            );
            // Set bucket policy to public read
            String policy = """
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": "*",
                            "Action": ["s3:GetObject"],
                            "Resource": ["arn:aws:s3:::%s/*"]
                        }
                    ]
                }
                """.formatted(bucket);
            minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(bucket)
                            .config(policy)
                            .build()
            );
        }
    }
}
