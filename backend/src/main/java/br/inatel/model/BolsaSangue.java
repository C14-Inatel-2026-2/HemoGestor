package br.inatel.model;

import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.enumeracao.TipoDoacao;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "BolsaSangue")
public class BolsaSangue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "doacao_id", nullable = false, unique = true)
    private Doacao doacao;

    @Column(name = "tipo_sanguineo", nullable = false)
    private String tipoSanguineo;
    @Column(name = "data_coleta", nullable = false)
    private LocalDate dataColeta;
    @Column(name = "data_validade")
    private LocalDate dataValidade;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SituacaoBolsa situacao;

    public BolsaSangue(){

    }

    public BolsaSangue(Doacao doacao, String tipoSanguineo, LocalDate dataColeta, SituacaoBolsa situacao) {
        this.doacao = doacao;
        this.tipoSanguineo = tipoSanguineo;
        this.dataColeta = dataColeta;
        this.situacao = situacao;
        this.dataValidade = calcularDataValidade();
    }

    public LocalDate calcularDataValidade(){
        if(doacao.getTipoDoacao() == TipoDoacao.SANGUE_TOTAL) {
            return dataColeta.plusDays(35);
        } else if (doacao.getTipoDoacao() == TipoDoacao.PLAQUETA_POR_AFERESE) {
            return dataColeta.plusDays(5);
        } else if (doacao.getTipoDoacao() == TipoDoacao.PLASMA) {
            return dataColeta.plusMonths(12);
        }
        return null;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doacao getDoacao() {
        return doacao;
    }

    public void setDoacao(Doacao doacao) {
        this.doacao = doacao;
    }

    public String getTipoSanguineo() {
        return tipoSanguineo;
    }

    public void setTipoSanguineo(String tipoSanguineo) {
        this.tipoSanguineo = tipoSanguineo;
    }

    public LocalDate getDataColeta() {
        return dataColeta;
    }

    public void setDataColeta(LocalDate dataColeta) {
        this.dataColeta = dataColeta;
    }

    public LocalDate getDataValidade() {
        return dataValidade;
    }

    public void setDataValidade(LocalDate dataValidade) {
        this.dataValidade = dataValidade;
    }

    public SituacaoBolsa getSituacao() {
        return situacao;
    }

    public void setSituacao(SituacaoBolsa situacao) {
        this.situacao = situacao;
    }
}
