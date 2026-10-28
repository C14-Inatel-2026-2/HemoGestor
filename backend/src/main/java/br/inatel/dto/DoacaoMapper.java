package br.inatel.dto;

import br.inatel.model.Doacao;
import br.inatel.model.Doador;

public class DoacaoMapper {
    public static Doacao toEntity(DoacaoRequestDTO dto, Doador doador) {

        return new Doacao(
                null,
                doador,
                dto.getDataColeta(),
                dto.getHoraColeta(),
                dto.getVolume_ml(),
                dto.getTipoDoacao(),
                dto.getPressaoArterial(),
                dto.getHemoglobina(),
                dto.getSala(),
                dto.getResponsavel(),
                dto.getIntercorrencia()
        );
    }

    public static DoacaoResponseDTO toResponseDTO(Doacao doacao) {

        DoacaoResponseDTO dto = new DoacaoResponseDTO();

        dto.setId(doacao.getId());
        dto.setDoadorId(doacao.getDoador().getId());
        dto.setNomeDoador(doacao.getDoador().getNome());
        dto.setTipoSanguineo(doacao.getDoador().getTipo_sanguineo());

        dto.setDataColeta(doacao.getDataColeta());
        dto.setHoraColeta(doacao.getHoraColeta());
        dto.setVolume_ml(doacao.getVolume_ml());
        dto.setTipoDoacao(doacao.getTipoDoacao());
        dto.setPressaoArterial(doacao.getPressaoArterial());
        dto.setHemoglobina(doacao.getHemoglobina());
        dto.setSala(doacao.getSala());
        dto.setResponsavel(doacao.getResponsavel());
        dto.setIntercorrencia(doacao.getIntercorrencia());
        dto.setStatus(doacao.getStatus());

        return dto;
    }
}
