package br.inatel.exception.handler;

import br.inatel.exception.*;
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
    private ResponseEntity<Map<String, String>> criarRespostaErro(
            HttpStatus status,
            String mensagem) {
        return ResponseEntity.status(status)
                .body(Map.of("erro", mensagem));
    }

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
        //retorna HTTP 400 Bad Request
        return criarRespostaErro(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    //trata erros de tipo sanguíneo inválido
    @ExceptionHandler(TipoSanguineoException.class)
    public ResponseEntity<Map<String, String>> tratarTipoSanguineo(
            TipoSanguineoException exception) {
        //retorna HTTP 400 Bad Request
        return criarRespostaErro(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> tratarIntegridadeDados(
            DataIntegrityViolationException exception) {

        return criarRespostaErro(HttpStatus.CONFLICT, "Não foi possível concluir a operação devido a um conflito de integridade dos dados.");
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<Map<String, String>> tratarConflito(ConflitoException exception){
        return criarRespostaErro(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> tratarIllegalStateException(IllegalStateException exception) {
        return criarRespostaErro(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(BolsaNaoEncontradaException.class)
    public ResponseEntity<Map<String, String>> tratarBolsaNaoEncontrada(BolsaNaoEncontradaException ex) {
        return criarRespostaErro(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(SolicitacaoNaoEncontradaException.class)
    public ResponseEntity<Map<String, String>> handleSolicitacaoNaoEncontrada(SolicitacaoNaoEncontradaException ex) {
        return criarRespostaErro(HttpStatus.NOT_FOUND, ex.getMessage());
    }
}
