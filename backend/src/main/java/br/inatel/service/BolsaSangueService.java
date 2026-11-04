package br.inatel.service;

import br.inatel.enumeracao.SituacaoBolsa;
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

    public List<BolsaSangue> listarPorSituacao (SituacaoBolsa situacao){
        return repository.findBySituacao(situacao);
    }

    public BolsaSangue buscarPorId(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Bolsa não encontrada."));
    }

    public BolsaSangue descartar(Long id) {
        BolsaSangue bolsa = repository.findById(id).orElseThrow(() -> new RuntimeException("Bolsa não encontrada."));
        bolsa.descartar();
        return repository.save(bolsa);
    }
}
