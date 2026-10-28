package br.inatel.model;
import br.inatel.enumeracao.StatusDoacao;
import br.inatel.enumeracao.TipoDoacao;
import br.inatel.exception.DadosInvalidosException;
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
        validarDoador(doador);
        validarDataColeta(dataColeta);
        validarHoraColeta(horaColeta);
        validarVolume(volume_ml);
        validarTipoDoacao(tipoDoacao);
        validarHemoglobina(hemoglobina);
        validarResponsavel(responsavel);
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

    private void validarDoador(Doador doador){
        if(doador == null){
            throw new DadosInvalidosException("Doador não pode ser vazio.");
        }
    }

    private void validarDataColeta(LocalDate dataColeta){
        if(dataColeta == null){
            throw new DadosInvalidosException("Data de coleta não pode ser vazia.");
        }

        if(dataColeta.isAfter(LocalDate.now())){
            throw new DadosInvalidosException("Data de coleta não pode ser futura.");
        }
    }

    private void validarHoraColeta(LocalTime horaColeta){
        if(horaColeta == null){
            throw new DadosInvalidosException("Hora de coleta não pode ser vazia.");
        }

        if(horaColeta.isAfter(LocalTime.now())){
            throw new DadosInvalidosException("Hora de coleta não pode ser futura.");
        }
    }

    private void validarVolume(int volume_ml){
        if(volume_ml<=0){
            throw new DadosInvalidosException("Volume coletado deve ser maior que zero.");
        }
    }

    private void validarTipoDoacao(TipoDoacao tipoDoacao){
        if(tipoDoacao == null){
            throw new DadosInvalidosException("Tipo de doação não pode ser vazio.");
        }
    }

    private void validarHemoglobina(BigDecimal hemoglobina) {
        if (hemoglobina == null) {
            throw new DadosInvalidosException("Hemoglobina não pode ser vazia.");
        }

        if (hemoglobina.compareTo(BigDecimal.ZERO) <= 0) {
            throw new DadosInvalidosException("Hemoglobina deve ser maior que zero.");
        }
    }

    private void validarResponsavel(String responsavel) {
        if (responsavel == null || responsavel.isBlank()) {
            throw new DadosInvalidosException("Responsável não pode ser vazio.");
        }
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

}
