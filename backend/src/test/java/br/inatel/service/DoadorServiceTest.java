package br.inatel.service;
import br.inatel.enumeracao.Sexo;
import br.inatel.model.Doador;
import br.inatel.repository.DoadorRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;


public class DoadorServiceTest {
    @Test
    void buscarDoadorPorId(){
        //testa a busca de um doador por Id utilizando um repository simulado
        //verifica se o service retorna corretamente o doador fornecido pelo mock
        //fixture
        DoadorRepository repository = mock(DoadorRepository.class);
        DoadorService service = new DoadorService(repository);

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
        when(repository.buscarPorId(1L)).thenReturn(Optional.of(doador));

        //processamento
        Optional<Doador> resultado = service.buscarPorId(1L);

        //assertiva
        assertTrue(resultado.isPresent());
        assertEquals("Clara Maria de Castro", resultado.get().getNome());

        verify(repository).buscarPorId(1L);
    }

    @Test
    void salvarDoador(){
        //testa o salvamento do doador utilizando um repository simulado
        //verifica se o service retorna o doador salvo e se o metodo salvar do repository foi chamado corretamente
        //fixture
        DoadorRepository repository = mock(DoadorRepository.class);
        DoadorService service = new DoadorService(repository);

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
        when(repository.salvar(doador)).thenReturn(doador);

        //processamento
        Doador resultado = service.salvar(doador);

        //assertiva
        assertEquals(doador, resultado);

        verify(repository).salvar(doador);
    }
}
