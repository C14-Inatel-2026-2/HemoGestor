package br.inatel.integration;

import br.inatel.dto.SolicitacaoRequestDTO;
import br.inatel.dto.SolicitacaoResponseDTO;
import br.inatel.enumeracao.*;
import br.inatel.model.BolsaSangue;
import br.inatel.model.Doacao;
import br.inatel.model.Doador;
import br.inatel.repository.BolsaSangueRepository;
import br.inatel.repository.DoacaoRepository;
import br.inatel.repository.DoadorRepository;
import br.inatel.repository.SolicitacaoRepository;
import br.inatel.service.SolicitacaoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("integration")
@Transactional
public class SolicitacaoIntegrationTest {
    @Autowired
    private SolicitacaoRepository solicitacaoRepository;
    @Autowired
    private SolicitacaoService solicitacaoService;
    @Autowired
    private DoadorRepository doadorRepository;
    @Autowired
    private DoacaoRepository doacaoRepository;
    @Autowired
    private BolsaSangueRepository bolsaSangueRepository;

    @Test
    void conectarAoBancoDeIntegracao() {
        assertNotNull(solicitacaoRepository);
    }

    @Test
    void cadastrarSolicitacaoNoBancoDeIntegracao() {
        SolicitacaoRequestDTO dto = new SolicitacaoRequestDTO();
        dto.setInstituicao("Hospital Santa Casa");
        dto.setSetor("UTI");
        dto.setTipoSanguineo("A+");
        dto.setQuantidade(2);
        dto.setPrioridade(PrioridadeSolicitacao.URGENTE);
        dto.setJustificativa("Teste de integração");

        SolicitacaoResponseDTO resultado = solicitacaoService.salvar(dto);

        assertNotNull(resultado.getId());
        assertEquals("Hospital Santa Casa", resultado.getInstituicao());
        assertEquals(StatusSolicitacao.PENDENTE, resultado.getStatus());
        assertTrue(solicitacaoRepository.findById(resultado.getId()).isPresent());
    }

    @Test
    void atenderSolicitacaoComBolsasPersistidasNoBanco() {
        Doador doadorA = new Doador(
                null,
                "Doador A",
                "111.111.111-11",
                LocalDate.of(1990, 1, 1),
                Sexo.FEMININO,
                "A+",
                "a@email.com",
                "35999999999",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );
        doadorA = doadorRepository.save(doadorA);
        Doacao doacaoA = new Doacao(
                null,
                doadorA,
                LocalDate.now().minusDays(1),
                LocalTime.of(10, 0),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "12/8",
                new BigDecimal("13.5"),
                "Sala 1",
                "Responsável Teste",
                null
        );
        doacaoA = doacaoRepository.save(doacaoA);
        BolsaSangue bolsaA = new BolsaSangue(
                doacaoA,
                "A+",
                LocalDate.now().minusDays(1),
                SituacaoBolsa.DISPONIVEL
        );
        bolsaA = bolsaSangueRepository.save(bolsaA);

        Doador doadorO = new Doador(
                null,
                "Doador O",
                "222.222.222-22",
                LocalDate.of(1990, 1, 1),
                Sexo.MASCULINO,
                "O+",
                "o@email.com",
                "35888888888",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );
        doadorO = doadorRepository.save(doadorO);
        Doacao doacaoO = new Doacao(
                null,
                doadorO,
                LocalDate.now().minusDays(1),
                LocalTime.of(11, 0),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "12/8",
                new BigDecimal("14.0"),
                "Sala 1",
                "Responsável Teste",
                null
        );
        doacaoO = doacaoRepository.save(doacaoO);
        BolsaSangue bolsaO = new BolsaSangue(
                doacaoO,
                "O+",
                LocalDate.now().minusDays(1),
                SituacaoBolsa.DISPONIVEL
        );
        bolsaO = bolsaSangueRepository.save(bolsaO);

        SolicitacaoRequestDTO dto = new SolicitacaoRequestDTO();
        dto.setInstituicao("Hospital Santa Casa");
        dto.setSetor("UTI");
        dto.setTipoSanguineo("A+");
        dto.setQuantidade(2);
        dto.setPrioridade(PrioridadeSolicitacao.URGENTE);
        dto.setJustificativa("Teste de integração");

        SolicitacaoResponseDTO criada = solicitacaoService.salvar(dto);
        SolicitacaoResponseDTO atendida = solicitacaoService.atender(criada.getId());

        assertEquals(StatusSolicitacao.EM_ATENDIMENTO, atendida.getStatus());
        assertEquals(2, atendida.getBolsasReservadas().size());

        BolsaSangue bolsaAPersistida = bolsaSangueRepository.findById(bolsaA.getId()).orElseThrow();
        BolsaSangue bolsaOPersistida = bolsaSangueRepository.findById(bolsaO.getId()).orElseThrow();

        assertEquals(SituacaoBolsa.RESERVADA, bolsaAPersistida.getSituacao());
        assertEquals(SituacaoBolsa.RESERVADA, bolsaOPersistida.getSituacao());
    }

