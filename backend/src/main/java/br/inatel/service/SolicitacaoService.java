package br.inatel.service;

import br.inatel.dto.SolicitacaoRequestDTO;
import br.inatel.dto.SolicitacaoResponseDTO;
import br.inatel.model.BolsaSangue;
import br.inatel.model.Solicitacao;
import br.inatel.repository.SolicitacaoRepository;
import org.springframework.stereotype.Service;

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

    public List<SolicitacaoResponseDTO> listarTodas() {
        return repository.findAll().stream().map(this::toResponseDTO).toList();
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
}
