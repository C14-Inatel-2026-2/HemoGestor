package br.inatel.service;

import br.inatel.model.Doacao;
import br.inatel.model.Doador;
import br.inatel.repository.DoacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Optional<Doacao> concluir(Long id) {
        return repository.findById(id).map(doacao -> {
            doacao.concluirDoacao();

            Doador doador = doacao.getDoador();
            doador.setUltima_doacao(doacao.getDataColeta());
            doador.setQtd_doacoes(doador.getQtd_doacoes()+1);
            doador.verificarStatus();
            
            return repository.save(doacao);
        });
    }

    public Optional<Doacao> descartar(Long id) {
        return repository.findById(id).map(doacao -> {
            doacao.descartarDoacao();
            return repository.save(doacao);
        });
    }

    public List<Doacao> buscarPorDoador(Long doadorId) {
        return repository.findByDoadorId(doadorId);
    }
}
