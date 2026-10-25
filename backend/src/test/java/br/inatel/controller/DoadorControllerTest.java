package br.inatel.controller;

import br.inatel.enumeracao.Sexo;
import br.inatel.model.Doador;
import br.inatel.service.DoadorService;
import br.inatel.exception.DadosInvalidosException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DoadorController.class)
public class DoadorControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DoadorService service;

    @Test
    void listarTodosOsDoadores() throws Exception {

        Doador doador = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "O-",
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        when(service.listarTodos()).thenReturn(List.of(doador));

        mockMvc.perform(get("/doadores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Ana Souza"))
                .andExpect(jsonPath("$[0].cpf").value("52998224725"))
                .andExpect(jsonPath("$[0].tipo_sanguineo").value("O-"));
    }

    @Test
    void buscarDoadorPorId() throws Exception {

        Doador doador = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "O-",
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        when(service.buscarPorId(1L)).thenReturn(Optional.of(doador));

        mockMvc.perform(get("/doadores/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Ana Souza"))
                .andExpect(jsonPath("$.cpf").value("52998224725"))
                .andExpect(jsonPath("$.tipo_sanguineo").value("O-"));
    }

    @Test
    void retornarNotFoundAoBuscarDoadorInexistente() throws Exception {

        when(service.buscarPorId(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/doadores/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void cadastrarDoador() throws Exception {

        Doador doadorSalvo = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "O-",
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        when(service.salvar(any(Doador.class))).thenReturn(doadorSalvo);

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
                .andExpect(jsonPath("$.nome").value("Ana Souza"))
                .andExpect(jsonPath("$.cpf").value("52998224725"))
                .andExpect(jsonPath("$.tipo_sanguineo").value("O-"));
    }

    @Test
    void retornarBadRequestAoCadastrarDoadorInvalido() throws Exception {

        String json = """
            {
              "nome": "",
              "cpf": "",
              "data_nascimento": "2030-05-10",
              "sexo": "FEMININO",
              "tipo_sanguineo": "O-",
              "email": "email-invalido",
              "telefone": "35999999999",
              "cidade": "Pouso Alegre",
              "bairro": "Centro",
              "ultima_doacao": null,
              "qtd_doacoes": -1,
              "observacoes": null
            }
            """;

        mockMvc.perform(post("/doadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.nome").exists())
                .andExpect(jsonPath("$.cpf").exists())
                .andExpect(jsonPath("$.data_nascimento").exists())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.qtd_doacoes").exists());
    }

    @Test
    void retornarBadRequestAoCadastrarTipoSanguineoInvalido() throws Exception {

        String json = """
            {
              "nome": "Ana Souza",
              "cpf": "52998224725",
              "data_nascimento": "2000-05-10",
              "sexo": "FEMININO",
              "tipo_sanguineo": "X+",
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
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Tipo sanguíneo inválido."));
    }

    @Test
    void atualizarDoador() throws Exception {

        Doador doadorAtualizado = new Doador(
                null,
                "Ana Souza Atualizada",
                "52998224725",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "A+",
                "ana.atualizada@email.com",
                "35988888888",
                "Pouso Alegre",
                "Centro",
                null,
                1,
                "Dados atualizados"
        );

        when(service.atualizar(eq(1L), any(Doador.class)))
                .thenReturn(Optional.of(doadorAtualizado));

        String json = """
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
              "observacoes": "Dados atualizados"
            }
            """;

        mockMvc.perform(put("/doadores/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Ana Souza Atualizada"))
                .andExpect(jsonPath("$.tipo_sanguineo").value("A+"))
                .andExpect(jsonPath("$.qtd_doacoes").value(1));
    }

    @Test
    void retornarNotFoundAoAtualizarDoadorInexistente() throws Exception {

        when(service.atualizar(eq(99L), any(Doador.class)))
                .thenReturn(Optional.empty());

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

        mockMvc.perform(put("/doadores/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletarDoador() throws Exception {

        Doador doador = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "O-",
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        when(service.buscarPorId(1L)).thenReturn(Optional.of(doador));

        mockMvc.perform(delete("/doadores/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void retornarNotFoundAoDeletarDoadorInexistente() throws Exception {

        when(service.buscarPorId(99L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/doadores/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void retornarBadRequestQuandoDadosInvalidosException() throws Exception {

        when(service.salvar(any(Doador.class)))
                .thenThrow(new DadosInvalidosException("Dados inválidos."));

        String json = """
            {
              "nome": "Ana Souza",
              "cpf": "52998224725",
              "data_nascimento": "2000-05-10",
              "sexo": "FEMININO",
              "tipo_sanguineo": "O+",
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
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Dados inválidos."));
    }

    @Test
    void retornarConflictQuandoCpfJaEstiverCadastrado() throws Exception {

        when(service.salvar(any(Doador.class)))
                .thenThrow(new DataIntegrityViolationException("CPF duplicado"));

        String json = """
            {
              "nome": "Ana Souza",
              "cpf": "52998224725",
              "data_nascimento": "2000-05-10",
              "sexo": "FEMININO",
              "tipo_sanguineo": "O+",
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
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.erro")
                        .value("Já existe um doador cadastrado com esse CPF."));
    }
}
