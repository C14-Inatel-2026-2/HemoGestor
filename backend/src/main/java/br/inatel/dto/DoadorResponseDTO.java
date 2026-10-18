package br.inatel.dto;

import br.inatel.enumeracao.Sexo;
import br.inatel.enumeracao.StatusDoador;

import java.time.LocalDate;

public class DoadorResponseDTO {
    private Long id;
    private String nome;
    private String cpf;
    private LocalDate data_nascimento;
    private Sexo sexo;
    private String tipo_sanguineo;
    private String email;
    private String telefone;
    private String cidade;
    private String bairro;
    private LocalDate ultima_doacao;
    private StatusDoador status;
    private int qtd_doacoes;
    private String observacoes;

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

    public LocalDate getData_nascimento() {
        return data_nascimento;
    }

    public void setData_nascimento(LocalDate data_nascimento) {
        this.data_nascimento = data_nascimento;
    }

    public Sexo getSexo() {
        return sexo;
    }

    public void setSexo(Sexo sexo) {
        this.sexo = sexo;
    }

    public String getTipo_sanguineo() {
        return tipo_sanguineo;
    }

    public void setTipo_sanguineo(String tipo_sanguineo) {
        this.tipo_sanguineo = tipo_sanguineo;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public StatusDoador getStatus() {
        return status;
    }

    public void setStatus(StatusDoador status) {
        this.status = status;
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

