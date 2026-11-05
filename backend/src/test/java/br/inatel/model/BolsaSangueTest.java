package br.inatel.model;

import br.inatel.enumeracao.Sexo;
import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.enumeracao.TipoDoacao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

public class BolsaSangueTest {
    private Doador doador;
    private Doacao doacao;

    @BeforeEach
    void setUp(){
        doador = new Doador(
                1L,
                "Ana Souza",
                "123.456.789-00",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "O+",
                "ana@email.com",
                "35999999999",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );

        doacao = new Doacao(
                1L,
                doador,
                LocalDate.of(2026, 11, 1),
                LocalTime.of(10, 0),
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
    void calcularValidadeSangueTotal() {
        doacao.setTipoDoacao(TipoDoacao.SANGUE_TOTAL);
        BolsaSangue bolsa = new BolsaSangue(doacao, doador.getTipo_sanguineo(), doacao.getDataColeta(), SituacaoBolsa.DISPONIVEL);

        assertEquals(doacao.getDataColeta().plusDays(35), bolsa.getDataValidade());
    }

    @Test
    void calcularValidadePlaquetaPorAferese() {
        doacao.setTipoDoacao(TipoDoacao.PLAQUETA_POR_AFERESE);
        BolsaSangue bolsa = new BolsaSangue(doacao, doador.getTipo_sanguineo(), doacao.getDataColeta(), SituacaoBolsa.DISPONIVEL);

        assertEquals(doacao.getDataColeta().plusDays(5), bolsa.getDataValidade());
    }

    @Test
    void calcularValidadePlasma() {
        doacao.setTipoDoacao(TipoDoacao.PLASMA);
        BolsaSangue bolsa = new BolsaSangue(doacao, doador.getTipo_sanguineo(), doacao.getDataColeta(), SituacaoBolsa.DISPONIVEL);

        assertEquals(doacao.getDataColeta().plusDays(365), bolsa.getDataValidade());
    }

    @Test
    void identificarBolsaVencida(){
        doacao.setTipoDoacao((TipoDoacao.PLAQUETA_POR_AFERESE));
        doacao.setDataColeta(LocalDate.now().minusDays(10));

        BolsaSangue bolsa = new BolsaSangue(doacao, doador.getTipo_sanguineo(), doacao.getDataColeta(), SituacaoBolsa.DISPONIVEL);
        assertTrue(bolsa.estaVencida());
    }

    @Test
    void naoIndentificarBolsaComoVencida(){
        doacao.setTipoDoacao((TipoDoacao.PLAQUETA_POR_AFERESE));
        doacao.setDataColeta(LocalDate.now().minusDays(2));

        BolsaSangue bolsa = new BolsaSangue(doacao, doador.getTipo_sanguineo(), doacao.getDataColeta(), SituacaoBolsa.DISPONIVEL);
        assertFalse(bolsa.estaVencida());
    }

    @Test
    void naoDescartarBolsaQueNaoEstaDisponivel() {
        Doacao doacao = new Doacao();
        doacao.setTipoDoacao(TipoDoacao.SANGUE_TOTAL);

        BolsaSangue bolsa = new BolsaSangue(doacao, "O+", LocalDate.now(), SituacaoBolsa.RESERVADA);

        IllegalStateException exception = assertThrows(IllegalStateException.class, bolsa::descartar);

        assertEquals("Só é possível descartar bolsas disponíveis.", exception.getMessage());
    }
}
