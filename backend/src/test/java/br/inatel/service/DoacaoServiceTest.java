package br.inatel.service;

import br.inatel.enumeracao.Sexo;
import br.inatel.enumeracao.StatusDoacao;
import br.inatel.enumeracao.StatusDoador;
import br.inatel.enumeracao.TipoDoacao;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.model.Doacao;
import br.inatel.model.Doador;
import br.inatel.repository.DoacaoRepository;
import org.junit.jupiter.api.Test;

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
        DoacaoService service = new DoacaoService(repository);

        Doacao doacao = criarDoacao();
        when(repository.save(doacao)).thenReturn(doacao);

        Doacao resultado = service.salvar(doacao);
        assertEquals(doacao, resultado);
        verify(repository).save(doacao);
    }

    @Test
    void naoSalvarDoacaoAntesDoIntervaloMinimo() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        DoacaoService service = new DoacaoService(repository);
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
        DoacaoService service = new DoacaoService(repository);

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
        DoacaoService service = new DoacaoService(repository);

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
        DoacaoService service = new DoacaoService(repository);

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
        DoacaoService service = new DoacaoService(repository);

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
        DoacaoService service = new DoacaoService(repository);

        Doacao doacao = criarDoacao();

        when(repository.findById(1L)).thenReturn(Optional.of(doacao));
        when(repository.save(doacao)).thenReturn(doacao);

        Optional<Doacao> resultado = service.concluir(1L);

        assertTrue(resultado.isPresent());
        assertEquals(StatusDoacao.CONCLUIDA, resultado.get().getStatus());

        assertTrue(resultado.isPresent());
        assertEquals(StatusDoacao.CONCLUIDA, resultado.get().getStatus());

        Doador doadorAtualizado = resultado.get().getDoador();

        assertEquals(doacao.getDataColeta(), doadorAtualizado.getUltima_doacao());
        assertEquals(1, doadorAtualizado.getQtd_doacoes());
        assertEquals("AGUARDANDO", doadorAtualizado.getStatus().name());
        assertEquals(StatusDoador.AGUARDANDO, doadorAtualizado.getStatus());

        verify(repository).findById(1L);
        verify(repository).save(doacao);
    }

    @Test
    void descartarDoacao() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        DoacaoService service = new DoacaoService(repository);

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
        DoacaoService service = new DoacaoService(repository);

        when(repository.findById(99L)).thenReturn(Optional.empty());

        Optional<Doacao> resultado = service.concluir(99L);

        assertTrue(resultado.isEmpty());
        verify(repository).findById(99L);
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void naoDescartarDoacaoInexistente() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        DoacaoService service = new DoacaoService(repository);

        when(repository.findById(99L)).thenReturn(Optional.empty());

        Optional<Doacao> resultado = service.descartar(99L);

        assertTrue(resultado.isEmpty());
        verify(repository).findById(99L);
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void buscarDoacoesPorDoador() {
        DoacaoRepository repository = mock(DoacaoRepository.class);
        DoacaoService service = new DoacaoService(repository);

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
        DoacaoService service = new DoacaoService(repository);

        when(repository.findByDoadorId(1L)).thenReturn(List.of());

        List<Doacao> resultado = service.buscarPorDoador(1L);

        assertTrue(resultado.isEmpty());
        verify(repository).findByDoadorId(1L);
    }
}
