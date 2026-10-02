package br.inatel.repository;
import br.inatel.model.Doador;
import java.util.Optional;

public interface DoadorRepository {
    Optional<Doador> buscarPorId(Long id);

    Doador salvar(Doador doador);
}
