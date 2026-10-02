package br.inatel.service;
import br.inatel.model.Doador;
import br.inatel.repository.DoadorRepository;
import java.util.Optional;

public class DoadorService {
    private final DoadorRepository repository;

    public DoadorService(DoadorRepository repository){
        this.repository = repository;
    }

    public Optional<Doador> buscarPorId(Long id){
        return repository.buscarPorId(id);
    }

    public Doador salvar(Doador doador){
        return repository.salvar(doador);
    }
}
