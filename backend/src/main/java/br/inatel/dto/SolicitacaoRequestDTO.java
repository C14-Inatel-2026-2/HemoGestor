package br.inatel.dto;

import br.inatel.enumeracao.PrioridadeSolicitacao;

public class SolicitacaoRequestDTO {
    private String instituicao;
    private String setor;
    private String tipoSanguineo;
    private Integer quantidade;
    private PrioridadeSolicitacao prioridade;
    private String justificativa;

    public String getInstituicao() {
        return instituicao;
    }

    public void setInstituicao(String instituicao) {
        this.instituicao = instituicao;
    }

    public String getSetor() {
        return setor;
    }

    public void setSetor(String setor) {
        this.setor = setor;
    }

    public String getTipoSanguineo() {
        return tipoSanguineo;
    }

    public void setTipoSanguineo(String tipoSanguineo) {
        this.tipoSanguineo = tipoSanguineo;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public PrioridadeSolicitacao getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeSolicitacao prioridade) {
        this.prioridade = prioridade;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public void setJustificativa(String justificativa) {
        this.justificativa = justificativa;
    }
}
