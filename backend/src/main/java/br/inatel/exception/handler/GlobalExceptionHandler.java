package br.inatel.exception.handler;

import br.inatel.exception.DadosInvalidosException;
import br.inatel.exception.TipoSanguineoException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

//classe que trata exceções de forma global no api
@RestControllerAdvice
public class GlobalExceptionHandler {
    //trata erros gerados pelo Bean Validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> tratarErrosValidacao(
            MethodArgumentNotValidException exception) {

        //mapa que armazena nome do campo -> mensagem de erro
        Map<String, String> erros = new HashMap<>();

        //percorre erros de validação encontrados
        exception.getBindingResult()
                .getFieldErrors()
                .forEach(erro ->
                        erros.put(
                                erro.getField(),
                                erro.getDefaultMessage()
                        )
                );

        //retorna HTTP 400 com os erros encontrados
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(erros);
    }

    //trata exceções de dados inválidos
    @ExceptionHandler(DadosInvalidosException.class)
    public ResponseEntity<Map<String, String>> tratarDadosInvalidos(
            DadosInvalidosException exception) {

        //resposta com a mensagem da exceção
        Map<String, String> erro = new HashMap<>();
        erro.put("erro", exception.getMessage());

        //retorna HTTP 400 Bad Request
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(erro);
    }

    //trata erros de tipo sanguíneo inválido
    @ExceptionHandler(TipoSanguineoException.class)
    public ResponseEntity<Map<String, String>> tratarTipoSanguineo(
            TipoSanguineoException exception) {

        //resposta com a mensagem da exceção
        Map<String, String> erro = new HashMap<>();
        erro.put("erro", exception.getMessage());

        //retorna HTTP 400 Bad Request
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(erro);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> tratarDadosDuplicados(
            DataIntegrityViolationException exception) {

        Map<String, String> erro = new HashMap<>();
        erro.put("erro", "Já existe um doador cadastrado com esse CPF.");

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(erro);
    }
}
