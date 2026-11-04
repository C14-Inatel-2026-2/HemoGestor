USE hemogestor;

CREATE TABLE IF NOT EXISTS Doador(
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE,
    sexo ENUM('FEMININO', 'MASCULINO', 'NAO_INFORMADO'),
    tipo_sanguineo VARCHAR(3),
    email VARCHAR(150),
    telefone VARCHAR(20),
    cidade VARCHAR(100),
    bairro VARCHAR(100),
    ultima_doacao DATE,
    status ENUM('APTO', 'AGUARDANDO', 'INAPTO'),
    qtd_doacoes INT NOT NULL DEFAULT 0,
    observacoes TEXT
);

CREATE TABLE IF NOT EXISTS Doacao (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doador_id BIGINT NOT NULL,
    data_coleta DATE NOT NULL,
    hora_coleta TIME NOT NULL,
    volume_ml INT NOT NULL,
    tipo_doacao ENUM('SANGUE_TOTAL', 'PLAQUETA_POR_AFERESE', 'PLASMA') NOT NULL,
    pressao_arterial VARCHAR(20),
    hemoglobina DECIMAL(5,2) NOT NULL,
    sala VARCHAR(100),
    responsavel VARCHAR(150) NOT NULL,
    intercorrencia TEXT,
    status ENUM('EM_TRIAGEM', 'CONCLUIDA', 'DESCARTADA') NOT NULL,

    CONSTRAINT fk_doacao_doador
        FOREIGN KEY (doador_id)
        REFERENCES Doador(id)
);

CREATE TABLE IF NOT EXISTS bolsa_sangue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doacao_id BIGINT NOT NULL UNIQUE,
    tipo_sanguineo VARCHAR(3) NOT NULL,
    data_coleta DATE NOT NULL,
    data_validade DATE NOT NULL,
    situacao ENUM('DISPONIVEL', 'UTILIZADA', 'DESCARTADA') NOT NULL,
    CONSTRAINT fk_bolsa_doacao
        FOREIGN KEY (doacao_id)
        REFERENCES Doacao(id)
);


