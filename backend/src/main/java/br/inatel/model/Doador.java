package br.inatel.model;
import java.time.LocalDate;
import br.inatel.exception.DadosInvalidosException;
import br.inatel.exception.TipoSanguineoException;

public class Doador {
    private static final String[] tipoS_validos = {"O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
    private Long id;
    private String nome;
    private int idade;
    private float peso;
    private String sexo;
    private String cpf;
    private String tipo_sanguineo;
    private String telefone;
    private String cidade;
    private String bairro;
    private LocalDate ultima_doacao;
    private LocalDate proxima_doacao;
    private Boolean apto_doacao;
    private int qtd_doacoes;
    private String observacoes;

    public Doador(Long id, String nome, int idade, float peso, String sexo, String cpf, String tipo_sanguineo, String telefone, String cidade, String bairro, LocalDate ultima_doacao, LocalDate proxima_doacao, Boolean apto_doacao, int qtd_doacoes, String observacoes) {
        validarNome(nome);
        validarIdade(idade);
        validarCpf(cpf);
        validarSexo(sexo);
        validarTipoSanguineo(tipo_sanguineo);
        validarPeso(peso);
        validarDataNaoFutura(ultima_doacao);
        validarQtdDoacoes(qtd_doacoes);

        this.id = id;
        this.nome = nome;
        this.idade = idade;
        this.peso = peso;
        this.sexo = sexo.trim().toLowerCase();
        this.cpf = cpf;
        this.tipo_sanguineo = tipo_sanguineo.trim().toUpperCase();
        this.telefone = telefone;
        this.cidade = cidade;
        this.bairro = bairro;
        this.ultima_doacao = ultima_doacao;
        this.qtd_doacoes = qtd_doacoes;
        this.proxima_doacao = calculoProximaDoacao();
        this.apto_doacao = verificarApto();
        this.observacoes = observacoes;
    }

    //verifica se o doador está apto para doação
    public boolean verificarApto(){
        if(idade<16||idade>69){
            return false;
        }
        if(peso<50){
            return false;
        }
        if(idade>60 && qtd_doacoes==0){
            return false;
        }
        return LocalDate.now().isEqual(proxima_doacao)||LocalDate.now().isAfter(proxima_doacao);
    }

    //calcula a data da próxima doação
    public LocalDate calculoProximaDoacao(){
        if(ultima_doacao==null){
            return LocalDate.now();
        }
        if(sexo.equalsIgnoreCase("masculino")){
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
        this.ultima_doacao = dataDoacao;
        this.qtd_doacoes++;
        this.proxima_doacao = calculoProximaDoacao();
        this.apto_doacao = false;
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

    private void validarIdade(int idade){
        if(idade<0){
            throw new DadosInvalidosException("Idade não pode ser negativa.");
        }
    }

    private void validarSexo(String sexo){
        if(sexo==null || sexo.isBlank()){
            throw new DadosInvalidosException("Sexo não pode ser vazio.");
        }
        if(!sexo.equalsIgnoreCase("masculino") && !sexo.equalsIgnoreCase("feminino")){
            throw new DadosInvalidosException("Sexo inválido.");
        }
    }

    private void validarPeso(float peso){
        if(peso<=0){
            throw new DadosInvalidosException("Peso inválido.");
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
            throw new TipoSanguineoException("Tipo sanguíneo não pode ser vazio.");
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

    public String getTipo_sanguineo() {
        return tipo_sanguineo;
    }

    public void setTipo_sanguineo(String tipo_sanguineo) {
        validarTipoSanguineo(tipo_sanguineo);
        this.tipo_sanguineo = tipo_sanguineo.trim().toUpperCase();
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
        this.proxima_doacao = calculoProximaDoacao();
        this.apto_doacao = verificarApto();
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
        validarQtdDoacoes(qtd_doacoes);
        this.qtd_doacoes = qtd_doacoes;
        this.apto_doacao = verificarApto();
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public int getIdade() {
        return idade;
    }

    public void setIdade(int idade) {
        validarIdade(idade);
        this.idade = idade;
        this.apto_doacao = verificarApto();
    }

    public float getPeso() {
        return peso;
    }

    public void setPeso(float peso) {
        validarPeso(peso);
        this.peso = peso;
        this.apto_doacao = verificarApto();
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        validarSexo(sexo);
        this.sexo = sexo.trim().toLowerCase();
        this.proxima_doacao = calculoProximaDoacao();
        this.apto_doacao = verificarApto();
    }

    public LocalDate getProxima_doacao() {
        return proxima_doacao;
    }

    public void setProxima_doacao(LocalDate proxima_doacao) {
        this.proxima_doacao = proxima_doacao;
    }
}