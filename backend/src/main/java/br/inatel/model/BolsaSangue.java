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
        return switch (doacao.getTipoDoacao()) {
            case SANGUE_TOTAL -> dataColeta.plusDays(35);
            case PLAQUETA_POR_AFERESE -> dataColeta.plusDays(5);
            case PLASMA -> dataColeta.plusDays(365);
        };
    }

    public boolean estaVencida(){
        return dataValidade != null && dataValidade.isBefore(LocalDate.now());
    }

    public void descartar() {
        if (this.situacao != SituacaoBolsa.DISPONIVEL) {
            throw new IllegalStateException("Só é possível descartar bolsas disponíveis.");
        }
        this.situacao = SituacaoBolsa.DESCARTADA;
    }

    public void reservar(){
        if(this.situacao != SituacaoBolsa.DISPONIVEL){
            throw new IllegalStateException("Só é possível reservar bolsas disponíveis.");
        }
        this.situacao = SituacaoBolsa.RESERVADA;
    }

    public void utilizar(){
        if(this.situacao != SituacaoBolsa.RESERVADA){
            throw new IllegalStateException("Só é possível utilizar bolsas reservadas.");
        }
        this.situacao = SituacaoBolsa.UTILIZADA;
    }

    public void liberarReserva(){
        if(this.situacao != SituacaoBolsa.RESERVADA){
            throw new IllegalStateException("Só é possível liberar bolsas reservadas.");
        }
        this.situacao = SituacaoBolsa.DISPONIVEL;
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