    @Test
    void concluirSolicitacaoComBolsasPersistidasNoBanco() {
        Doador doadorA = new Doador(
                null,
                "Doador A",
                "333.333.333-33",
                LocalDate.of(1990, 1, 1),
                Sexo.FEMININO,
                "A+",
                "a3@email.com",
                "35999999993",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );
        doadorA = doadorRepository.save(doadorA);
        Doacao doacaoA = new Doacao(
                null,
                doadorA,
                LocalDate.now().minusDays(1),
                LocalTime.of(10, 0),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "12/8",
                new BigDecimal("13.5"),
                "Sala 1",
                "Responsável Teste",
                null
        );
        doacaoA = doacaoRepository.save(doacaoA);
        BolsaSangue bolsaA = new BolsaSangue(doacaoA, "A+", LocalDate.now().minusDays(1), SituacaoBolsa.DISPONIVEL);
        bolsaA = bolsaSangueRepository.save(bolsaA);

        SolicitacaoRequestDTO dto = new SolicitacaoRequestDTO();
        dto.setInstituicao("Hospital Santa Casa");
        dto.setSetor("UTI");
        dto.setTipoSanguineo("A+");
        dto.setQuantidade(1);
        dto.setPrioridade(PrioridadeSolicitacao.URGENTE);
        dto.setJustificativa("Teste de conclusão");

        SolicitacaoResponseDTO criada = solicitacaoService.salvar(dto);
        SolicitacaoResponseDTO atendida = solicitacaoService.atender(criada.getId());
        assertEquals(StatusSolicitacao.EM_ATENDIMENTO, atendida.getStatus());

        SolicitacaoResponseDTO concluida = solicitacaoService.concluir(criada.getId());
        assertEquals(StatusSolicitacao.ATENDIDA, concluida.getStatus());

        BolsaSangue bolsaPersistida = bolsaSangueRepository.findById(bolsaA.getId()).orElseThrow();
        assertEquals(SituacaoBolsa.UTILIZADA, bolsaPersistida.getSituacao());
        assertEquals(StatusSolicitacao.ATENDIDA, solicitacaoRepository.findById(criada.getId()).orElseThrow().getStatus());
    }

    @Test
    void cancelarSolicitacaoEmAtendimentoELiberarBolsaNoBanco() {
        Doador doador = new Doador(
                null,
                "Doador Cancelamento",
                "444.444.444-44",
                LocalDate.of(1990, 1, 1),
                Sexo.FEMININO,
                "A+",
                "cancelamento@email.com",
                "35999999994",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );
        doador = doadorRepository.save(doador);
        Doacao doacao = new Doacao(
                null,
                doador,
                LocalDate.now().minusDays(1),
                LocalTime.of(10, 0),
                450,
                TipoDoacao.SANGUE_TOTAL,
                "12/8",
                new BigDecimal("13.5"),
                "Sala 1",
                "Responsável Teste",
                null
        );
        doacao = doacaoRepository.save(doacao);
        BolsaSangue bolsa = new BolsaSangue(doacao, "A+", LocalDate.now().minusDays(1), SituacaoBolsa.DISPONIVEL);
        bolsa = bolsaSangueRepository.save(bolsa);

        SolicitacaoRequestDTO dto = new SolicitacaoRequestDTO();
        dto.setInstituicao("Hospital Santa Casa");
        dto.setSetor("UTI");
        dto.setTipoSanguineo("A+");
        dto.setQuantidade(1);
        dto.setPrioridade(PrioridadeSolicitacao.URGENTE);
        dto.setJustificativa("Teste de cancelamento");

        SolicitacaoResponseDTO criada = solicitacaoService.salvar(dto);
        SolicitacaoResponseDTO atendida = solicitacaoService.atender(criada.getId());
        assertEquals(StatusSolicitacao.EM_ATENDIMENTO, atendida.getStatus());

        SolicitacaoResponseDTO cancelada = solicitacaoService.cancelar(criada.getId());
        assertEquals(StatusSolicitacao.CANCELADA, cancelada.getStatus());

        BolsaSangue bolsaPersistida = bolsaSangueRepository.findById(bolsa.getId()).orElseThrow();
        assertEquals(SituacaoBolsa.DISPONIVEL, bolsaPersistida.getSituacao());
        assertEquals(StatusSolicitacao.CANCELADA, solicitacaoRepository.findById(criada.getId()).orElseThrow().getStatus());
    }
}
