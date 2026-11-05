package br.inatel.service;

import br.inatel.dto.SolicitacaoRequestDTO;
import br.inatel.dto.SolicitacaoResponseDTO;
import br.inatel.enumeracao.PrioridadeSolicitacao;
import br.inatel.enumeracao.StatusSolicitacao;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.model.Solicitacao;
import br.inatel.repository.SolicitacaoRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class SolicitacaoServiceTest {
    @Test
    void cadastrarSolicitacao(){
        SolicitacaoRepository repository = mock(SolicitacaoRepository.class);
        SolicitacaoService service = new SolicitacaoService(repository);

        SolicitacaoRequestDTO dto = new SolicitacaoRequestDTO();
        dto.setInstituicao("Hospital Santa Casa");
        dto.setSetor("UTI");
        dto.setTipoSanguineo("A+");
        dto.setQuantidade(2);
        dto.setPrioridade(PrioridadeSolicitacao.URGENTE);
        dto.setJustificativa("Paciente em procedimento cirúrgico.");

        when(repository.save(any(Solicitacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitacaoResponseDTO resultado = service.salvar(dto);

        assertEquals("Hospital Santa Casa", resultado.getInstituicao());
        assertEquals("UTI", resultado.getSetor());
        assertEquals("A+", resultado.getTipoSanguineo());
        assertEquals(2, resultado.getQuantidade());
        assertEquals(PrioridadeSolicitacao.URGENTE, resultado.getPrioridade());
        assertEquals(StatusSolicitacao.PENDENTE, resultado.getStatus());
        assertNotNull(resultado.getDataSolicitacao());
        assertTrue(resultado.getBolsasReservadas().isEmpty());

        verify(repository).save(any(Solicitacao.class));
    }

    @Test
    void naoCadastrarSolicitacaoComQuantidadeInvalida() {
        SolicitacaoRepository repository = mock(SolicitacaoRepository.class);
        SolicitacaoService service = new SolicitacaoService(repository);

        SolicitacaoRequestDTO dto = new SolicitacaoRequestDTO();
        dto.setInstituicao("Hospital Santa Casa");
        dto.setSetor("UTI");
        dto.setTipoSanguineo("A+");
        dto.setQuantidade(0);
        dto.setPrioridade(PrioridadeSolicitacao.URGENTE);
        dto.setJustificativa("Paciente em procedimento cirúrgico.");

        DadosInvalidosException exception = assertThrows(DadosInvalidosException.class, () -> service.salvar(dto));

        assertEquals("Quantidade deve ser maior que zero.", exception.getMessage());
        verify(repository, never()).save(any(Solicitacao.class));
    }

}
