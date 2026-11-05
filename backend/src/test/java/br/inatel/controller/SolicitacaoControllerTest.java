package br.inatel.controller;

import br.inatel.dto.SolicitacaoRequestDTO;
import br.inatel.dto.SolicitacaoResponseDTO;
import br.inatel.enumeracao.PrioridadeSolicitacao;
import br.inatel.enumeracao.StatusSolicitacao;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.exception.SolicitacaoNaoEncontradaException;
import br.inatel.service.SolicitacaoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SolicitacaoController.class)
public class SolicitacaoControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private SolicitacaoService service;

    @Test
    void cadastrarSolicitacao() throws Exception {
        SolicitacaoRequestDTO request = new SolicitacaoRequestDTO();
        request.setInstituicao("Hospital Santa Casa");
        request.setSetor("UTI");
        request.setTipoSanguineo("A+");
        request.setQuantidade(2);
        request.setPrioridade(PrioridadeSolicitacao.URGENTE);
        request.setJustificativa("Paciente em procedimento cirúrgico.");

        SolicitacaoResponseDTO response = new SolicitacaoResponseDTO(
                1L,
                "Hospital Santa Casa",
                "UTI",
                "A+",
                2,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico.",
                LocalDateTime.now(),
                StatusSolicitacao.PENDENTE,
                List.of(),
                0
        );

        when(service.salvar(any(SolicitacaoRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/solicitacoes")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.instituicao").value("Hospital Santa Casa"))
                .andExpect(jsonPath("$.tipoSanguineo").value("A+"))
                .andExpect(jsonPath("$.quantidade").value(2))
                .andExpect(jsonPath("$.prioridade").value("URGENTE"))
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.bolsasReservadas").isArray())
                .andExpect(jsonPath("$.bolsasReservadas.length()").value(0));
    }

    @Test
    void retornar400QuandoCadastrarSolicitacaoInvalida() throws Exception {
        SolicitacaoRequestDTO request = new SolicitacaoRequestDTO();
        request.setInstituicao("Hospital Santa Casa");
        request.setSetor("UTI");
        request.setTipoSanguineo("A+");
        request.setQuantidade(0);
        request.setPrioridade(PrioridadeSolicitacao.URGENTE);
        request.setJustificativa("Paciente em procedimento cirúrgico.");

        when(service.salvar(any(SolicitacaoRequestDTO.class))).thenThrow(new DadosInvalidosException("Quantidade deve ser maior que zero."));

        mockMvc.perform(post("/solicitacoes")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro")
                        .value("Quantidade deve ser maior que zero."));
    }

    @Test
    void listarSolicitacoes() throws Exception {
        SolicitacaoResponseDTO response = new SolicitacaoResponseDTO(
                1L,
                "Hospital Santa Casa",
                "UTI",
                "A+",
                2,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico.",
                LocalDateTime.now(),
                StatusSolicitacao.PENDENTE,
                List.of(),
                0
        );
        when(service.listarTodas()).thenReturn(List.of(response));

        mockMvc.perform(get("/solicitacoes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].instituicao").value("Hospital Santa Casa"))
                .andExpect(jsonPath("$[0].tipoSanguineo").value("A+"))
                .andExpect(jsonPath("$[0].status").value("PENDENTE"));
    }

    @Test
    void retornarListaVaziaQuandoNaoTemSolicitacoes() throws Exception {
        when(service.listarTodas()).thenReturn(List.of());

        mockMvc.perform(get("/solicitacoes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void buscarSolicitacaoPorId() throws Exception {
        SolicitacaoResponseDTO response = new SolicitacaoResponseDTO(
                1L,
                "Hospital Santa Casa",
                "UTI",
                "A+",
                2,
                PrioridadeSolicitacao.URGENTE,
                "Paciente em procedimento cirúrgico.",
                LocalDateTime.now(),
                StatusSolicitacao.PENDENTE,
                List.of(),
                0
        );

        when(service.buscarPorId(1L)).thenReturn(response);

        mockMvc.perform(get("/solicitacoes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.instituicao").value("Hospital Santa Casa"))
                .andExpect(jsonPath("$.tipoSanguineo").value("A+"))
                .andExpect(jsonPath("$.status").value("PENDENTE"));
    }

    @Test
    void retornar404QuandoSolicitacaoNaoExistir() throws Exception {
        when(service.buscarPorId(99L)).thenThrow(new SolicitacaoNaoEncontradaException("Solicitação não encontrada."));

        mockMvc.perform(get("/solicitacoes/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro")
                        .value("Solicitação não encontrada."));
    }
}
