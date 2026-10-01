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
    void definirStatusInaptoQuandoMenor16(){
        //testa se um doador com data de nascimento fora da faixa permitida recebe status INAPTO
        Doador doador = new Doador(
                1L,
                "Antonio da Silva",
                "123.456.899-00",
                LocalDate.of(2013, 5, 10),
                Sexo.MASCULINO,
                "A+",
                "antoniods@gmail.com",
                "(35)91756-7766",
                "Santa Rita do Sapucaí",
                "Centro",
                null,
                0,
                null
        );
        assertEquals(StatusDoador.INAPTO, doador.getStatus());
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
}
