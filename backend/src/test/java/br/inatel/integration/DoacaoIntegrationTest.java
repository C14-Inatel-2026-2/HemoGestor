package br.inatel.integration;

import br.inatel.enumeracao.Sexo;
import br.inatel.model.Doador;
import br.inatel.repository.DoacaoRepository;
import br.inatel.repository.DoadorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class DoacaoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DoacaoRepository doacaoRepository;

    @Autowired
    private DoadorRepository doadorRepository;

    private Long doadorId;

    @BeforeEach
    void prepararBanco() {
        doacaoRepository.deleteAll();
        doadorRepository.deleteAll();

        Doador doador = new Doador(
                null,
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

        doadorId = doadorRepository.save(doador).getId();
    }

    @Test
    void cadastrarEListarDoacao() throws Exception {
        String json = """
                {
                  "doadorId": %d,
                  "dataColeta": "2026-10-28",
                  "horaColeta": "10:30:00",
                  "volume_ml": 450,
                  "tipoDoacao": "SANGUE_TOTAL",
                  "pressaoArterial": "120/80",
                  "hemoglobina": 14.2,
                  "sala": "Sala 1",
                  "responsavel": "Mariana Rocha",
                  "intercorrencia": "Nenhuma"
                }
                """.formatted(doadorId);

        mockMvc.perform(post("/doacoes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nomeDoador").value("Ana Souza"))
                .andExpect(jsonPath("$.tipoSanguineo").value("O+"))
                .andExpect(jsonPath("$.status").value("EM_TRIAGEM"));

        mockMvc.perform(get("/doacoes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nomeDoador").value("Ana Souza"))
                .andExpect(jsonPath("$[0].status").value("EM_TRIAGEM"));
    }

    @Test
    void executarFluxoDeStatusDaDoacao() throws Exception {
        String json = """
                {
                  "doadorId": %d,
                  "dataColeta": "2026-10-28",
                  "horaColeta": "10:30:00",
                  "volume_ml": 450,
                  "tipoDoacao": "SANGUE_TOTAL",
                  "pressaoArterial": "120/80",
                  "hemoglobina": 14.2,
                  "sala": "Sala 1",
                  "responsavel": "Mariana Rocha",
                  "intercorrencia": "Nenhuma"
                }
                """.formatted(doadorId);

        String respostaPost = mockMvc.perform(post("/doacoes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("EM_TRIAGEM"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Number idNumber = com.jayway.jsonpath.JsonPath.read(
                respostaPost,
                "$.id"
        );

        Long id = idNumber.longValue();

        mockMvc.perform(patch("/doacoes/" + id + "/concluir"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"));

        mockMvc.perform(get("/doacoes/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"));
    }

    @Test
    void retornarDoacoesDoDoadorInformado() throws Exception{
        Doador outroDoador = new Doador(
                null,
                "Beatriz Lima",
                "987.654.321-00",
                LocalDate.of(1998, 8, 20),
                Sexo.FEMININO,
                "A+",
                "beatriz@email.com",
                "35988888888",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );

        Long outroDoadorId = doadorRepository.save(outroDoador).getId();

        String primeiraDoacao = """
            {
              "doadorId": %d,
              "dataColeta": "2026-10-28",
              "horaColeta": "10:30:00",
              "volume_ml": 450,
              "tipoDoacao": "SANGUE_TOTAL",
              "pressaoArterial": "120/80",
              "hemoglobina": 14.2,
              "sala": "Sala 1",
              "responsavel": "Mariana Rocha",
              "intercorrencia": "Nenhuma"
            }
            """.formatted(doadorId);

        String segundaDoacao = """
            {
              "doadorId": %d,
              "dataColeta": "2026-10-28",
              "horaColeta": "11:00:00",
              "volume_ml": 450,
              "tipoDoacao": "SANGUE_TOTAL",
              "pressaoArterial": "110/70",
              "hemoglobina": 13.8,
              "sala": "Sala 2",
              "responsavel": "Mariana Rocha",
              "intercorrencia": "Nenhuma"
            }
            """.formatted(outroDoadorId);

        mockMvc.perform(post("/doacoes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(primeiraDoacao))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/doacoes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(segundaDoacao))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/doacoes/doador/" + doadorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].doadorId").value(doadorId))
                .andExpect(jsonPath("$[0].nomeDoador").value("Ana Souza"));
    }

}
