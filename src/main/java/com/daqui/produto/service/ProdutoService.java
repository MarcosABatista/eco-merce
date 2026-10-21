package com.daqui.produto.service;

import com.daqui.common.dto.PageResponse;
import com.daqui.common.exception.BusinessException;
import com.daqui.common.exception.ResourceNotFoundException;
import com.daqui.common.service.StorageService;
import com.daqui.produto.dto.CreateProdutoRequest;
import com.daqui.produto.dto.ProdutoResponse;
import com.daqui.produto.dto.UpdateProdutoRequest;
import com.daqui.produto.model.Categoria;
import com.daqui.produto.model.Produto;
import com.daqui.produto.repository.ProdutoRepository;
import com.daqui.usuario.model.Usuario;
import com.daqui.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final StorageService storageService;

    @Transactional
    public ProdutoResponse create(CreateProdutoRequest request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", request.usuarioId()));

        if (!usuario.getAtivo()) {
            throw new BusinessException("Não é possível criar produto para um usuário inativo");
        }

        Categoria categoria = Categoria.fromString(request.categoria());

        validarPrecoDesconto(request.preco(), request.precoDesconto());

        Produto produto = new Produto();
        produto.setUsuario(usuario);
        produto.setNome(request.nome());
        produto.setDescricao(request.descricao());
        produto.setPreco(request.preco());
        produto.setCategoria(categoria);
        produto.setUrlImagem(request.urlImagem());
        produto.setPrecoDesconto(request.precoDesconto());

        produto = produtoRepository.save(produto);
        return toResponse(produto);
    }

    public PageResponse<ProdutoResponse> findAll(int page, int size, Long usuarioId, String categoria) {
        int limitedSize = Math.min(size, 50);
        PageRequest pageRequest = PageRequest.of(page, limitedSize);

        Page<Produto> produtoPage;

        if (usuarioId != null && categoria != null) {
            Categoria cat = Categoria.fromString(categoria);
            produtoPage = produtoRepository.findByUsuarioIdAndCategoriaAndAtivoTrue(usuarioId, cat, pageRequest);
        } else if (usuarioId != null) {
            // Retorna todos os produtos do usuário (ativos e inativos) para ele gerenciar
            produtoPage = produtoRepository.findByUsuarioId(usuarioId, pageRequest);
        } else if (categoria != null) {
            Categoria cat = Categoria.fromString(categoria);
            produtoPage = produtoRepository.findByCategoriaAndAtivoTrue(cat, pageRequest);
        } else {
            produtoPage = produtoRepository.findByAtivoTrue(pageRequest);
        }

        return new PageResponse<>(
                produtoPage.getContent().stream().map(this::toResponse).toList(),
                produtoPage.getTotalElements(),
                produtoPage.getTotalPages(),
                produtoPage.getNumber(),
                produtoPage.getSize()
        );
    }

    public ProdutoResponse findById(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
        return toResponse(produto);
    }

    @Transactional
    public ProdutoResponse update(Long id, UpdateProdutoRequest request) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));

        if (request.nome() != null) {
            produto.setNome(request.nome());
        }

        if (request.descricao() != null) {
            produto.setDescricao(request.descricao());
        }

        if (request.preco() != null) {
            produto.setPreco(request.preco());
        }

        if (request.categoria() != null) {
            Categoria categoria = Categoria.fromString(request.categoria());
            produto.setCategoria(categoria);
        }

        if (request.urlImagem() != null) {
            if (request.urlImagem().isBlank()) {
                // String vazia = remover a imagem
                String oldImage = produto.getUrlImagem();
                if (oldImage != null && !oldImage.isBlank()) {
                    storageService.deleteFile(oldImage);
                }
                produto.setUrlImagem(null);
            } else {
                // Nova imagem — deletar a antiga do bucket se existir
                String oldImage = produto.getUrlImagem();
                if (oldImage != null && !oldImage.isBlank() && !oldImage.equals(request.urlImagem())) {
                    storageService.deleteFile(oldImage);
                }
                produto.setUrlImagem(request.urlImagem());
            }
        }

        if (request.ativo() != null) {
            produto.setAtivo(request.ativo());
        }

        // Validate precoDesconto against the final preco (which may have been updated above)
        validarPrecoDesconto(produto.getPreco(), request.precoDesconto());
        produto.setPrecoDesconto(request.precoDesconto());

        produto = produtoRepository.save(produto);
        return toResponse(produto);
    }

    @Transactional
    public void delete(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));

        // Deletar imagem do bucket ao remover o produto
        String imagem = produto.getUrlImagem();
        if (imagem != null && !imagem.isBlank()) {
            storageService.deleteFile(imagem);
        }

        produto.setAtivo(false);
        produto.setUrlImagem(null);
        produtoRepository.save(produto);
    }

    private ProdutoResponse toResponse(Produto produto) {
        return new ProdutoResponse(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getPreco(),
                produto.getPrecoDesconto(),
                calcularPercentualDesconto(produto.getPreco(), produto.getPrecoDesconto()),
                produto.getCategoria(),
                produto.getUrlImagem(),
                produto.getAtivo(),
                produto.getNomeLoja(),
                produto.getTelefone(),
                produto.getCreatedAt(),
                produto.getUpdatedAt()
        );
    }

    private void validarPrecoDesconto(BigDecimal preco, BigDecimal precoDesconto) {
        if (precoDesconto != null && precoDesconto.compareTo(preco) >= 0) {
            throw new BusinessException("Preço com desconto deve ser menor que o preço original");
        }
    }

    private Integer calcularPercentualDesconto(BigDecimal preco, BigDecimal precoDesconto) {
        if (precoDesconto == null) return null;
        BigDecimal diferenca = preco.subtract(precoDesconto);
        BigDecimal percentual = diferenca.divide(preco, 4, RoundingMode.HALF_UP)
                                         .multiply(BigDecimal.valueOf(100));
        return percentual.setScale(0, RoundingMode.HALF_UP).intValue();
    }
}
