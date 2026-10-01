package br.inatel.model;
import java.time.LocalDate;
import java.time.Period;

import br.inatel.enumeracao.Sexo;
import br.inatel.enumeracao.StatusDoador;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.exception.TipoSanguineoException;

public class Doador {
    private static final String[] tipoS_validos = {"O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
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

    public Doador(Long id, String nome, String cpf, LocalDate data_nascimento, Sexo sexo, String tipo_sanguineo, String email, String telefone, String cidade, String bairro, LocalDate ultima_doacao, int qtd_doacoes, String observacoes) {
        validarNome(nome);
        validarCpf(cpf);
        validarDataNascimento(data_nascimento);
        validarTipoSanguineo(tipo_sanguineo);
        validarDataNaoFutura(ultima_doacao);
        validarQtdDoacoes(qtd_doacoes);
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.data_nascimento = data_nascimento;
        //sexo pode ser nulo
        if (sexo == null) {
            this.sexo = Sexo.NAO_INFORMADO;
        } else {
            this.sexo = sexo;
        }
        // tipo sanguíneo pode ser nulo
        if (tipo_sanguineo == null || tipo_sanguineo.isBlank()) {
            this.tipo_sanguineo = null;
        } else {
            this.tipo_sanguineo = tipo_sanguineo.trim().toUpperCase();
        }
        this.email = email;
        this.telefone = telefone;
        this.cidade = cidade;
        this.bairro = bairro;
        this.ultima_doacao = ultima_doacao;
        this.qtd_doacoes = qtd_doacoes;
        this.observacoes = observacoes;
        this.status = verificarStatus();
    }

    public int calculoIdade(){
        if(data_nascimento==null){
            return 0;
        }
        return Period.between(data_nascimento, LocalDate.now()).getYears();
    }

    //verifica a situação do doador
    public StatusDoador verificarStatus(){
        if(data_nascimento!=null){
            int idade = calculoIdade();
            if(idade<16||idade>69){
                return StatusDoador.INAPTO;
            }
        }
        //se nunca realizou doação
        if(ultima_doacao==null){
            return StatusDoador.APTO;
        }
        LocalDate proxima_doacao = calculoProximaDoacao();

        //se ainda não chegou na data de doação
        if(LocalDate.now().isBefore(proxima_doacao)){
            return StatusDoador.AGUARDANDO;
        }
        return StatusDoador.APTO;
    }

    //calcula a data da próxima doação
    public LocalDate calculoProximaDoacao(){
        if(ultima_doacao==null){
            return LocalDate.now();
        }
        if(sexo == Sexo.MASCULINO){
            return ultima_doacao.plusDays(60);
        }
        return ultima_doacao.plusDays(90);
    }

    // verifica se o doador possui qualquer doação registrada
    public boolean doacaoAnterior(){
        return ultima_doacao != null;
    }

    // registra nova doação e atualiza os dados do doador
    public void registrarDoacao(LocalDate dataDoacao){
        validarDataNaoFutura(dataDoacao);
        if(dataDoacao==null){
            throw new DadosInvalidosException("Data da doação não pode ser vazia.");
        }
        this.ultima_doacao = dataDoacao;
        this.qtd_doacoes++;

        //depois de doar, o status é alterado
        this.status = verificarStatus();
    }

    //validações dos dados
    private void validarNome(String nome){
        if(nome == null || nome.isBlank()){
            throw new DadosInvalidosException("Nome não pode ser vazio.");
        }
    }

    private void validarCpf(String cpf){
        if(cpf == null || cpf.isBlank()){
            throw new DadosInvalidosException("CPF não pode ser vazio.");
        }
    }

    private void validarDataNascimento(LocalDate data_nascimento){
        if(data_nascimento != null && data_nascimento.isAfter(LocalDate.now())){
            throw new DadosInvalidosException("Data de nascimento não pode ser futura.");
        }
    }

    private void validarDataNaoFutura(LocalDate data){
        if(data!=null && data.isAfter(LocalDate.now())){
            throw new DadosInvalidosException("A data não pode ser futura.");
        }
    }

    private void validarQtdDoacoes(int qtd_doacoes){
        if(qtd_doacoes<0){
            throw new DadosInvalidosException("Quantidade de doações não pode ser negativa.");
        }
    }

    private void validarTipoSanguineo(String tipo_sanguineo){
        if(tipo_sanguineo==null || tipo_sanguineo.isBlank()){
            return;
        }

        String tipoS = tipo_sanguineo.trim().toUpperCase();
        boolean valido = false;

        for(String tipoValido: tipoS_validos){
            if(tipoValido.equals(tipoS)){
                valido = true;
                break;
            }
        }
        if(!valido){
            throw new TipoSanguineoException("Tipo sanguíneo inválido.");
        }

    }

    //getters e setters

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
        validarNome(nome);
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        validarCpf(cpf);
        this.cpf = cpf;
    }

    public LocalDate getData_nascimento() {
        return data_nascimento;
    }

    public void setData_nascimento(LocalDate data_nascimento) {
        validarDataNascimento(data_nascimento);
        this.data_nascimento = data_nascimento;
        this.status = verificarStatus();
    }

    public Sexo getSexo() {
        return sexo;
    }

    public void setSexo(Sexo sexo) {
        if (sexo == null) {
            this.sexo = Sexo.NAO_INFORMADO;
        } else {
            this.sexo = sexo;
        }
        this.status = verificarStatus();
    }

    public String getTipo_sanguineo() {
        return tipo_sanguineo;
    }

    public void setTipo_sanguineo(String tipo_sanguineo) {
        validarTipoSanguineo(tipo_sanguineo);
        if (tipo_sanguineo == null || tipo_sanguineo.isBlank()) {
            this.tipo_sanguineo = null;
        }
        else {
            this.tipo_sanguineo = tipo_sanguineo.trim().toUpperCase();
        }
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
        validarDataNaoFutura(ultima_doacao);
        this.ultima_doacao = ultima_doacao;
        this.status = verificarStatus();
    }

    public StatusDoador getStatus() {
        return status;
    }
    //não tem o setter de status porque é automático

    public int getQtd_doacoes() {
        return qtd_doacoes;
    }

    public void setQtd_doacoes(int qtd_doacoes) {
        validarQtdDoacoes(qtd_doacoes);
        this.qtd_doacoes = qtd_doacoes;
        this.status = verificarStatus();
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}