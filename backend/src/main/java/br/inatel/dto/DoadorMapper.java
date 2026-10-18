package br.inatel.dto;

import br.inatel.model.Doador;

public class DoadorMapper {
    public static Doador toEntity(DoadorRequestDTO dto) {
        return new Doador(
                null,
                dto.getNome(),
                dto.getCpf(),
                dto.getData_nascimento(),
                dto.getSexo(),
                dto.getTipo_sanguineo(),
                dto.getEmail(),
                dto.getTelefone(),
                dto.getCidade(),
                dto.getBairro(),
                dto.getUltima_doacao(),
                dto.getQtd_doacoes(),
                dto.getObservacoes()
        );
    }

    public static DoadorResponseDTO toResponseDTO(Doador doador) {
        DoadorResponseDTO dto = new DoadorResponseDTO();

        dto.setId(doador.getId());
        dto.setNome(doador.getNome());
        dto.setCpf(doador.getCpf());
        dto.setData_nascimento(doador.getData_nascimento());
        dto.setSexo(doador.getSexo());
        dto.setTipo_sanguineo(doador.getTipo_sanguineo());
        dto.setEmail(doador.getEmail());
        dto.setTelefone(doador.getTelefone());
        dto.setCidade(doador.getCidade());
        dto.setBairro(doador.getBairro());
        dto.setUltima_doacao(doador.getUltima_doacao());
        dto.setStatus(doador.getStatus());
        dto.setQtd_doacoes(doador.getQtd_doacoes());
        dto.setObservacoes(doador.getObservacoes());

        return dto;
    }
}
