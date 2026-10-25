package br.inatel.service;
import br.inatel.enumeracao.Sexo;
import br.inatel.model.Doador;
import br.inatel.repository.DoadorRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
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
        when(repository.findById(1L)).thenReturn(Optional.of(doador));

        //processamento
        Optional<Doador> resultado = service.buscarPorId(1L);

        //assertiva
        assertTrue(resultado.isPresent());
        assertEquals("Clara Maria de Castro", resultado.get().getNome());

        verify(repository).findById(1L);
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
        when(repository.save(doador)).thenReturn(doador);

        //processamento
        Doador resultado = service.salvar(doador);

        //assertiva
        assertEquals(doador, resultado);

        verify(repository).save(doador);
    }

    @Test
    void listarTodosOsDoadores() {
        // fixture
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

        when(repository.findAll()).thenReturn(List.of(doador));

        // processamento
        List<Doador> resultado = service.listarTodos();

        // assertiva
        assertEquals(1, resultado.size());
        assertEquals("Clara Maria de Castro", resultado.get(0).getNome());

        verify(repository).findAll();
    }

    @Test
    void deletarDoador() {
        // fixture
        DoadorRepository repository = mock(DoadorRepository.class);
        DoadorService service = new DoadorService(repository);

        // processamento
        service.deletar(1L);

        // assertiva
        verify(repository).deleteById(1L);
    }

    @Test
    void atualizarDoador() {
        // fixture
        DoadorRepository repository = mock(DoadorRepository.class);
        DoadorService service = new DoadorService(repository);

        Doador doadorExistente = new Doador(
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

        Doador novosDados = new Doador(
                null,
                "Clara Atualizada",
                "123.456.789-00",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "A+",
                "clara.atualizada@gmail.com",
                "(35)99999-9999",
                "Pouso Alegre",
                "Centro",
                null,
                2,
                "Dados atualizados"
        );

        when(repository.findById(1L)).thenReturn(Optional.of(doadorExistente));
        when(repository.save(any(Doador.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // processamento
        Optional<Doador> resultado = service.atualizar(1L, novosDados);

        // assertivas
        assertTrue(resultado.isPresent());
        assertEquals("Clara Atualizada", resultado.get().getNome());
        assertEquals("A+", resultado.get().getTipo_sanguineo());
        assertEquals("clara.atualizada@gmail.com", resultado.get().getEmail());
        assertEquals("Pouso Alegre", resultado.get().getCidade());
        assertEquals(2, resultado.get().getQtd_doacoes());
        assertEquals("Dados atualizados", resultado.get().getObservacoes());

        verify(repository).findById(1L);
        verify(repository).save(doadorExistente);
    }

    @Test
    void atualizarDoadorInexistente() {
        // fixture
        DoadorRepository repository = mock(DoadorRepository.class);
        DoadorService service = new DoadorService(repository);

        Doador novosDados = new Doador(
                null,
                "Clara Atualizada",
                "123.456.789-00",
                LocalDate.of(2000, 5, 10),
                Sexo.FEMININO,
                "A+",
                "clara.atualizada@gmail.com",
                "(35)99999-9999",
                "Pouso Alegre",
                "Centro",
                null,
                2,
                null
        );

        when(repository.findById(99L)).thenReturn(Optional.empty());

        // processamento
        Optional<Doador> resultado = service.atualizar(99L, novosDados);

        // assertivas
        assertTrue(resultado.isEmpty());

        verify(repository).findById(99L);
        verify(repository, never()).save(any(Doador.class));
    }
}
