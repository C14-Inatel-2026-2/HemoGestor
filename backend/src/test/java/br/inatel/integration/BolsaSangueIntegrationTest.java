package br.inatel.integration;

import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.enumeracao.StatusDoacao;
import br.inatel.enumeracao.TipoDoacao;
import br.inatel.model.BolsaSangue;
import br.inatel.model.Doacao;
import br.inatel.model.Doador;
import br.inatel.repository.BolsaSangueRepository;
import br.inatel.repository.DoacaoRepository;
import br.inatel.repository.DoadorRepository;
import br.inatel.service.BolsaSangueService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
public class BolsaSangueIntegrationTest {
    @Autowired
    private BolsaSangueRepository bolsaSangueRepository;
    @Autowired
    private DoacaoRepository doacaoRepository;
    @Autowired
    private DoadorRepository doadorRepository;
    @Autowired
    private BolsaSangueService service;

    @BeforeEach
    void setUp(){
        bolsaSangueRepository.deleteAll();
        doacaoRepository.deleteAll();
        doadorRepository.deleteAll();;
    }

    @Test
    void listarBolsasSalvas() {
        Doador doador = new Doador();
        doador.setNome("Teste");
        doador.setCpf("12345678900");
        doador.setTipo_sanguineo("A+");

        doador = doadorRepository.save(doador);

        Doacao doacao = new Doacao();
        doacao.setDoador(doador);
        doacao.setTipoDoacao(TipoDoacao.SANGUE_TOTAL);
        doacao.setDataColeta(LocalDate.now());
        doacao.setHemoglobina(BigDecimal.valueOf(13.5));
        doacao.setHoraColeta(LocalTime.of(10, 0));
        doacao.setVolume_ml(450);
        doacao.setResponsavel("Responsável Teste");
        doacao.concluirDoacao();
        doacao = doacaoRepository.save(doacao);

        BolsaSangue bolsa = new BolsaSangue(doacao, "A+", LocalDate.now(), SituacaoBolsa.DISPONIVEL);

        bolsaSangueRepository.save(bolsa);

        List<BolsaSangue> resultado = service.listarTodas();

        assertEquals(1, resultado.size());
        assertEquals("A+", resultado.getFirst().getTipoSanguineo());
    }

    @Test
    void filtrarBolsasPorSituacao() {
        Doador doador = new Doador();
        doador.setNome("Teste");
        doador.setCpf("12345678901");
        doador.setTipo_sanguineo("A+");
        doador = doadorRepository.save(doador);

        Doacao doacao = new Doacao();
        doacao.setDoador(doador);
        doacao.setTipoDoacao(TipoDoacao.SANGUE_TOTAL);
        doacao.setDataColeta(LocalDate.now());
        doacao.setHemoglobina(BigDecimal.valueOf(13.5));
        doacao.setHoraColeta(LocalTime.of(10, 0));
        doacao.setVolume_ml(450);
        doacao.setResponsavel("Responsável Teste");
        doacao.concluirDoacao();
        doacao = doacaoRepository.save(doacao);

        BolsaSangue disponivel = new BolsaSangue(doacao, "A+", LocalDate.now(), SituacaoBolsa.DISPONIVEL);
        bolsaSangueRepository.save(disponivel);

        List<BolsaSangue> resultado = service.listarPorSituacao(SituacaoBolsa.DISPONIVEL);

        assertEquals(1, resultado.size());
        assertEquals(SituacaoBolsa.DISPONIVEL, resultado.getFirst().getSituacao());
    }
}
