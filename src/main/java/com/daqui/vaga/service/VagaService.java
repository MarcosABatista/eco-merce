package com.daqui.vaga.service;

import com.daqui.common.dto.PageResponse;
import com.daqui.common.exception.BusinessException;
import com.daqui.common.exception.ResourceNotFoundException;
import com.daqui.usuario.model.Usuario;
import com.daqui.usuario.repository.UsuarioRepository;
import com.daqui.vaga.dto.CreateVagaRequest;
import com.daqui.vaga.dto.UpdateVagaRequest;
import com.daqui.vaga.dto.VagaResponse;
import com.daqui.vaga.model.Vaga;
import com.daqui.vaga.repository.VagaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VagaService {

    private final VagaRepository vagaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public VagaResponse create(CreateVagaRequest request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", request.usuarioId()));

        if (!usuario.getAtivo()) {
            throw new BusinessException("Não é possível criar vaga para um usuário inativo");
        }

        Vaga vaga = new Vaga();
        vaga.setUsuario(usuario);
        vaga.setCargo(request.cargo());
        vaga.setDescricao(request.descricao());
        vaga.setCategoria(request.categoria());

        vaga = vagaRepository.save(vaga);
        return toResponse(vaga);
    }

    public PageResponse<VagaResponse> findAll(int page, int size, Long usuarioId, String categoria) {
        int limitedSize = Math.min(size, 50);
        PageRequest pageRequest = PageRequest.of(page, limitedSize);

        Page<Vaga> vagaPage;

        if (usuarioId != null) {
            // Retorna todas as vagas do usuário (ativas e inativas) para ele gerenciar
            vagaPage = vagaRepository.findByUsuarioId(usuarioId, pageRequest);
        } else if (categoria != null) {
            vagaPage = vagaRepository.findByCategoriaAndAtivoTrue(categoria, pageRequest);
        } else {
            vagaPage = vagaRepository.findByAtivoTrue(pageRequest);
        }

        return new PageResponse<>(
                vagaPage.getContent().stream().map(this::toResponse).toList(),
                vagaPage.getTotalElements(),
                vagaPage.getTotalPages(),
                vagaPage.getNumber(),
                vagaPage.getSize()
        );
    }

    public VagaResponse findById(Long id) {
        Vaga vaga = vagaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaga", id));
        return toResponse(vaga);
    }

    @Transactional
    public VagaResponse update(Long id, UpdateVagaRequest request) {
        Vaga vaga = vagaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaga", id));

        if (request.cargo() != null) {
            vaga.setCargo(request.cargo());
        }

        if (request.descricao() != null) {
            vaga.setDescricao(request.descricao());
        }

        if (request.categoria() != null) {
            vaga.setCategoria(request.categoria());
        }

        if (request.ativo() != null) {
            vaga.setAtivo(request.ativo());
        }

        vaga = vagaRepository.save(vaga);
        return toResponse(vaga);
    }

    @Transactional
    public void delete(Long id) {
        Vaga vaga = vagaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaga", id));

        vaga.setAtivo(false);
        vagaRepository.save(vaga);
    }

    private VagaResponse toResponse(Vaga vaga) {
        return new VagaResponse(
                vaga.getId(),
                vaga.getUsuario().getId(),
                vaga.getNomeUsuario(),
                vaga.getNomeLoja(),
                vaga.getCargo(),
                vaga.getDescricao(),
                vaga.getCategoria(),
                vaga.getAtivo(),
                vaga.getCreatedAt(),
                vaga.getUpdatedAt()
        );
    }
}
