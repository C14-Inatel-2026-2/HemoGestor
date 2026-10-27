package br.inatel.model;
import br.inatel.enumeracao.StatusDoador;
import br.inatel.enumeracao.Sexo;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.exception.TipoSanguineoException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

public class DoadorTest {
    @Test
    void criarDoadorAptoSemDoacaoAntes(){
        //testa a criação de um doador válido que não realizou doações
        // verifica se o status calculado é APTO e se o metodo doacaAnterior retorna false quando ultima_doacao é null
        //fixture
        Doador doador = new Doador(
                1L,
                "Clara Maria de Castro",
                "123.456.789-00",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "O+",
                "claramcastro@gmail.com",
                "(35)98989-7766",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );

        //processamento
        StatusDoador status = doador.getStatus();

        //assertiva
        assertEquals(StatusDoador.APTO, status);
        assertFalse(doador.doacaoAnterior());
    }

    @Test
    void lancaExceptionQuandoCPFvazio(){
        //testa a criação de um doador com CPF vazio
        //verfica se a classe lança a exception DadosInvalidosException, o que impede a criação de um doador com dado obrigatorio invalido
        assertThrows(
                DadosInvalidosException.class, ()-> new Doador(
                        1L,
                        "Clara Maria de Castro",
                        "",
                        LocalDate.of(2000, 5, 10),
                        Sexo.FEMININO,
                        "O+",
                        "claramcastro@gmail.com",
                        "(35)98989-7766",
                        "Santa Rita do Sapucaí",
                        "Centro",
                        null,
                        0,
                        null
                )
        );
    }

    @Test
    void registrarNovaDoacao(){
        //testa se o registro de uma nova doacao atualiza corretamente:
        // a ultima doacao, a quantidade de doacoes e o status do doador
        Doador doador = new Doador(
                1L,
                "Clara Maria de Castro",
                "123.456.789-00",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "O+",
                "claramcastro@gmail.com",
                "(35)98989-7766",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );

        LocalDate dataDoacao = LocalDate.now();
        doador.registrarDoacao(dataDoacao);

        assertEquals(dataDoacao, doador.getUltima_doacao());
        assertEquals(1, doador.getQtd_doacoes());
        assertTrue(doador.doacaoAnterior());
        assertEquals(StatusDoador.AGUARDANDO, doador.getStatus());
    }

    @Test
    void lancaExceptionQuandoTipoSanguineoInvalido(){
        //testa se um tipo sanguineo inválido é rejeitado pela classe Doador
        assertThrows(TipoSanguineoException.class, ()-> new Doador(
                1L,
                "Antonio da Silva",
                "123.456.899-00",
                LocalDate.of(1988, 12, 24),
                Sexo.MASCULINO,
                "X+",
                "antoniods@gmail.com",
                "(35)91756-7766",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
                )
        );
    }

    @Test
    void definirComoInaptoDoadorMenor16Anos() {

        Doador doador = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.now().minusYears(15),
                Sexo.FEMININO,
                "O+",
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        assertEquals(StatusDoador.INAPTO, doador.getStatus());
    }

