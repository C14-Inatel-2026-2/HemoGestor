package br.inatel.model;
import br.inatel.enumeracao.StatusDoacao;
import br.inatel.enumeracao.TipoDoacao;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "Doacao")
public class Doacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne //um doador pode possuir varias doações, mas uma doação pode pertencer a um único doador
    @JoinColumn(name = "doador_id", nullable = false)
    private Doador doador;
    private LocalDate dataColeta;
    private LocalTime horaColeta;
    private int volume_ml;
    @Enumerated(EnumType.STRING)
    private TipoDoacao tipoDoacao;
    private String pressaoArterial;
    private BigDecimal hemoglobina;
    private String sala;
    private String responsavel;
    @Column(columnDefinition = "TEXT")
    private String intercorrencia;
    @Enumerated(EnumType.STRING)
    private StatusDoacao status;

    public Doacao(){}

    public Doacao(Long id, Doador doador, LocalDate dataColeta, LocalTime horaColeta, int volume_ml, TipoDoacao tipoDoacao, String pressaoArterial, BigDecimal hemoglobina, String sala, String responsavel, String intercorrencia, StatusDoacao status) {
        this.id = id;
        this.doador = doador;
        this.dataColeta = dataColeta;
        this.horaColeta = horaColeta;
        this.volume_ml = volume_ml;
        this.tipoDoacao = tipoDoacao;
        this.pressaoArterial = pressaoArterial;
        this.hemoglobina = hemoglobina;
        this.sala = sala;
        this.responsavel = responsavel;
        this.intercorrencia = intercorrencia;
        this.status = StatusDoacao.EM_TRIAGEM; //a bolsa entra no estoque automaticamente em triagem
    }
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doador getDoador() {
        return doador;
    }

    public void setDoador(Doador doador) {
        this.doador = doador;
    }

    public LocalDate getDataColeta() {
        return dataColeta;
    }

    public void setDataColeta(LocalDate dataColeta) {
        this.dataColeta = dataColeta;
    }

    public LocalTime getHoraColeta() {
        return horaColeta;
    }

    public void setHoraColeta(LocalTime horaColeta) {
        this.horaColeta = horaColeta;
    }

    public int getVolume_ml() {
        return volume_ml;
    }

    public void setVolume_ml(int volume_ml) {
        this.volume_ml = volume_ml;
    }

    public TipoDoacao getTipoDoacao() {
        return tipoDoacao;
    }

    public void setTipoDoacao(TipoDoacao tipoDoacao) {
        this.tipoDoacao = tipoDoacao;
    }

    public String getPressaoArterial() {
        return pressaoArterial;
    }

    public void setPressaoArterial(String pressaoArterial) {
        this.pressaoArterial = pressaoArterial;
    }

    public BigDecimal getHemoglobina() {
        return hemoglobina;
    }

    public void setHemoglobina(BigDecimal hemoglobina) {
        this.hemoglobina = hemoglobina;
    }

    public String getSala() {
        return sala;
    }

    public void setSala(String sala) {
        this.sala = sala;
    }

    public String getResponsavel() {
        return responsavel;
    }

    public void setResponsavel(String responsavel) {
        this.responsavel = responsavel;
    }

    public String getIntercorrencia() {
        return intercorrencia;
    }

    public void setIntercorrencia(String intercorrencia) {
        this.intercorrencia = intercorrencia;
    }

    public StatusDoacao getStatus() {
        return status;
    }

    public void setStatus(StatusDoacao status) {
        this.status = status;
    }
}
