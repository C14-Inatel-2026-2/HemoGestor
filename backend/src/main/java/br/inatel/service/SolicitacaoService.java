package br.inatel.service;

import br.inatel.dto.SolicitacaoRequestDTO;
import br.inatel.dto.SolicitacaoResponseDTO;
import br.inatel.enumeracao.PrioridadeSolicitacao;
import br.inatel.exception.SolicitacaoNaoEncontradaException;
import br.inatel.model.BolsaSangue;
import br.inatel.model.Solicitacao;
import br.inatel.repository.SolicitacaoRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class SolicitacaoService {
    private final SolicitacaoRepository repository;

    public SolicitacaoService(SolicitacaoRepository repository){
        this.repository = repository;
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

    private int ordemPrioridade(PrioridadeSolicitacao prioridade) {
        return switch (prioridade) {
            case EMERGÊNCIA -> 1;
            case URGENTE -> 2;
            case NORMAL -> 3;
        };
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
                0
        );
    }

    public SolicitacaoResponseDTO buscarPorId(Long id) {
        Solicitacao solicitacao = repository.findById(id).orElseThrow(() -> new SolicitacaoNaoEncontradaException("Solicitação não encontrada."));
        return toResponseDTO(solicitacao);
    }
}
