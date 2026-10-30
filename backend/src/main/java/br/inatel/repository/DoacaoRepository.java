package br.inatel.repository;

import br.inatel.enumeracao.StatusDoacao;
import br.inatel.model.Doacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoacaoRepository extends JpaRepository<Doacao, Long> {
    List<Doacao> findByDoadorId(Long doadorId);
    List<Doacao> findByDoadorIdAndStatusNot(Long doadorId, StatusDoacao status);
}
