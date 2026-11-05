package br.inatel.service;

import br.inatel.enumeracao.*;
import br.inatel.exception.ConflitoException;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.model.BolsaSangue;
import br.inatel.model.Doacao;
import br.inatel.model.Doador;
import br.inatel.repository.BolsaSangueRepository;
import br.inatel.repository.DoacaoRepository;
import br.inatel.repository.DoadorRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class DoacaoServiceTest {
    private Doador criarDoador(){
        return new Doador(
                1L,
                "Clara Maria de Castro",
                "123.456.789-00",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "O+",
                "claramcastro@gmail.com",
                "(35)98989-7766",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );
    }

    private Doacao criarDoacao() {
        return new Doacao(
                1L,
                criarDoador(),
                LocalDate.now(),
                LocalTime.now().minusMinutes(10),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "120/80",
                new BigDecimal("14.2"),
                "Sala 1",
                "Mariana Rocha",
                "Nenhuma"
        );
    }

    @Test
    void salvarDoacao(){
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);

        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);
        Doacao doacao = criarDoacao();
        when(repository.save(doacao)).thenReturn(doacao);

        Doacao resultado = service.salvar(doacao);
        assertEquals(doacao, resultado);
        verify(repository).save(doacao);
    }

    @Test
    void naoSalvarDoacaoAntesDoIntervaloMinimo() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);

        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doador doador = criarDoador();
        doador.setUltima_doacao(LocalDate.now().minusDays(30));

        Doacao novaDoacao = new Doacao(
                1L,
                doador,
                LocalDate.now(),
                LocalTime.now().minusMinutes(10),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "120/80",
                new BigDecimal("14.2"),
                "Sala 1",
                "Mariana Rocha",
                "Nenhuma"
        );

        when(repository.findByDoadorIdAndStatusNot(doador.getId(), StatusDoacao.DESCARTADA)).thenReturn(List.of());
        DadosInvalidosException exception = assertThrows(
                DadosInvalidosException.class, () -> service.salvar(novaDoacao)
        );

        assertTrue(exception.getMessage().contains("só poderá doar novamente a partir de"));
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void naoSalvarDoacaoQuandoAtingirLimiteAnual() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);

        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doador doador = criarDoador();
        Doacao doacao1 = new Doacao(
                1L,
                doador,
                LocalDate.now().minusMonths(10),
                LocalTime.of(10, 0),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "120/80",
                new BigDecimal("14.0"),
                "Sala 1",
                "Mariana Rocha",
                "Nenhuma"
        );
        Doacao doacao2 = new Doacao(
                2L,
                doador,
                LocalDate.now().minusMonths(7),
                LocalTime.of(10, 0),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "120/80",
                new BigDecimal("14.0"),
                "Sala 1",
                "Mariana Rocha",
                "Nenhuma"
        );
        Doacao doacao3 = new Doacao(
                3L,
                doador,
                LocalDate.now().minusMonths(4),
                LocalTime.of(10, 0),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "120/80",
                new BigDecimal("14.0"),
                "Sala 1",
                "Mariana Rocha",
                "Nenhuma"
        );
        Doacao novaDoacao = new Doacao(
                4L,
                doador,
                LocalDate.now(),
                LocalTime.now().minusMinutes(10),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "120/80",
                new BigDecimal("14.2"),
                "Sala 1",
                "Mariana Rocha",
                "Nenhuma"
        );

        when(repository.findByDoadorIdAndStatusNot(doador.getId(), StatusDoacao.DESCARTADA)).thenReturn(List.of(doacao1, doacao2, doacao3));
        DadosInvalidosException exception = assertThrows(
                DadosInvalidosException.class,
                () -> service.salvar(novaDoacao)
        );
        assertEquals(
                "Clara Maria de Castro atingiu o limite de 3 doações nos últimos 12 meses.", exception.getMessage());
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void salvarDoacaoQuandoRespeitarIntervaloELimiteAnual() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);

        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doador doador = criarDoador();
        Doacao doacaoAnterior = new Doacao(
                1L,
                doador,
                LocalDate.now().minusMonths(4),
                LocalTime.of(10, 0),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "120/80",
                new BigDecimal("14.0"),
                "Sala 1",
                "Mariana Rocha",
                "Nenhuma"
        );
        Doacao novaDoacao = new Doacao(
                2L,
                doador,
                LocalDate.now(),
                LocalTime.now().minusMinutes(10),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "120/80",
                new BigDecimal("14.2"),
                "Sala 1",
                "Mariana Rocha",
                "Nenhuma"
        );

        when(repository.findByDoadorIdAndStatusNot(doador.getId(), StatusDoacao.DESCARTADA)).thenReturn(List.of(doacaoAnterior));
        when(repository.save(novaDoacao)).thenReturn(novaDoacao);

        Doacao resultado = service.salvar(novaDoacao);
        assertEquals(novaDoacao, resultado);
        verify(repository).save(novaDoacao);
    }

    @Test
    void buscarDoacaoPorId() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);

        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doacao doacao = criarDoacao();
        when(repository.findById(1L)).thenReturn(Optional.of(doacao));

        Optional<Doacao> resultado = service.buscarPorID(1L);

        assertTrue(resultado.isPresent());
        assertEquals(doacao, resultado.get());
        verify(repository).findById(1L);
    }

    @Test
    void deveListarTodasAsDoacoes() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);

        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);
        Doacao doacao = criarDoacao();
        when(repository.findAll()).thenReturn(List.of(doacao));

        List<Doacao> resultado = service.listarTodas();

        assertEquals(1, resultado.size());
        assertEquals(doacao, resultado.get(0));
        verify(repository).findAll();
    }

    @Test
    void concluirDoacao() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doacao doacao = criarDoacao();

        when(repository.findById(1L)).thenReturn(Optional.of(doacao));
        when(repository.save(doacao)).thenReturn(doacao);

        Optional<Doacao> resultado = service.concluir(1L);

        assertTrue(resultado.isPresent());
        assertEquals(StatusDoacao.CONCLUIDA, resultado.get().getStatus());

        Doador doadorAtualizado = resultado.get().getDoador();

        assertEquals(doacao.getDataColeta(), doadorAtualizado.getUltima_doacao());
        assertEquals(1, doadorAtualizado.getQtd_doacoes());
        assertEquals(StatusDoador.AGUARDANDO, doadorAtualizado.getStatus());

        verify(repository).findById(1L);
        verify(repository).save(doacao);
    }

    @Test
    void naoConcluirDoacaoSemTipoSanguineo() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doador doador = criarDoador();
        doador.setTipo_sanguineo(null);

        Doacao doacao = criarDoacao();
        doacao.setDoador(doador);

        when(repository.findById(1L)).thenReturn(Optional.of(doacao));

        DadosInvalidosException exception = assertThrows(DadosInvalidosException.class, () -> service.concluir(1L));

        assertEquals("Informe o tipo sanguíneo do doador antes de concluir a doação.", exception.getMessage());
        verify(repository).findById(1L);
        verify(repository, never()).save(any(Doacao.class));
        verify(bolsaSangueRepository, never()).save(any(BolsaSangue.class));
    }
    @Test
    void naoConcluirDoacaoConcluida(){
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doacao doacao = criarDoacao();
        doacao.concluirDoacao();

        when(repository.findById(1L)).thenReturn(Optional.of(doacao));

        ConflitoException exception = assertThrows(ConflitoException.class, () -> service.concluir(1L));
        assertEquals("Só é possível concluir doações em triagem.", exception.getMessage());
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void descartarDoacao() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doacao doacao = criarDoacao();

        when(repository.findById(1L)).thenReturn(Optional.of(doacao));
        when(repository.save(doacao)).thenReturn(doacao);

        Optional<Doacao> resultado = service.descartar(1L);

        assertTrue(resultado.isPresent());
        assertEquals(StatusDoacao.DESCARTADA, resultado.get().getStatus());
        verify(repository).findById(1L);
        verify(repository).save(doacao);
    }

    @Test
    void naoConcluirDoacaoInexistente() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        when(repository.findById(99L)).thenReturn(Optional.empty());

        Optional<Doacao> resultado = service.concluir(99L);

        assertTrue(resultado.isEmpty());
        verify(repository).findById(99L);
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void naoConcluirDoacaoDescartada(){
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doacao doacao = criarDoacao();
        doacao.descartarDoacao();
        when(repository.findById(1L)).thenReturn(Optional.of(doacao));

        ConflitoException exception = assertThrows(ConflitoException.class, () -> service.concluir(1L));

        assertEquals("Só é possível concluir doações em triagem.", exception.getMessage());
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void naoDescartarDoacaoConcluida(){
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doacao doacao = criarDoacao();
        doacao.concluirDoacao();
        when(repository.findById(1L)).thenReturn(Optional.of(doacao));

        ConflitoException exception = assertThrows(ConflitoException.class, () -> service.descartar(1L) );

        assertEquals("Só é possível descartar doações em triagem.", exception.getMessage());
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void naoDescartarDoacaoInexistente() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        when(repository.findById(99L)).thenReturn(Optional.empty());

        Optional<Doacao> resultado = service.descartar(99L);

        assertTrue(resultado.isEmpty());
        verify(repository).findById(99L);
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void buscarDoacoesPorDoador() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doacao doacao = criarDoacao();

        when(repository.findByDoadorId(1L)).thenReturn(List.of(doacao));

        List<Doacao> resultado = service.buscarPorDoador(1L);

        assertEquals(1, resultado.size());
        assertEquals(doacao, resultado.get(0));
        verify(repository).findByDoadorId(1L);
    }

    @Test
    void retornarListaVaziaDoadorNaoPossuiDoacoes(){
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        when(repository.findByDoadorId(1L)).thenReturn(List.of());

        List<Doacao> resultado = service.buscarPorDoador(1L);

        assertTrue(resultado.isEmpty());
        verify(repository).findByDoadorId(1L);
    }

    @Test
    void naoAtualizarUltimaDoacaoComDataMaisAntiga(){
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doacao doacao = criarDoacao();
        Doador doador = doacao.getDoador();

        LocalDate ultimaDoacaoAtual = LocalDate.now().minusDays(10);
        doador.setUltima_doacao(ultimaDoacaoAtual);

        LocalDate dataDoacaoAntiga = LocalDate.now().minusDays(30);
        doacao.setDataColeta(dataDoacaoAntiga);

        when(repository.findById(1L)).thenReturn(Optional.of(doacao));
        when(repository.save(doacao)).thenReturn(doacao);

        service.concluir(1L);

        assertEquals(ultimaDoacaoAtual, doador.getUltima_doacao());
        assertEquals(1, doador.getQtd_doacoes());
    }

    @Test
    void gerarBolsaAoConcluirDoacao(){
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doacao doacao = criarDoacao();

        when(repository.findById(1L)).thenReturn(Optional.of(doacao));
        when(repository.save(doacao)).thenReturn(doacao);

        service.concluir(1L);

        verify(bolsaSangueRepository).save(any(BolsaSangue.class));
    }

    @Test
    void gerarBolsaComDadosCorretosAoConcluirDoacao() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        BolsaSangueRepository bolsaSangueRepository = mock(BolsaSangueRepository.class);
        DoacaoService service = new DoacaoService(repository, bolsaSangueRepository);

        Doacao doacao = criarDoacao();

        when(repository.findById(1L)).thenReturn(Optional.of(doacao));
        when(repository.save(doacao)).thenReturn(doacao);

        service.concluir(1L);

        ArgumentCaptor<BolsaSangue> captor = ArgumentCaptor.forClass(BolsaSangue.class);

        verify(bolsaSangueRepository).save(captor.capture());

        BolsaSangue bolsaSalva = captor.getValue();

        assertEquals(doacao.getDoador().getTipo_sanguineo(), bolsaSalva.getTipoSanguineo());
        assertEquals(doacao.getDataColeta(), bolsaSalva.getDataColeta());
        assertEquals(SituacaoBolsa.DISPONIVEL, bolsaSalva.getSituacao());
    }
}
