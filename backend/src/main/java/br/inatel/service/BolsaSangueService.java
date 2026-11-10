package br.inatel.service;

import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.exception.BolsaNaoEncontradaException;
import br.inatel.model.BolsaSangue;
import br.inatel.repository.BolsaSangueRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class BolsaSangueService {
    private final BolsaSangueRepository repository;

    public BolsaSangueService(BolsaSangueRepository repository) {
        this.repository = repository;
    }

    private List<BolsaSangue> ordenarPorValidade(List<BolsaSangue> bolsas) {
        return bolsas.stream()
                .sorted(Comparator.comparing(BolsaSangue::getDataValidade))
                .toList();
    }

    public List<BolsaSangue> listarTodas(){
        return ordenarPorValidade(repository.findAll());
    }

    public List<BolsaSangue> listarPorTipoSanguineo(String tipoSanguineo) {
        return ordenarPorValidade(repository.findByTipoSanguineo(tipoSanguineo));
    }

    public List<BolsaSangue> listarValidas(){
        return ordenarPorValidade(
                repository.findAll().stream().filter(b -> !b.estaVencida()).toList());
    }

    public List<BolsaSangue> listarVencidas(){
        return ordenarPorValidade(
                repository.findAll().stream().filter(BolsaSangue::estaVencida).toList());
    }

    public List<BolsaSangue> listarPorSituacao (SituacaoBolsa situacao){
        return ordenarPorValidade(repository.findBySituacao(situacao));
    }

    public BolsaSangue buscarPorId(Long id) {
        return buscarBolsaOuFalhar(id);
    }

    private BolsaSangue buscarBolsaOuFalhar(Long id) {
        return repository.findById(id).orElseThrow(() -> new BolsaNaoEncontradaException("Bolsa não encontrada."));
    }

    public BolsaSangue descartar(Long id) {
        BolsaSangue bolsa = buscarBolsaOuFalhar(id);
        bolsa.descartar();
        return repository.save(bolsa);
    }
}
