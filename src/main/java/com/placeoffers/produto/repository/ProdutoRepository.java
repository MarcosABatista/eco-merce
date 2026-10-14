package com.placeoffers.produto.repository;

import com.placeoffers.produto.model.Categoria;
import com.placeoffers.produto.model.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    Page<Produto> findByAtivoTrue(Pageable pageable);

    Page<Produto> findByUsuarioId(Long usuarioId, Pageable pageable);

    Page<Produto> findByUsuarioIdAndAtivoTrue(Long usuarioId, Pageable pageable);

    Page<Produto> findByCategoriaAndAtivoTrue(Categoria categoria, Pageable pageable);

    Page<Produto> findByUsuarioIdAndCategoriaAndAtivoTrue(
        Long usuarioId, Categoria categoria, Pageable pageable);
}
