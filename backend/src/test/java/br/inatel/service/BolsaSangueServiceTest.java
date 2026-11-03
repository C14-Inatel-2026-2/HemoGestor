package br.inatel.service;

import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.enumeracao.TipoDoacao;
import br.inatel.model.BolsaSangue;
import br.inatel.model.Doacao;
import br.inatel.repository.BolsaSangueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;


public class BolsaSangueServiceTest {
    @Mock
    private BolsaSangueRepository repository;
    private BolsaSangueService service;

    @BeforeEach
    void setUp(){
        MockitoAnnotations.openMocks(this);
        service = new BolsaSangueService(repository);
    }

    @Test
    void listarBolsasValidas(){
        Doacao doacaoValida = new Doacao();
        doacaoValida.setTipoDoacao(TipoDoacao.SANGUE_TOTAL);

        Doacao doacaoVencida = new Doacao();
        doacaoVencida.setTipoDoacao(TipoDoacao.PLAQUETA_POR_AFERESE);

        BolsaSangue bolsaValida = new BolsaSangue(doacaoValida, "A+", LocalDate.now(), SituacaoBolsa.DISPONIVEL);
        BolsaSangue bolsaVencida = new BolsaSangue(doacaoVencida, "O-", LocalDate.now().minusDays(10), SituacaoBolsa.DISPONIVEL);

        when(repository.findAll()).thenReturn(List.of(bolsaValida, bolsaVencida));

        List<BolsaSangue> resultado = service.listarValidas();

        assertEquals(1, resultado.size());
        assertEquals("A+", resultado.getFirst().getTipoSanguineo());
    }

    @Test
    void listarBolsasVencidas() {
        Doacao doacaoValida = new Doacao();
        doacaoValida.setTipoDoacao(TipoDoacao.SANGUE_TOTAL);

        Doacao doacaoVencida = new Doacao();
        doacaoVencida.setTipoDoacao(TipoDoacao.PLAQUETA_POR_AFERESE);

        BolsaSangue bolsaValida = new BolsaSangue(doacaoValida, "A+", LocalDate.now(), SituacaoBolsa.DISPONIVEL);
        BolsaSangue bolsaVencida = new BolsaSangue(doacaoVencida, "O-", LocalDate.now().minusDays(10), SituacaoBolsa.DISPONIVEL);

        when(repository.findAll()).thenReturn(List.of(bolsaValida, bolsaVencida));

        List<BolsaSangue> resultado = service.listarVencidas();

        assertEquals(1, resultado.size());
        assertEquals("O-", resultado.getFirst().getTipoSanguineo());
    }
}
