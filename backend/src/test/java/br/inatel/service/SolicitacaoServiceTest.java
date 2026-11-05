package br.inatel.service;

import br.inatel.dto.SolicitacaoRequestDTO;
import br.inatel.dto.SolicitacaoResponseDTO;
import br.inatel.enumeracao.PrioridadeSolicitacao;
import br.inatel.enumeracao.StatusSolicitacao;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.model.Solicitacao;
import br.inatel.repository.SolicitacaoRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

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

    @Test
    void listarTodasSolicitacoes() {
        SolicitacaoRepository repository = mock(SolicitacaoRepository.class);
        SolicitacaoService service = new SolicitacaoService(repository);
        Solicitacao solicitacao = new Solicitacao("Hospital Santa Casa", "UTI", "A+", 2, PrioridadeSolicitacao.URGENTE, "Paciente em procedimento cirúrgico.");

        when(repository.findAll()).thenReturn(List.of(solicitacao));

        List<SolicitacaoResponseDTO> resultado = service.listarTodas();

        assertEquals(1, resultado.size());
        assertEquals("Hospital Santa Casa", resultado.get(0).getInstituicao());
        assertEquals("A+", resultado.get(0).getTipoSanguineo());
        assertEquals(StatusSolicitacao.PENDENTE, resultado.get(0).getStatus());
        verify(repository).findAll();
    }

    @Test
    void retornarListaVaziaQuandoNaoExistiremSolicitacoes() {
        SolicitacaoRepository repository = mock(SolicitacaoRepository.class);
        SolicitacaoService service = new SolicitacaoService(repository);

        when(repository.findAll()).thenReturn(List.of());

        List<SolicitacaoResponseDTO> resultado = service.listarTodas();
        assertTrue(resultado.isEmpty());
        verify(repository).findAll();
    }
}