    @Test
    void definirComoInaptoDoadorMaior69Anos() {

        Doador doador = new Doador(
                null,
                "João Silva",
                "12345678900",
                LocalDate.now().minusYears(70),
                Sexo.MASCULINO,
                "A+",
                "joao@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        assertEquals(StatusDoador.INAPTO, doador.getStatus());
    }

    @Test
    void definirComoAptoDoadorCom16AnosSemDoacaoAnterior() {

        Doador doador = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.now().minusYears(16),
                Sexo.FEMININO,
                "O+",
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        assertEquals(StatusDoador.APTO, doador.getStatus());
    }

    @Test
    void definirComoAptoDoadorCom69AnosSemDoacaoAnterior() {

        Doador doador = new Doador(
                null,
                "João Silva",
                "12345678900",
                LocalDate.now().minusYears(69),
                Sexo.MASCULINO,
                "A+",
                "joao@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        assertEquals(StatusDoador.APTO, doador.getStatus());
    }

    @Test
    void calcularProximaDoacaoMasculinoEm60Dias() {

        LocalDate ultimaDoacao = LocalDate.now().minusDays(10);

        Doador doador = new Doador(
                null,
                "João Silva",
                "12345678900",
                LocalDate.now().minusYears(30),
                Sexo.MASCULINO,
                "A+",
                "joao@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                ultimaDoacao,
                1,
                null
        );

        assertEquals(
                ultimaDoacao.plusDays(60),
                doador.calculoProximaDoacao()
        );
    }

    @Test
    void calcularProximaDoacaoFemininoEm90Dias() {

        LocalDate ultimaDoacao = LocalDate.now().minusDays(10);

        Doador doador = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.now().minusYears(25),
                Sexo.FEMININO,
                "O+",
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                ultimaDoacao,
                1,
                null
        );

        assertEquals(
                ultimaDoacao.plusDays(90),
                doador.calculoProximaDoacao()
        );
    }

    @Test
    void retornarDataAtualQuandoNaoHaDoacaoAnterior() {

        Doador doador = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.now().minusYears(25),
                Sexo.FEMININO,
                "O+",
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        assertEquals(
                LocalDate.now(),
                doador.calculoProximaDoacao()
        );
    }

    @Test
    void naoRegistrarDoacaoComDataFutura() {

        Doador doador = new Doador(
                1L,
                "Clara Maria de Castro",
                "123.456.789-00",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "O+",
                "claramcastro@gmail.com",
                "(35)98989-7766",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );

        assertThrows(
                DadosInvalidosException.class,
                () -> doador.registrarDoacao(LocalDate.now().plusDays(1))
        );
    }

    @Test
    void naoRegistrarDoacaoComDataNull() {

        Doador doador = new Doador(
                1L,
                "Clara Maria de Castro",
                "123.456.789-00",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "O+",
                "claramcastro@gmail.com",
                "(35)98989-7766",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );

        DadosInvalidosException exception = assertThrows(
                DadosInvalidosException.class,
                () -> doador.registrarDoacao(null)
        );

        assertEquals(
                "Data da doação não pode ser vazia.",
                exception.getMessage()
        );
    }

    @Test
    void naoCriarDoadorComDataNascimentoFutura() {

        assertThrows(
                DadosInvalidosException.class,
                () -> new Doador(
                        null,
                        "Ana Souza",
                        "52998224725",
                        LocalDate.now().plusDays(1),
                        Sexo.FEMININO,
                        "O+",
                        "ana@email.com",
                        "35999999999",
                        "Pouso Alegre",
                        "Centro",
                        null,
                        0,
                        null
                )
        );
    }

    @Test
    void naoCriarDoadorComQuantidadeDeDoacoesNegativa() {

        assertThrows(
                DadosInvalidosException.class,
                () -> new Doador(
                        null,
                        "Ana Souza",
                        "52998224725",
                        LocalDate.now().minusYears(25),
                        Sexo.FEMININO,
                        "O+",
                        "ana@email.com",
                        "35999999999",
                        "Pouso Alegre",
                        "Centro",
                        null,
                        -1,
                        null
                )
        );
    }

    @Test
    void naoCriarDoadorComNomeVazio() {

        assertThrows(
                DadosInvalidosException.class,
                () -> new Doador(
                        null,
                        "",
                        "52998224725",
                        LocalDate.now().minusYears(25),
                        Sexo.FEMININO,
                        "O+",
                        "ana@email.com",
                        "35999999999",
                        "Pouso Alegre",
                        "Centro",
                        null,
                        0,
                        null
                )
        );
    }

    @Test
    void definirSexoComoNaoInformadoQuandoSexoForNull() {

        Doador doador = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.now().minusYears(25),
                null,
                "O+",
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        assertEquals(Sexo.NAO_INFORMADO, doador.getSexo());
    }

    @Test
    void definirTipoSanguineoComoNullQuandoNaoInformado() {

        Doador doador = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.now().minusYears(25),
                Sexo.FEMININO,
                null,
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        assertNull(doador.getTipo_sanguineo());
    }

    @Test
    void definirTipoSanguineoComoNullQuandoEmBranco() {

        Doador doador = new Doador(
                null,
                "Ana Souza",
                "52998224725",
                LocalDate.now().minusYears(25),
                Sexo.FEMININO,
                "   ",
                "ana@email.com",
                "35999999999",
                "Pouso Alegre",
                "Centro",
                null,
                0,
                null
        );

        assertNull(doador.getTipo_sanguineo());
    }
}
