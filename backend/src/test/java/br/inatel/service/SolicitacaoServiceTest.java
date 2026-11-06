package br.inatel.service;

import br.inatel.dto.SolicitacaoRequestDTO;
import br.inatel.dto.SolicitacaoResponseDTO;
import br.inatel.enumeracao.PrioridadeSolicitacao;
import br.inatel.enumeracao.StatusSolicitacao;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.exception.SolicitacaoNaoEncontradaException;
import br.inatel.model.Solicitacao;
import br.inatel.repository.SolicitacaoRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    @Test
    void buscarSolicitacaoPorId() {
        SolicitacaoRepository repository = mock(SolicitacaoRepository.class);
        SolicitacaoService service = new SolicitacaoService(repository);

        Solicitacao solicitacao = new Solicitacao("Hospital Santa Casa", "UTI", "A+", 2, PrioridadeSolicitacao.URGENTE, "Paciente em procedimento cirúrgico.");

        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));

        SolicitacaoResponseDTO resultado = service.buscarPorId(1L);

        assertEquals("Hospital Santa Casa", resultado.getInstituicao());
        assertEquals("A+", resultado.getTipoSanguineo());
        assertEquals(StatusSolicitacao.PENDENTE, resultado.getStatus());
        verify(repository).findById(1L);
    }

    @Test
    void naoBuscarSolicitacaoInexistente() {
        SolicitacaoRepository repository = mock(SolicitacaoRepository.class);
        SolicitacaoService service = new SolicitacaoService(repository);

        when(repository.findById(99L)).thenReturn(Optional.empty());

        SolicitacaoNaoEncontradaException exception = assertThrows(SolicitacaoNaoEncontradaException.class, () -> service.buscarPorId(99L));

        assertEquals("Solicitação não encontrada.", exception.getMessage());
        verify(repository).findById(99L);
    }

    @Test
    void listarSolicitacoesEmOrdemPorPrioridade() {
        SolicitacaoRepository repository = mock(SolicitacaoRepository.class);
        SolicitacaoService service = new SolicitacaoService(repository);

        Solicitacao normal = new Solicitacao("Hospital A", "UTI", "A+", 1, PrioridadeSolicitacao.NORMAL, "Caso normal");
        Solicitacao urgente = new Solicitacao("Hospital B", "UTI", "O+", 1, PrioridadeSolicitacao.URGENTE, "Caso urgente");
        Solicitacao emergencia = new Solicitacao("Hospital C", "UTI", "O-", 1, PrioridadeSolicitacao.EMERGENCIA, "Caso de emergência");

        when(repository.findAll()).thenReturn(List.of(normal, urgente, emergencia));

        List<SolicitacaoResponseDTO> resultado = service.listarTodas();

        assertEquals(PrioridadeSolicitacao.EMERGENCIA, resultado.get(0).getPrioridade());
        assertEquals(PrioridadeSolicitacao.URGENTE, resultado.get(1).getPrioridade());
        assertEquals(PrioridadeSolicitacao.NORMAL, resultado.get(2).getPrioridade());
    }

    @Test
    void listarSolicitacoesDaMesmaPrioridadePorDataMaisAntiga() {
        SolicitacaoRepository repository = mock(SolicitacaoRepository.class);
        SolicitacaoService service = new SolicitacaoService(repository);

        Solicitacao maisRecente = new Solicitacao("Hospital A", "UTI", "A+", 1, PrioridadeSolicitacao.URGENTE, "Solicitação mais recente");
        maisRecente.setDataSolicitacao(LocalDateTime.of(2026, 11, 5, 14, 0));

        Solicitacao maisAntiga = new Solicitacao("Hospital B", "UTI", "O+", 1, PrioridadeSolicitacao.URGENTE, "Solicitação mais antiga");
        maisAntiga.setDataSolicitacao(LocalDateTime.of(2026, 11, 5, 10, 0));

        when(repository.findAll()).thenReturn(List.of(maisRecente, maisAntiga));

        List<SolicitacaoResponseDTO> resultado = service.listarTodas();

        assertEquals("Hospital B", resultado.get(0).getInstituicao());
        assertEquals("Hospital A", resultado.get(1).getInstituicao());
    }
}
