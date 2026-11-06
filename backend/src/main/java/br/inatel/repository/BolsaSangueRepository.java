package br.inatel.repository;

import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.model.BolsaSangue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BolsaSangueRepository extends JpaRepository<BolsaSangue, Long> {
    List<BolsaSangue> findByTipoSanguineo(String tipoSanguineo);
    List<BolsaSangue> findBySituacao(SituacaoBolsa situacao);
}
