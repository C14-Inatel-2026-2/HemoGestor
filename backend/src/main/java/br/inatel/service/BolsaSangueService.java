package br.inatel.service;

import br.inatel.model.BolsaSangue;
import br.inatel.repository.BolsaSangueRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BolsaSangueService {
    private final BolsaSangueRepository repository;

    public BolsaSangueService(BolsaSangueRepository repository) {
        this.repository = repository;
    }

    public List<BolsaSangue> listarTodas(){
        return repository.findAll();
    }

    public List<BolsaSangue> listarPorTipoSanguineo(String tipoSanguineo) {
        return repository.findByTipoSanguineo(tipoSanguineo);
    }

    public List<BolsaSangue> listarValidas(){
        return repository.findAll().stream().filter(bolsa -> !bolsa.estaVencida()).toList();
    }

    public List<BolsaSangue> listarVencidas(){
        return repository.findAll().stream().filter(BolsaSangue::estaVencida).toList();
    }
}
