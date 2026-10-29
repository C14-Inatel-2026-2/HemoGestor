package br.inatel.controller;

import br.inatel.enumeracao.Sexo;
import br.inatel.enumeracao.TipoDoacao;
import br.inatel.model.Doacao;
import br.inatel.model.Doador;
import br.inatel.service.DoacaoService;
import br.inatel.service.DoadorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DoacaoController.class)
public class DoacaoControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DoacaoService doacaoService;
    @MockitoBean
    private DoadorService doadorService;

    private Doador criarDoador(){
        return new Doador(
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
    void listarTodasDoacoes() throws Exception{
        Doacao doacao = criarDoacao();
        when(doacaoService.listarTodas()).thenReturn(List.of(doacao));

        mockMvc.perform(get("/doacoes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nomeDoador").value("Ana Souza"))
                .andExpect(jsonPath("$[0].tipoSanguineo").value("O+"))
                .andExpect(jsonPath("$[0].volume_ml").value(450))
                .andExpect(jsonPath("$[0].status").value("EM_TRIAGEM"));
    }

    @Test
    void buscarDoacaoPorID() throws Exception{
        Doacao doacao = criarDoacao();
        when(doacaoService.buscarPorID(1L)).thenReturn(Optional.of(doacao));

        mockMvc.perform(get("/doacoes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nomeDoador").value("Ana Souza"))
                .andExpect(jsonPath("$.tipoSanguineo").value("O+"))
                .andExpect(jsonPath("$.volume_ml").value(450))
                .andExpect(jsonPath("$.status").value("EM_TRIAGEM"));
    }

    @Test
    void retornarNotFoundQuandoBuscarDoacaoInexistente() throws Exception {

        when(doacaoService.buscarPorID(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/doacoes/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void cadastrarDoacao() throws Exception{
        Doador doador = criarDoador();
        Doacao doacao = criarDoacao();

        when(doadorService.buscarPorId(1L)).thenReturn(Optional.of(doador));
        when(doacaoService.salvar(any(Doacao.class))).thenReturn(doacao);

        String json = """
            {
              "doadorId": 1,
              "dataColeta": "2026-10-29",
              "horaColeta": "10:30:00",
              "volume_ml": 450,
              "tipoDoacao": "SANGUE_TOTAL",
              "pressaoArterial": "120/80",
              "hemoglobina": 14.2,
              "sala": "Sala 1",
              "responsavel": "Mariana Rocha",
              "intercorrencia": "Nenhuma"
            }
            """;

        mockMvc.perform(post("/doacoes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nomeDoador").value("Ana Souza"))
                .andExpect(jsonPath("$.status").value("EM_TRIAGEM"));
    }

    @Test
    void retornarNotFoundCadastroDoadorInexistente() throws Exception{
        when(doadorService.buscarPorId(99L)).thenReturn(Optional.empty());

        String json = """
            {
              "doadorId": 99,
              "dataColeta": "2026-10-29",
              "horaColeta": "10:30:00",
              "volume_ml": 450,
              "tipoDoacao": "SANGUE_TOTAL",
              "pressaoArterial": "120/80",
              "hemoglobina": 14.2,
              "sala": "Sala 1",
              "responsavel": "Mariana Rocha",
              "intercorrencia": "Nenhuma"
            }
            """;

        mockMvc.perform(post("/doacoes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound());
    }

    @Test
    void concluirDoacao() throws Exception{
        Doacao doacao = criarDoacao();
        doacao.concluirDoacao();
        when(doacaoService.concluir(1L)).thenReturn(Optional.of(doacao));

        mockMvc.perform(patch("/doacoes/1/concluir"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("CONCLUIDA"));

    }

    @Test
    void descartarDoacao() throws Exception{
        Doacao doacao = criarDoacao();
        doacao.descartarDoacao();
        when(doacaoService.descartar(1L)).thenReturn(Optional.of(doacao));

        mockMvc.perform(patch("/doacoes/1/descartar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("DESCARTADA"));
    }

    @Test
    void retornarNotFoundConcluirDoacaoInexistente() throws Exception {
        when(doacaoService.concluir(99L)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/doacoes/99/concluir"))
                .andExpect(status().isNotFound());
    }

    @Test
    void retornarNotFoundDescartarDoacaoInexistente() throws Exception {

        when(doacaoService.descartar(99L)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/doacoes/99/descartar"))
                .andExpect(status().isNotFound());
    }
}
