package br.inatel.service;

import br.inatel.enumeracao.Sexo;
import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.enumeracao.StatusDoacao;
import br.inatel.exception.ConflitoException;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.model.BolsaSangue;
import br.inatel.model.Doacao;
import br.inatel.model.Doador;
import br.inatel.repository.BolsaSangueRepository;
import br.inatel.repository.DoacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class DoacaoService {
    private final DoacaoRepository repository;
    private final BolsaSangueRepository bolsaSangueRepository;

    public DoacaoService(DoacaoRepository repository, BolsaSangueRepository bolsaSangueRepository) {
        this.repository = repository;
        this.bolsaSangueRepository = bolsaSangueRepository;
    }

    public Doacao salvar(Doacao doacao) {
        Doador doador = doacao.getDoador();
        List<Doacao> doacoesValidas = repository.findByDoadorIdAndStatusNot(doador.getId(), StatusDoacao.DESCARTADA);

        validarIntervaloDoacoes(doacao, doador, doacoesValidas);
        validarLimiteAnual(doacao, doacoesValidas, doador);

        return repository.save(doacao);
    }

    private static void validarLimiteAnual(Doacao doacao, List<Doacao> doacoesValidas, Doador doador) {
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
    }

    private static void validarIntervaloDoacoes(Doacao doacao, Doador doador, List<Doacao> doacoesValidas) {
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
            if(doacao.getStatus() != StatusDoacao.EM_TRIAGEM){
                throw new ConflitoException("Só é possível concluir doações em triagem.");
            }

            Doador doador = doacao.getDoador();
            if(doacao.getDoador().getTipo_sanguineo() == null || doacao.getDoador().getTipo_sanguineo().isBlank()){
                throw new DadosInvalidosException("Informe o tipo sanguíneo do doador antes de concluir a doação.");
            }

            doacao.concluirDoacao();
            doador.registrarDoacao(doacao.getDataColeta());

            BolsaSangue bolsa = new BolsaSangue(doacao, doador.getTipo_sanguineo(), doacao.getDataColeta(), SituacaoBolsa.DISPONIVEL);
            bolsaSangueRepository.save(bolsa);
            return repository.save(doacao);
        });
    }

    public Optional<Doacao> descartar(Long id) {
        return repository.findById(id).map(doacao -> {
            if(doacao.getStatus() != StatusDoacao.EM_TRIAGEM){
                throw new ConflitoException("Só é possível descartar doações em triagem.");
            }
            doacao.descartarDoacao();
            return repository.save(doacao);
        });
    }

    public List<Doacao> buscarPorDoador(Long doadorId) {
        return repository.findByDoadorId(doadorId);
    }
}
