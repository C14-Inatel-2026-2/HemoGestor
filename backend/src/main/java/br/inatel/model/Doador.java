package br.inatel.model;
import java.time.LocalDate;

public class Doador {
    private Long id;
    private String nome;
    private String cpf;
    private String tipo_sanguineo;
    private String telefone;
    private String cidade;
    private String bairro;
    private LocalDate ultima_doacao;
    private Boolean apto_doacao;
    private int qtd_doacoes;
    private String observacoes;

    public Doador(Long id, String nome, String cpf, String tipo_sanguineo, String telefone, String cidade, String bairro, LocalDate ultima_doacao, Boolean apto_doacao, int qtd_doacoes, String observacoes) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.tipo_sanguineo = tipo_sanguineo;
        this.telefone = telefone;
        this.cidade = cidade;
        this.bairro = bairro;
        this.ultima_doacao = ultima_doacao;
        this.apto_doacao = apto_doacao;
        this.qtd_doacoes = qtd_doacoes;
        this.observacoes = observacoes;
    }

    // verifica se o doador possui qualquer doação registrada
    public boolean doacaoAnterior(){
        return ultima_doacao != null;
    }

    // registra nova doação e atualiza os dados do doador
    public void registrarDoacao(LocalDate dataDoacao){
        this.ultima_doacao = dataDoacao;
        this.apto_doacao = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getTipo_sanguineo() {
        return tipo_sanguineo;
    }

    public void setTipo_sanguineo(String tipo_sanguineo) {
        this.tipo_sanguineo = tipo_sanguineo;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public LocalDate getUltima_doacao() {
        return ultima_doacao;
    }

    public void setUltima_doacao(LocalDate ultima_doacao) {
        this.ultima_doacao = ultima_doacao;
    }

    public Boolean getApto_doacao() {
        return apto_doacao;
    }

    public void setApto_doacao(Boolean apto_doacao) {
        this.apto_doacao = apto_doacao;
    }

    public int getQtd_doacoes() {
        return qtd_doacoes;
    }

    public void setQtd_doacoes(int qtd_doacoes) {
        this.qtd_doacoes = qtd_doacoes;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}