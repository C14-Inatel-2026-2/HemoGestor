package br.inatel.controller;

import br.inatel.enumeracao.SituacaoBolsa;
import br.inatel.enumeracao.TipoDoacao;
import br.inatel.model.BolsaSangue;
import br.inatel.model.Doacao;
import br.inatel.model.Doador;
import br.inatel.service.BolsaSangueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BolsaSangueController.class)
public class BolsaSangueControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BolsaSangueService service;

    private Doacao criarDoacao(Long id) {
        Doador doador = new Doador();
        doador.setId(1L);
        doador.setNome("Doador Teste");

        Doacao doacao = new Doacao();
        doacao.setId(id);
        doacao.setDoador(doador);
        doacao.setTipoDoacao(TipoDoacao.SANGUE_TOTAL);

        return doacao;
    }

    @Test
    void listarTodasBolsas() throws Exception{
        Doacao doacao = criarDoacao(1L);
        BolsaSangue bolsa = new BolsaSangue(doacao, "O+", LocalDate.now(), SituacaoBolsa.DISPONIVEL);

        when(service.listarTodas()).thenReturn(List.of(bolsa));

        mockMvc.perform(get("/bolsas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].doacaoId").value(1))
                .andExpect(jsonPath("$[0].tipoSanguineo").value("O+"))
                .andExpect(jsonPath("$[0].status").value("DISPONIVEL"));
    }

    @Test
    void retornarMensagemSeNaoTemBolsas() throws Exception{
        when(service.listarTodas()).thenReturn(List.of());

        mockMvc.perform(get("/bolsas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem")
                        .value("Não existem bolsas cadastradas."));
    }

    @Test
    void filtrarBolsasPorTipoSanguineo() throws Exception{
        Doacao doacao = criarDoacao(1L);
        BolsaSangue bolsa = new BolsaSangue(doacao, "O+", LocalDate.now(), SituacaoBolsa.DISPONIVEL);

        when(service.listarPorTipoSanguineo("O+")).thenReturn(List.of(bolsa));

        mockMvc.perform(get("/bolsas/tipo")
                        .param("tipoSanguineo", "O+"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].tipoSanguineo").value("O+"));
    }

    @Test
    void retornarMensagemQuandoNaoTemBolsasDoTipo() throws Exception{
        when(service.listarPorTipoSanguineo("AB-")).thenReturn(List.of());

        mockMvc.perform(get("/bolsas/tipo")
                        .param("tipoSanguineo", "AB-"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem")
                        .value("Não existem bolsas cadastradas para este tipo sanguíneo."));
    }

    @Test
    void deveListarBolsasValidas() throws Exception {
        Doacao doacao = criarDoacao(1L);
        BolsaSangue bolsa = new BolsaSangue(doacao, "A+", LocalDate.now(), SituacaoBolsa.DISPONIVEL);

        when(service.listarValidas()).thenReturn(List.of(bolsa));

        mockMvc.perform(get("/bolsas/validas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].vencida").value(false));
    }

    @Test
    void retornarMensagemSeNaoTemBolsasValidas() throws Exception {
        when(service.listarValidas()).thenReturn(List.of());

        mockMvc.perform(get("/bolsas/validas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem")
                        .value("Não existem bolsas válidas cadastradas."));
    }

    @Test
    void deveListarBolsasVencidas() throws Exception {
        Doacao doacao = criarDoacao(2L);
        doacao.setTipoDoacao(TipoDoacao.PLAQUETA_POR_AFERESE);
        BolsaSangue bolsa = new BolsaSangue(doacao, "O-", LocalDate.now().minusDays(10), SituacaoBolsa.DISPONIVEL);

        when(service.listarVencidas()).thenReturn(List.of(bolsa));

        mockMvc.perform(get("/bolsas/vencidas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].vencida").value(true));
    }

    @Test
    void retornarMensagemSeNaoTemBolsasVencidas() throws Exception {
        when(service.listarVencidas()).thenReturn(List.of());

        mockMvc.perform(get("/bolsas/vencidas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem")
                        .value("Não existem bolsas vencidas cadastradas."));
    }

    @Test
    void filtrarBolsaPorSituacao() throws Exception{
        Doacao doacao = criarDoacao(1L);
        BolsaSangue bolsa = new BolsaSangue(doacao, "A+", LocalDate.now(), SituacaoBolsa.DISPONIVEL);

        when(service.listarPorSituacao(SituacaoBolsa.DISPONIVEL)).thenReturn(List.of(bolsa));

        mockMvc.perform(get("/bolsas/situacao")
                        .param("situacao", "DISPONIVEL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("DISPONIVEL"));
    }

    @Test
    void retornarMensagemSeNaoTemBolsaDaSituacao() throws Exception{
        when(service.listarPorSituacao(SituacaoBolsa.DESCARTADA)).thenReturn(List.of());

        mockMvc.perform(get("/bolsas/situacao")
                        .param("situacao", "DESCARTADA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem")
                        .value("Não existem bolsas cadastradas com esta situação."));
    }

    @Test
    void buscarBolsaPorId() throws Exception {
        Doacao doacao = criarDoacao(1L);
        BolsaSangue bolsa = new BolsaSangue(doacao, "O+", LocalDate.now(), SituacaoBolsa.DISPONIVEL);

        when(service.buscarPorId(1L)).thenReturn(bolsa);

        mockMvc.perform(get("/bolsas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doacaoId").value(1))
                .andExpect(jsonPath("$.tipoSanguineo").value("O+"))
                .andExpect(jsonPath("$.status").value("DISPONIVEL"));
    }

    @Test
    void descartarBolsa() throws Exception {
        Doacao doacao = criarDoacao(1L);
        BolsaSangue bolsa = new BolsaSangue(doacao, "O+", LocalDate.now(), SituacaoBolsa.DISPONIVEL);
        bolsa.descartar();

        when(service.descartar(1L)).thenReturn(bolsa);

        mockMvc.perform(patch("/bolsas/1/descartar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DESCARTADA"));
    }

    @Test
    void naoDescartarBolsaQueNaoEstaDisponivel() throws Exception {
        when(service.descartar(1L)).thenThrow(new IllegalStateException("Só é possível descartar bolsas disponíveis."));

        mockMvc.perform(patch("/bolsas/1/descartar"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.erro")
                        .value("Só é possível descartar bolsas disponíveis."));
    }
}
