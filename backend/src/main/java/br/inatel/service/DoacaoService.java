package br.inatel.service;

import br.inatel.enumeracao.Sexo;
import br.inatel.enumeracao.StatusDoacao;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.model.Doacao;
import br.inatel.model.Doador;
import br.inatel.repository.DoacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.time.format.DateTimeFormatter;

@Service
public class DoacaoService {
    private final DoacaoRepository repository;

    public DoacaoService(DoacaoRepository repository){
        this.repository = repository;
    }

    public Doacao salvar(Doacao doacao) {
        Doador doador = doacao.getDoador();
        List<Doacao> doacoesValidas = repository.findByDoadorIdAndStatusNot(doador.getId(), StatusDoacao.DESCARTADA);

        LocalDate ultimaDoacaoValida = doador.getUltima_doacao();
        for (Doacao doacaoAnterior : doacoesValidas) {
            LocalDate data = doacaoAnterior.getDataColeta();
            if (ultimaDoacaoValida == null || data.isAfter(ultimaDoacaoValida)) {
                ultimaDoacaoValida = data;
            }
        }
        if (ultimaDoacaoValida != null) {
            LocalDate proximaDoacao;
            if (doador.getSexo() == Sexo.MASCULINO) {
                proximaDoacao = ultimaDoacaoValida.plusDays(60);
            } else {
                proximaDoacao = ultimaDoacaoValida.plusDays(90);
            }
            if (doacao.getDataColeta().isBefore(proximaDoacao)) {
                DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                throw new DadosInvalidosException(
                        doador.getNome() + " só poderá doar novamente a partir de " + proximaDoacao.format(formato) + ".");
            }
        }

        LocalDate inicioPeriodo = doacao.getDataColeta().minusMonths(12);
        long quantidadeUltimos12Meses = doacoesValidas.stream()
                .filter(doacaoAnterior ->
                        !doacaoAnterior.getDataColeta().isBefore(inicioPeriodo) && !doacaoAnterior.getDataColeta().isAfter(doacao.getDataColeta())).count();

        int limiteAnual;
        if (doador.getSexo() == Sexo.MASCULINO) {
            limiteAnual = 4;
        } else {
            limiteAnual = 3;
        }
        if (quantidadeUltimos12Meses >= limiteAnual) {
            throw new DadosInvalidosException(doador.getNome() + " atingiu o limite de " + limiteAnual + " doações nos últimos 12 meses.");
        }

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
