package br.inatel.repository;
import br.inatel.model.Doador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoadorRepository extends JpaRepository<Doador, Long> {

}
