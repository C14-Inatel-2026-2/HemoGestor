package br.inatel.dto;

import br.inatel.enumeracao.Sexo;
import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;

public class DoadorRequestDTO {
    @NotBlank(message = "Nome não pode ser vazio.")
    private String nome;
    @NotBlank(message = "CPF não pode ser vazio.")
    private String cpf;
    @PastOrPresent(message = "Data de nascimento não pode ser futura.")
    private LocalDate data_nascimento;
    private Sexo sexo;
    private String tipo_sanguineo;
    @Email(message = "E-mail inválido.")
    private String email;
    private String telefone;
    private String cidade;
    private String bairro;
    @PastOrPresent(message = "Última doação não pode ser futura.")
    private LocalDate ultima_doacao;
    @PositiveOrZero(message = "Quantidade de doações não pode ser negativa.")
    private int qtd_doacoes;
    private String observacoes;

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
