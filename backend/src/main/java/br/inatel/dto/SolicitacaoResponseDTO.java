package br.inatel.dto;

import br.inatel.enumeracao.PrioridadeSolicitacao;
import br.inatel.enumeracao.StatusSolicitacao;

import java.time.LocalDateTime;
import java.util.List;

public class SolicitacaoResponseDTO {
    private Long id;
    private String instituicao;
    private String setor;
    private String tipoSanguineo;
    private Integer quantidade;
    private PrioridadeSolicitacao prioridade;
    private String justificativa;
    private LocalDateTime dataSolicitacao;
    private StatusSolicitacao status;
    private List<Long> bolsasReservadas;
    private Integer bolsasCompativeisDisponiveis;

    public SolicitacaoResponseDTO(Long id, String instituicao, String setor, String tipoSanguineo, Integer quantidade, PrioridadeSolicitacao prioridade, String justificativa, LocalDateTime dataSolicitacao, StatusSolicitacao status, List<Long> bolsasReservadas, Integer bolsasCompativeisDisponiveis) {
        this.id = id;
        this.instituicao = instituicao;
        this.setor = setor;
        this.tipoSanguineo = tipoSanguineo;
        this.quantidade = quantidade;
        this.prioridade = prioridade;
        this.justificativa = justificativa;
        this.dataSolicitacao = dataSolicitacao;
        this.status = status;
        this.bolsasReservadas = bolsasReservadas;
        this.bolsasCompativeisDisponiveis = bolsasCompativeisDisponiveis;
    }

    public Long getId() {
        return id;
    }

    public String getInstituicao() {
        return instituicao;
    }

    public String getSetor() {
        return setor;
    }

    public String getTipoSanguineo() {
        return tipoSanguineo;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public PrioridadeSolicitacao getPrioridade() {
        return prioridade;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public LocalDateTime getDataSolicitacao() {
        return dataSolicitacao;
    }

    public StatusSolicitacao getStatus() {
        return status;
    }

    public List<Long> getBolsasReservadas() {
        return bolsasReservadas;
    }

    public Integer getBolsasCompativeisDisponiveis() {
        return bolsasCompativeisDisponiveis;
    }
}
