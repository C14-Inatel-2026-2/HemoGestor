package br.inatel.dto;

import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.enumeracao.TipoDoacao;

import java.time.LocalDate;

public class BolsaSangueResponseDTO {
    private Long id;
    private Long doacaoId;
    private String tipoSanguineo;
    private LocalDate dataColeta;
    private LocalDate dataValidade;
    private SituacaoBolsa status;
    private boolean vencida;
    private Long doadorId;
    private String nomeDoador;
    private TipoDoacao tipoDoacao;
    private Integer volume_ml;

    public BolsaSangueResponseDTO(Long id, Long doacaoId, String tipoSanguineo, LocalDate dataColeta, LocalDate dataValidade, SituacaoBolsa status, boolean vencida, Long doadorId, String nomeDoador, TipoDoacao tipoDoacao, Integer volume_ml) {
        this.id = id;
        this.doacaoId = doacaoId;
        this.tipoSanguineo = tipoSanguineo;
        this.dataColeta = dataColeta;
        this.dataValidade = dataValidade;
        this.status = status;
        this.vencida = vencida;
        this.doadorId = doadorId;
        this.nomeDoador = nomeDoador;
        this.tipoDoacao = tipoDoacao;
        this.volume_ml = volume_ml;
    }

    public Long getId() {
        return id;
    }

    public Long getDoacaoId() {
        return doacaoId;
    }

    public String getTipoSanguineo() {
        return tipoSanguineo;
    }

    public LocalDate getDataColeta() {
        return dataColeta;
    }

    public LocalDate getDataValidade() {
        return dataValidade;
    }

    public SituacaoBolsa getStatus() {
        return status;
    }

    public boolean isVencida() {
        return vencida;
    }

    public Long getDoadorId() {
        return doadorId;
    }

    public String getNomeDoador() {
        return nomeDoador;
    }

    public TipoDoacao getTipoDoacao() {
        return tipoDoacao;
    }

    public Integer getVolume_ml() {
        return volume_ml;
    }
}
