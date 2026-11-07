package br.inatel.service;

import br.inatel.dto.SolicitacaoRequestDTO;
import br.inatel.dto.SolicitacaoResponseDTO;
import br.inatel.enumeracao.PrioridadeSolicitacao;
import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.enumeracao.StatusSolicitacao;
import br.inatel.enumeracao.TipoDoacao;
import br.inatel.exception.ConflitoException;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.exception.SolicitacaoNaoEncontradaException;
import br.inatel.model.BolsaSangue;
import br.inatel.model.Doacao;
import br.inatel.model.Solicitacao;
import br.inatel.repository.BolsaSangueRepository;
import br.inatel.repository.SolicitacaoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class SolicitacaoServiceTest {

    private SolicitacaoRepository repository;
    private BolsaSangueRepository bolsaSangueRepository;
    private SolicitacaoService service;

    @BeforeEach
    void setUp() {
        repository = mock(SolicitacaoRepository.class);
        bolsaSangueRepository = mock(BolsaSangueRepository.class);
        service = new SolicitacaoService(repository, bolsaSangueRepository);
    }

    private BolsaSangue criarBolsa(String tipoSanguineo, SituacaoBolsa situacao, TipoDoacao tipoDoacao, LocalDate dataValidade) {
        Doacao doacao = new Doacao();
        doacao.setTipoDoacao(tipoDoacao);

        BolsaSangue bolsa = new BolsaSangue(doacao, tipoSanguineo, LocalDate.now(), situacao);
        bolsa.setDataValidade(dataValidade);
        return bolsa;
    }

    @Test
    void cadastrarSolicitacao(){
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
        when(repository.findAll()).thenReturn(List.of());

        List<SolicitacaoResponseDTO> resultado = service.listarTodas();
        assertTrue(resultado.isEmpty());
        verify(repository).findAll();
    }

    @Test
    void buscarSolicitacaoPorId() {
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
        when(repository.findById(99L)).thenReturn(Optional.empty());

        SolicitacaoNaoEncontradaException exception = assertThrows(SolicitacaoNaoEncontradaException.class, () -> service.buscarPorId(99L));

        assertEquals("Solicitação não encontrada.", exception.getMessage());
        verify(repository).findById(99L);
    }

    @Test
    void listarSolicitacoesEmOrdemPorPrioridade() {
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
        Solicitacao maisRecente = new Solicitacao("Hospital A", "UTI", "A+", 1, PrioridadeSolicitacao.URGENTE, "Solicitação mais recente");
        maisRecente.setDataSolicitacao(LocalDateTime.of(2026, 11, 5, 14, 0));

        Solicitacao maisAntiga = new Solicitacao("Hospital B", "UTI", "O+", 1, PrioridadeSolicitacao.URGENTE, "Solicitação mais antiga");
        maisAntiga.setDataSolicitacao(LocalDateTime.of(2026, 11, 5, 10, 0));

        when(repository.findAll()).thenReturn(List.of(maisRecente, maisAntiga));

        List<SolicitacaoResponseDTO> resultado = service.listarTodas();

        assertEquals("Hospital B", resultado.get(0).getInstituicao());
        assertEquals("Hospital A", resultado.get(1).getInstituicao());
    }

    @Test
    void buscarBolsasCompativeisDisponiveisValidasESangueTotal() {
       Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                2,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );

        BolsaSangue compativel = criarBolsa("A+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        BolsaSangue incompatível = criarBolsa("B+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        BolsaSangue reservada = criarBolsa("A+", SituacaoBolsa.RESERVADA, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        BolsaSangue vencida = criarBolsa("A+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().minusDays(1));
        BolsaSangue plasma = criarBolsa("A+", SituacaoBolsa.DISPONIVEL, TipoDoacao.PLASMA, LocalDate.now().plusDays(10));

        when(bolsaSangueRepository.findAll()).thenReturn(List.of(compativel, incompatível, reservada, vencida, plasma));

        int resultado = service.contarBolsasCompativeis(solicitacao);
        assertEquals(1, resultado);
    }

    @Test
    void listarBolsasCompativeisPriorizaMesmoTipoEValidade() {
        Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                3,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );

        BolsaSangue mesmoTipoMaisTarde = criarBolsa("A+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(20));
        mesmoTipoMaisTarde.setId(1L);
        BolsaSangue compativelOutroTipo = criarBolsa("O+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(5));
        compativelOutroTipo.setId(2L);
        BolsaSangue mesmoTipoMaisCedo = criarBolsa("A+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        mesmoTipoMaisCedo.setId(3L);

        when(bolsaSangueRepository.findAll()).thenReturn(List.of(
                        compativelOutroTipo,
                        mesmoTipoMaisTarde,
                        mesmoTipoMaisCedo));
        List<Long> resultado = service.listarIdsBolsasCompativeis(solicitacao);

        assertEquals(List.of(3L, 1L, 2L), resultado);
    }

    @Test
    void retornarQuantidadeDeBolsasCompativeisDisponiveis() {
        Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                2,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );

        BolsaSangue bolsaA = criarBolsa("A+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        BolsaSangue bolsaO = criarBolsa("O+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(15));
        BolsaSangue bolsaIncompativel = criarBolsa("B+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(20));

        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        when(bolsaSangueRepository.findAll()).thenReturn(List.of(
                        bolsaA,
                        bolsaO,
                        bolsaIncompativel));

        SolicitacaoResponseDTO resultado = service.buscarPorId(1L);
        assertEquals(2, resultado.getBolsasCompativeisDisponiveis());
    }

    @Test
    void atenderSolicitacaoComBolsasCompativeisSuficientes() {
        Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                2,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );

        BolsaSangue bolsa1 = criarBolsa("A+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        bolsa1.setId(1L);
        BolsaSangue bolsa2 = criarBolsa("O+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(15));
        bolsa2.setId(2L);

        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        when(bolsaSangueRepository.findAll()).thenReturn(List.of(bolsa1, bolsa2));
        when(repository.save(any(Solicitacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitacaoResponseDTO resultado = service.atender(1L);

        assertEquals(StatusSolicitacao.EM_ATENDIMENTO, resultado.getStatus());
        assertEquals(2, resultado.getBolsasReservadas().size());
        assertEquals(SituacaoBolsa.RESERVADA, bolsa1.getSituacao());
        assertEquals(SituacaoBolsa.RESERVADA, bolsa2.getSituacao());
        verify(bolsaSangueRepository).saveAll(anyList());
        verify(repository).save(solicitacao);
    }

    @Test
    void naoAtenderSolicitacaoSemBolsasCompativeisSuficientes() {
        Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                2,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );

        BolsaSangue unicaBolsa = criarBolsa("A+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        unicaBolsa.setId(1L);

        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        when(bolsaSangueRepository.findAll()).thenReturn(List.of(unicaBolsa));

        ConflitoException exception = assertThrows(ConflitoException.class, () -> service.atender(1L));

        assertEquals("Não há bolsas compatíveis suficientes para atender a solicitação.", exception.getMessage());
        assertEquals(StatusSolicitacao.PENDENTE, solicitacao.getStatus());
        assertEquals(SituacaoBolsa.DISPONIVEL, unicaBolsa.getSituacao());
        verify(repository, never()).save(any(Solicitacao.class));
        verify(bolsaSangueRepository, never()).saveAll(anyList());
    }

    @Test
    void naoAtenderSolicitacaoQueNaoEstaPendente() {
        Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                1,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );
        solicitacao.setStatus(StatusSolicitacao.EM_ATENDIMENTO);

        BolsaSangue bolsa = criarBolsa("A+", SituacaoBolsa.DISPONIVEL, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        bolsa.setId(1L);

        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        when(bolsaSangueRepository.findAll()).thenReturn(List.of(bolsa));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> service.atender(1L));

        assertEquals("Só é possível atender solicitações pendentes.", exception.getMessage());
        assertEquals(SituacaoBolsa.DISPONIVEL, bolsa.getSituacao());
        verify(repository, never()).save(any(Solicitacao.class));
        verify(bolsaSangueRepository, never()).saveAll(anyList());
    }

    @Test
    void concluirSolicitacaoEmAtendimento() {
        Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                2,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );

        BolsaSangue bolsa1 = criarBolsa("A+", SituacaoBolsa.RESERVADA, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        bolsa1.setId(1L);
        BolsaSangue bolsa2 = criarBolsa("O+", SituacaoBolsa.RESERVADA, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(15));
        bolsa2.setId(2L);

        solicitacao.setBolsasReservadas(List.of(bolsa1, bolsa2));
        solicitacao.setStatus(StatusSolicitacao.EM_ATENDIMENTO);

        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        when(repository.save(any(Solicitacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitacaoResponseDTO resultado = service.concluir(1L);

        assertEquals(StatusSolicitacao.ATENDIDA, resultado.getStatus());
        assertEquals(SituacaoBolsa.UTILIZADA, bolsa1.getSituacao());
        assertEquals(SituacaoBolsa.UTILIZADA, bolsa2.getSituacao());
        verify(bolsaSangueRepository).saveAll(solicitacao.getBolsasReservadas());
        verify(repository).save(solicitacao);
    }

    @Test
    void naoConcluirSolicitacaoQueNaoEstaEmAtendimento() {
        Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                1,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );

        BolsaSangue bolsa = criarBolsa("A+", SituacaoBolsa.RESERVADA, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        bolsa.setId(1L);
        solicitacao.setBolsasReservadas(List.of(bolsa));

        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> service.concluir(1L));

        assertEquals("Só é possível concluir solicitações em atendimento.", exception.getMessage());
        assertEquals(StatusSolicitacao.PENDENTE, solicitacao.getStatus());
        assertEquals(SituacaoBolsa.RESERVADA, bolsa.getSituacao());
        verify(repository, never()).save(any(Solicitacao.class));
        verify(bolsaSangueRepository, never()).saveAll(anyList());
    }

    @Test
    void cancelarSolicitacaoPendente() {
        Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                1,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );

        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        when(repository.save(any(Solicitacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitacaoResponseDTO resultado = service.cancelar(1L);

        assertEquals(StatusSolicitacao.CANCELADA, resultado.getStatus());
        verify(repository).save(solicitacao);
    }

    @Test
    void cancelarSolicitacaoEmAtendimentoELiberarBolsas() {
        Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                2,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );

        BolsaSangue bolsa1 = criarBolsa("A+", SituacaoBolsa.RESERVADA, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(10));
        bolsa1.setId(1L);
        BolsaSangue bolsa2 = criarBolsa("O+", SituacaoBolsa.RESERVADA, TipoDoacao.SANGUE_TOTAL, LocalDate.now().plusDays(15));
        bolsa2.setId(2L);

        solicitacao.setStatus(StatusSolicitacao.EM_ATENDIMENTO);
        solicitacao.setBolsasReservadas(List.of(bolsa1, bolsa2));

        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        when(repository.save(any(Solicitacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitacaoResponseDTO resultado = service.cancelar(1L);

        assertEquals(StatusSolicitacao.CANCELADA, resultado.getStatus());
        assertEquals(SituacaoBolsa.DISPONIVEL, bolsa1.getSituacao());
        assertEquals(SituacaoBolsa.DISPONIVEL, bolsa2.getSituacao());
        verify(bolsaSangueRepository).saveAll(solicitacao.getBolsasReservadas());
        verify(repository).save(solicitacao);
    }

    @Test
    void naoCancelarSolicitacaoAtendida() {
        Solicitacao solicitacao = new Solicitacao(
                "Hospital Santa Casa",
                "UTI",
                "A+",
                1,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico."
        );

        solicitacao.setStatus(StatusSolicitacao.ATENDIDA);
        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> service.cancelar(1L));

        assertEquals("Só é possível cancelar solicitações pendentes ou em atendimento.", exception.getMessage());
        assertEquals(StatusSolicitacao.ATENDIDA, solicitacao.getStatus());
        verify(repository, never()).save(any(Solicitacao.class));
        verify(bolsaSangueRepository, never()).saveAll(anyList());
    }
}
