package br.inatel.dto;

import br.inatel.enumeracao.SituacaoBolsa;

import java.time.LocalDate;

public class BolsaSangueResponseDTO {
    private Long id;
    private Long doacaoId;
    private String tipoSanguineo;
    private LocalDate dataColeta;
    private LocalDate dataValidade;
    private SituacaoBolsa situacao;
    private boolean vencida;

    public BolsaSangueResponseDTO(Long id, Long doacaoId, String tipoSanguineo, LocalDate dataColeta, LocalDate dataValidade, SituacaoBolsa situacao, boolean vencida) {
        this.id = id;
        this.doacaoId = doacaoId;
        this.tipoSanguineo = tipoSanguineo;
        this.dataColeta = dataColeta;
        this.dataValidade = dataValidade;
        this.situacao = situacao;
        this.vencida = vencida;
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

    public SituacaoBolsa getSituacao() {
        return situacao;
    }

    public boolean isVencida() {
        return vencida;
    }
}
