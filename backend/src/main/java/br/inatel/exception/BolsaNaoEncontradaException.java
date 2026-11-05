package br.inatel.exception;

public class BolsaNaoEncontradaException extends RuntimeException {
    public BolsaNaoEncontradaException(String message) {
        super(message);
    }
}
