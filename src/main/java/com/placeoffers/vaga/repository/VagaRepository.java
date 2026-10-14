package com.placeoffers.vaga.repository;

import com.placeoffers.vaga.model.Vaga;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VagaRepository extends JpaRepository<Vaga, Long> {

    Page<Vaga> findByAtivoTrue(Pageable pageable);

    Page<Vaga> findByUsuarioId(Long usuarioId, Pageable pageable);

    Page<Vaga> findByUsuarioIdAndAtivoTrue(Long usuarioId, Pageable pageable);
}
