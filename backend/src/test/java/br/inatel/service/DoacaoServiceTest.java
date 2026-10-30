package br.inatel.service;

import br.inatel.enumeracao.Sexo;
import br.inatel.enumeracao.StatusDoacao;
import br.inatel.enumeracao.StatusDoador;
import br.inatel.enumeracao.TipoDoacao;
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
