package br.inatel.model;

import br.inatel.enumeracao.PrioridadeSolicitacao;
import br.inatel.enumeracao.StatusSolicitacao;
import br.inatel.exception.DadosInvalidosException;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "solicitacao")
public class Solicitacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String instituicao;
    private String setor;
    private String tipoSanguineo;
    private Integer quantidade;
    @Enumerated(EnumType.STRING)
    private PrioridadeSolicitacao prioridade;
    private String justificativa;
    private LocalDateTime dataSolicitacao;
    @Enumerated(EnumType.STRING)
    private StatusSolicitacao status;
    @ManyToMany
    @JoinTable(
            name = "solicitacao_bolsa",
            joinColumns = @JoinColumn(name = "solicitacao_id"),
            inverseJoinColumns = @JoinColumn(name = "bolsa_id")
    )
    private List<BolsaSangue> bolsasReservadas = new ArrayList<>();

    public Solicitacao() {
    }

    public Solicitacao(String instituicao, String setor, String tipoSanguineo, Integer quantidade, PrioridadeSolicitacao prioridade, String justificativa) {
        if (instituicao == null || instituicao.isBlank()) {
            throw new DadosInvalidosException("Instituição é obrigatória.");
        }
        if (tipoSanguineo == null || tipoSanguineo.isBlank()) {
            throw new DadosInvalidosException("Tipo sanguíneo é obrigatório.");
        }
        if (quantidade == null || quantidade <= 0) {
            throw new DadosInvalidosException("Quantidade deve ser maior que zero.");
        }
        if (prioridade == null) {
            throw new DadosInvalidosException("Prioridade é obrigatória.");
        }
        this.instituicao = instituicao;
        this.setor = setor;
        this.tipoSanguineo = tipoSanguineo;
        this.quantidade = quantidade;
        this.prioridade = prioridade;
        this.justificativa = justificativa;
        this.dataSolicitacao = LocalDateTime.now();
        this.status = StatusSolicitacao.PENDENTE;
    }

    public void iniciarAtendimento(){
        if(this.status != StatusSolicitacao.PENDENTE){
            throw new IllegalStateException("Só é possível atender solicitações pendentes.");
        }
        this.status = StatusSolicitacao.EM_ATENDIMENTO;
    }

    public void concluirAtendimento(){
        if(this.status != StatusSolicitacao.EM_ATENDIMENTO){
            throw new IllegalStateException("Só é possível concluir solicitações em atendimento.");
        }
        this.status = StatusSolicitacao.ATENDIDA;
    }

    public void cancelar(){
        if(this.status != StatusSolicitacao.PENDENTE && this.status != StatusSolicitacao.EM_ATENDIMENTO){
            throw new IllegalStateException("Só é possível cancelar solicitações pendentes ou em atendimento.");
        }
        this.status = StatusSolicitacao.CANCELADA;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDateTime getDataSolicitacao() {
        return dataSolicitacao;
    }

    public void setDataSolicitacao(LocalDateTime dataSolicitacao) {
        this.dataSolicitacao = dataSolicitacao;
    }

    public StatusSolicitacao getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacao status) {
        this.status = status;
    }

    public List<BolsaSangue> getBolsasReservadas() {
        return bolsasReservadas;
    }

    public void setBolsasReservadas(List<BolsaSangue> bolsasReservadas) {
        this.bolsasReservadas = bolsasReservadas;
    }
}
