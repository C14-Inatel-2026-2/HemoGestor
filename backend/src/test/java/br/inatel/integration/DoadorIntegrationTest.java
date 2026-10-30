package br.inatel.integration;

import br.inatel.repository.DoacaoRepository;
import br.inatel.repository.DoadorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class DoadorIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DoadorRepository repository;

    @Autowired
    private DoacaoRepository doacaoRepository;

    @BeforeEach
    void limparBanco() {
        doacaoRepository.deleteAll();
        repository.deleteAll();
    }

    @Test
    void cadastrarEListarDoador() throws Exception {

        String json = """
                {
                  "nome": "Ana Souza",
                  "cpf": "52998224725",
                  "data_nascimento": "2000-05-10",
                  "sexo": "FEMININO",
                  "tipo_sanguineo": "O-",
                  "email": "ana@email.com",
                  "telefone": "35999999999",
                  "cidade": "Pouso Alegre",
                  "bairro": "Centro",
                  "ultima_doacao": null,
                  "qtd_doacoes": 0,
                  "observacoes": null
                }
                """;

        mockMvc.perform(post("/doadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Ana Souza"));

        mockMvc.perform(get("/doadores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Ana Souza"));
    }

    @Test
    void executarFluxoCompletoCRUD() throws Exception {

        String jsonCadastro = """
            {
              "nome": "Ana Souza",
              "cpf": "52998224725",
              "data_nascimento": "2000-05-10",
              "sexo": "FEMININO",
              "tipo_sanguineo": "O-",
              "email": "ana@email.com",
              "telefone": "35999999999",
              "cidade": "Pouso Alegre",
              "bairro": "Centro",
              "ultima_doacao": null,
              "qtd_doacoes": 0,
              "observacoes": null
            }
            """;

        String respostaPost = mockMvc.perform(post("/doadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCadastro))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Number idNumber = com.jayway.jsonpath.JsonPath.read(respostaPost, "$.id");
        Long id = idNumber.longValue();

        mockMvc.perform(get("/doadores/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Ana Souza"));

        String jsonAtualizacao = """
            {
              "nome": "Ana Souza Atualizada",
              "cpf": "52998224725",
              "data_nascimento": "2000-05-10",
              "sexo": "FEMININO",
              "tipo_sanguineo": "A+",
              "email": "ana.atualizada@email.com",
              "telefone": "35988888888",
              "cidade": "Pouso Alegre",
              "bairro": "Centro",
              "ultima_doacao": null,
              "qtd_doacoes": 1,
              "observacoes": "Atualizado no teste de integração"
            }
            """;

        mockMvc.perform(put("/doadores/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonAtualizacao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Ana Souza Atualizada"))
                .andExpect(jsonPath("$.tipo_sanguineo").value("A+"));

        mockMvc.perform(get("/doadores/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Ana Souza Atualizada"))
                .andExpect(jsonPath("$.qtd_doacoes").value(1));

        mockMvc.perform(delete("/doadores/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/doadores/" + id))
                .andExpect(status().isNotFound());
    }
}

