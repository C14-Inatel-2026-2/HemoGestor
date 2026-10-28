package br.inatel.service;

import br.inatel.model.Doacao;
import br.inatel.repository.DoacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoacaoService {
    private final DoacaoRepository repository;

    public DoacaoService(DoacaoRepository repository){
        this.repository = repository;
    }

    public Doacao salvar(Doacao doacao){
        return repository.save(doacao);
    }

    public List<Doacao> listarTodas(){
        return repository.findAll();
    }

    public Optional<Doacao> buscarPorID(Long id){
        return repository.findById(id);
    }

    public void deletar(Long id){
        repository.deleteById(id);
    }
}
