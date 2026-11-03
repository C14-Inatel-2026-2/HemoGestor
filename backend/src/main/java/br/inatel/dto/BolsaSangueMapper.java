package br.inatel.dto;

import br.inatel.model.BolsaSangue;

public class BolsaSangueMapper {
    public static BolsaSangueResponseDTO toResponseDTO(BolsaSangue bolsa) {
        return new BolsaSangueResponseDTO(
                bolsa.getId(),
                bolsa.getDoacao().getId(),
                bolsa.getTipoSanguineo(),
                bolsa.getDataColeta(),
                bolsa.getDataValidade(),
                bolsa.getSituacao(),
                bolsa.estaVencida()
        );
    }
}
