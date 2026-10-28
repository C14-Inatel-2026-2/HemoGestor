package br.inatel.dto;

import br.inatel.enumeracao.TipoDoacao;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class DoacaoRequestDTO {
    private Long doadorId;
    private LocalDate dataColeta;
    private LocalTime horaColeta;
    private int volume_ml;
    private TipoDoacao tipoDoacao;
    private String pressaoArterial;
    private BigDecimal hemoglobina;
    private String sala;
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
