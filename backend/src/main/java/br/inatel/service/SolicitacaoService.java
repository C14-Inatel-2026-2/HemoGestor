package br.inatel.service;

import br.inatel.dto.SolicitacaoRequestDTO;
import br.inatel.dto.SolicitacaoResponseDTO;
import br.inatel.enumeracao.PrioridadeSolicitacao;
import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.enumeracao.TipoDoacao;
import br.inatel.exception.SolicitacaoNaoEncontradaException;
import br.inatel.model.BolsaSangue;
import br.inatel.model.Solicitacao;
import br.inatel.repository.BolsaSangueRepository;
import br.inatel.repository.SolicitacaoRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class SolicitacaoService {
    private final SolicitacaoRepository repository;
    private final BolsaSangueRepository bolsaSangueRepository;

    public SolicitacaoService(SolicitacaoRepository repository, BolsaSangueRepository bolsaSangueRepository){
        this.repository = repository;
        this.bolsaSangueRepository = bolsaSangueRepository;
    }

    public SolicitacaoResponseDTO salvar(SolicitacaoRequestDTO dto) {
        Solicitacao solicitacao = new Solicitacao(
                dto.getInstituicao(),
                dto.getSetor(),
                dto.getTipoSanguineo(),
                dto.getQuantidade(),
                dto.getPrioridade(),
                dto.getJustificativa()
        );
        Solicitacao salva = repository.save(solicitacao);
        return toResponseDTO(salva);
    }

    public List<SolicitacaoResponseDTO> listarTodas() {
        return repository.findAll()
                .stream()
                .sorted(Comparator
                        .comparingInt((Solicitacao s) -> ordemPrioridade(s.getPrioridade()))
                        .thenComparing(Solicitacao::getDataSolicitacao)
                )
                .map(this::toResponseDTO)
                .toList();
    }

    private boolean tipoCompativel(String tipoSolicitado, String tipoBolsa) {
        return switch (tipoSolicitado) {
            case "O-" -> tipoBolsa.equals("O-");
            case "O+" -> tipoBolsa.equals("O+") || tipoBolsa.equals("O-");
            case "A-" -> tipoBolsa.equals("A-") || tipoBolsa.equals("O-");
            case "A+" -> List.of("A+", "A-", "O+", "O-").contains(tipoBolsa);
            case "B-" -> tipoBolsa.equals("B-") || tipoBolsa.equals("O-");
            case "B+" -> List.of("B+", "B-", "O+", "O-").contains(tipoBolsa);
            case "AB-" -> List.of("AB-", "A-", "B-", "O-").contains(tipoBolsa);
            case "AB+" -> true;
            default -> false;
        };
    }

    private int ordemPrioridade(PrioridadeSolicitacao prioridade) {
        return switch (prioridade) {
            case EMERGENCIA -> 1;
            case URGENTE -> 2;
            case NORMAL -> 3;
        };
    }

    private SolicitacaoResponseDTO toResponseDTO(Solicitacao solicitacao) {
        return new SolicitacaoResponseDTO(
                solicitacao.getId(),
                solicitacao.getInstituicao(),
                solicitacao.getSetor(),
                solicitacao.getTipoSanguineo(),
                solicitacao.getQuantidade(),
                solicitacao.getPrioridade(),
                solicitacao.getJustificativa(),
                solicitacao.getDataSolicitacao(),
                solicitacao.getStatus(),
                solicitacao.getBolsasReservadas()
                        .stream()
                        .map(BolsaSangue::getId)
                        .toList(),
                contarBolsasCompativeis(solicitacao)
        );
    }

    public SolicitacaoResponseDTO buscarPorId(Long id) {
        Solicitacao solicitacao = repository.findById(id).orElseThrow(() -> new SolicitacaoNaoEncontradaException("Solicitação não encontrada."));
        return toResponseDTO(solicitacao);
    }

    private List<BolsaSangue> buscarBolsasCompativeis(Solicitacao solicitacao) {
        return bolsaSangueRepository.findAll()
                .stream()
                .filter(bolsa -> bolsa.getSituacao() == SituacaoBolsa.DISPONIVEL)
                .filter(bolsa -> !bolsa.estaVencida())
                .filter(bolsa -> bolsa.getDoacao().getTipoDoacao() == TipoDoacao.SANGUE_TOTAL)
                .filter(bolsa -> tipoCompativel(
                        solicitacao.getTipoSanguineo(),
                        bolsa.getTipoSanguineo()
                ))
                .sorted(
                        Comparator
                                .comparing((BolsaSangue bolsa) ->
                                        !bolsa.getTipoSanguineo()
                                                .equals(solicitacao.getTipoSanguineo()))
                                .thenComparing(BolsaSangue::getDataValidade)
                )
                .toList();
    }

    public int contarBolsasCompativeis(Solicitacao solicitacao) {
        return buscarBolsasCompativeis(solicitacao).size();
    }

    public List<Long> listarIdsBolsasCompativeis(Solicitacao solicitacao) {
        return buscarBolsasCompativeis(solicitacao)
                .stream()
                .map(BolsaSangue::getId)
                .toList();
    }
}
