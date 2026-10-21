package com.daqui.usuario.service;

import com.daqui.common.dto.PageResponse;
import com.daqui.common.exception.BusinessException;
import com.daqui.common.exception.DuplicateResourceException;
import com.daqui.common.exception.ResourceNotFoundException;
import com.daqui.common.service.StorageService;
import com.daqui.usuario.dto.CreateUsuarioRequest;
import com.daqui.usuario.dto.LoginRequest;
import com.daqui.usuario.dto.UpdateUsuarioRequest;
import com.daqui.usuario.dto.UsuarioResponse;
import com.daqui.usuario.model.Usuario;
import com.daqui.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;

    public UsuarioResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Email ou senha inválidos"));

        if (!usuario.getAtivo()) {
            throw new BusinessException("Usuário inativo");
        }

        if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            throw new BusinessException("Email ou senha inválidos");
        }

        return toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse create(CreateUsuarioRequest request) {
        if (usuarioRepository.existsByCpfCnpj(request.cpfCnpj())) {
            throw new DuplicateResourceException("cpfCnpj", request.cpfCnpj());
        }
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("email", request.email());
        }

        Usuario usuario = new Usuario();
        usuario.setCpfCnpj(request.cpfCnpj());
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setTelefone(request.telefone());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setNomeLoja(request.nomeLoja());
        usuario.setImagemLoja(request.imagemLoja());
        if (request.ativo() != null) {
            usuario.setAtivo(request.ativo());
        }
        if (request.admin() != null) {
            usuario.setAdmin(request.admin());
        }

        usuario = usuarioRepository.save(usuario);

        // Cria o diretório do usuário no bucket: {id}-{nomeLoja}
        storageService.createUserDirectory(usuario.getId(), usuario.getNomeLoja());

        return toResponse(usuario);
    }

    public PageResponse<UsuarioResponse> findAll(int page, int size) {
        int limitedSize = Math.min(size, 100);
        Page<Usuario> usuarioPage = usuarioRepository.findByAtivoTrue(PageRequest.of(page, limitedSize));

        return new PageResponse<>(
                usuarioPage.getContent().stream().map(this::toResponse).toList(),
                usuarioPage.getTotalElements(),
                usuarioPage.getTotalPages(),
                usuarioPage.getNumber(),
                usuarioPage.getSize()
        );
    }

    public UsuarioResponse findById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
        return toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse update(Long id, UpdateUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        if (request.cpfCnpj() != null) {
            if (usuarioRepository.existsByCpfCnpjAndIdNot(request.cpfCnpj(), id)) {
                throw new DuplicateResourceException("cpfCnpj", request.cpfCnpj());
            }
            usuario.setCpfCnpj(request.cpfCnpj());
        }

        if (request.email() != null) {
            if (usuarioRepository.existsByEmailAndIdNot(request.email(), id)) {
                throw new DuplicateResourceException("email", request.email());
            }
            usuario.setEmail(request.email());
        }

        if (request.nome() != null) {
            usuario.setNome(request.nome());
        }

        if (request.telefone() != null) {
            usuario.setTelefone(request.telefone());
        }

        if (request.senha() != null) {
            usuario.setSenha(passwordEncoder.encode(request.senha()));
        }

        if (request.nomeLoja() != null) {
            usuario.setNomeLoja(request.nomeLoja());
        }

        if (request.imagemLoja() != null) {
            if (request.imagemLoja().isBlank()) {
                // String vazia = remover a imagem
                String oldImage = usuario.getImagemLoja();
                if (oldImage != null && !oldImage.isBlank()) {
                    storageService.deleteFile(oldImage);
                }
                usuario.setImagemLoja(null);
            } else {
                // Nova URL de imagem — se havia uma anterior, deletar do bucket
                String oldImage = usuario.getImagemLoja();
                if (oldImage != null && !oldImage.isBlank() && !oldImage.equals(request.imagemLoja())) {
                    storageService.deleteFile(oldImage);
                }
                usuario.setImagemLoja(request.imagemLoja());
            }
        }

        usuario = usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    @Transactional
    public void delete(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getCpfCnpj(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getNomeLoja(),
                usuario.getAtivo(),
                usuario.getAdmin(),
                usuario.getImagemLoja(),
                usuario.getCreatedAt(),
                usuario.getUpdatedAt()
        );
    }
}
