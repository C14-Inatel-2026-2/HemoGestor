package br.inatel.dto;

import br.inatel.enumeracao.TipoDoacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class DoacaoRequestDTO {
    @NotNull(message = "Doador não pode ser vazio.")
    private Long doadorId;
    @NotNull(message = "Data de coleta não pode ser vazia.")
    private LocalDate dataColeta;
    @NotNull(message = "Hora de coleta não pode ser vazia.")
    private LocalTime horaColeta;
    @NotNull(message = "Volume coletado não pode ser vazio.")
    @Positive(message = "Volume coletado deve ser maior que zero.")
    private Integer volume_ml;
    @NotNull(message = "Tipo de doação não pode ser vazio.")
    private TipoDoacao tipoDoacao;
    private String pressaoArterial;
    @NotNull(message = "Hemoglobina não pode ser vazia.")
    @Positive(message = "Hemoglobina deve ser maior que zero.")
    private BigDecimal hemoglobina;
    private String sala;
    @NotBlank(message = "Responsável não pode ser vazio.")
    private String responsavel;
    private String intercorrencia;

    public Long getDoadorId() {
        return doadorId;
    }

    public void setDoadorId(Long doadorId) {
        this.doadorId = doadorId;
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
}
