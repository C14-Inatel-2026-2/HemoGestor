package br.inatel.model;

import br.inatel.enumeracao.Sexo;
import br.inatel.enumeracao.StatusDoacao;
import br.inatel.enumeracao.TipoDoacao;
import br.inatel.exception.DadosInvalidosException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class DoacaoTest {
    //métodos auxiliares
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
    private Doacao criarDoacao(){
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
    void criarDoacaoEmTriagem(){
        Doacao doacao = criarDoacao();
        assertEquals(StatusDoacao.EM_TRIAGEM, doacao.getStatus());
    }

    @Test
    void concluirDoacao(){
        Doacao doacao = criarDoacao();
        doacao.concluirDoacao();
        assertEquals(StatusDoacao.CONCLUIDA, doacao.getStatus());
    }

    @Test
    void descartarDoacao(){
        Doacao doacao = criarDoacao();
        doacao.descartarDoacao();
        assertEquals(StatusDoacao.DESCARTADA, doacao.getStatus());
    }

    @Test
    void naoCriarDoacaoSemDoador(){
        assertThrows(
                DadosInvalidosException.class,
                () -> new Doacao(
                        1L,
                        null,
                        LocalDate.now(),
                        LocalTime.now().minusMinutes(10),
                        450,
                        TipoDoacao.SANGUE_TOTAL,
                        "120/80",
                        new BigDecimal("14.2"),
                        "Sala 1",
                        "Mariana Rocha",
                        "Nenhuma"
                )
        );
    }

    @Test
    void naoCriarDoacaoVolumeInvalido(){
        assertThrows(
                DadosInvalidosException.class,
                () -> new Doacao(
                        1L,
                        criarDoador(),
                        LocalDate.now(),
                        LocalTime.now().minusMinutes(10),
                        0,
                        TipoDoacao.SANGUE_TOTAL,
                        "120/80",
                        new BigDecimal("14.2"),
                        "Sala 1",
                        "Mariana Rocha",
                        "Nenhuma"
                )
        );
    }

    @Test
    void naoCriarDoacaoHemoglobinaInvalida(){
        assertThrows(
                DadosInvalidosException.class,
                () -> new Doacao(
                        1L,
                        criarDoador(),
                        LocalDate.now(),
                        LocalTime.now().minusMinutes(10),
                        450,
                        TipoDoacao.SANGUE_TOTAL,
                        "120/80",
                        BigDecimal.ZERO,
                        "Sala 1",
                        "Mariana Rocha",
                        "Nenhuma"
                )
        );
    }

    @Test
    void naoCriarDoacaoDataFutura(){
        assertThrows(
                DadosInvalidosException.class,
                () -> new Doacao(
                        1L,
                        criarDoador(),
                        LocalDate.now().plusDays(1),
                        LocalTime.now(),
                        450,
                        TipoDoacao.SANGUE_TOTAL,
                        "120/80",
                        new BigDecimal("14.2"),
                        "Sala 1",
                        "Mariana Rocha",
                        "Nenhuma"
                )
        );
    }

    @Test
    void naoCriarDoacaoHoraFutura(){
        assertThrows(
                DadosInvalidosException.class,
                () -> new Doacao(
                        1L,
                        criarDoador(),
                        LocalDate.now(),
                        LocalTime.now().plusHours(1),
                        450,
                        TipoDoacao.SANGUE_TOTAL,
                        "120/80",
                        new BigDecimal("14.2"),
                        "Sala 1",
                        "Mariana Rocha",
                        "Nenhuma"
                )
        );
    }

    @Test
    void naoCriarDoacaoSemTipo(){
        assertThrows(
                DadosInvalidosException.class,
                () -> new Doacao(
                        1L,
                        criarDoador(),
                        LocalDate.now(),
                        LocalTime.now().minusMinutes(10),
                        450,
                        null,
                        "120/80",
                        new BigDecimal("14.2"),
                        "Sala 1",
                        "Mariana Rocha",
                        "Nenhuma"
                )
        );
    }

    @Test
    void naoCriarDoacaoSemResponsavel(){
        assertThrows(
                DadosInvalidosException.class,
                () -> new Doacao(
                        1L,
                        criarDoador(),
                        LocalDate.now(),
                        LocalTime.now().minusMinutes(10),
                        450,
                        TipoDoacao.SANGUE_TOTAL,
                        "120/80",
                        new BigDecimal("14.2"),
                        "Sala 1",
                        "",
                        "Nenhuma"
                )
        );
    }


}
