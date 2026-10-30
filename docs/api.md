# Contratos da API - HemoGestor

Este documento descreve os endpoints disponíveis no backend do HemoGestor e os contratos de dados utilizados na comunicação com o frontend.

## Health Check

### GET `/api/health`

Verifica se o backend está em execução.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `OK`

---

## Doadores

Os endpoints de doadores utilizam dois contratos principais: `DoadorRequest` e `DoadorResponse`.

### DoadorRequest

Utilizado nas requisições de cadastro e atualização de doadores.

```json
{
  "nome": "string",
  "cpf": "string",
  "data_nascimento": "YYYY-MM-DD",
  "sexo": "FEMININO | MASCULINO | NAO_INFORMADO",
  "tipo_sanguineo": "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-",
  "email": "string",
  "telefone": "string",
  "cidade": "string",
  "bairro": "string",
  "ultima_doacao": "YYYY-MM-DD",
  "qtd_doacoes": 0,
  "observacoes": "string"
}
```

### DoadorResponse

Retornado pelo backend nas operações de consulta, cadastro e atualização.

```json
{
  "id": 1,
  "nome": "string",
  "cpf": "string",
  "data_nascimento": "YYYY-MM-DD",
  "sexo": "FEMININO | MASCULINO | NAO_INFORMADO",
  "tipo_sanguineo": "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-",
  "email": "string",
  "telefone": "string",
  "cidade": "string",
  "bairro": "string",
  "ultima_doacao": "YYYY-MM-DD",
  "status": "APTO | AGUARDANDO | INAPTO",
  "qtd_doacoes": 0,
  "observacoes": "string"
}
```

---

## Endpoints de Doadores

### POST `/doadores`

Cadastra um novo doador.

**Corpo da requisição:**

Utiliza o contrato `DoadorRequest`.

**Resposta de sucesso:**

- Status: `201 Created`
- Corpo: `DoadorResponse`

---

### PUT `/doadores/{id}`

Atualiza os dados de um doador existente.

**Parâmetro de rota:**

- `id`: identificador do doador.

**Corpo da requisição:**

Utiliza o contrato `DoadorRequest`.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `DoadorResponse`

**Possível resposta de erro:**

- Status: `404 Not Found`, caso o doador não seja encontrado.

---

### GET `/doadores`

Lista todos os doadores cadastrados.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: lista de `DoadorResponse`.

---

### GET `/doadores/{id}`

Busca um doador pelo identificador.

**Parâmetro de rota:**

- `id`: identificador do doador.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `DoadorResponse`

**Possível resposta de erro:**

- Status: `404 Not Found`, caso o doador não seja encontrado.

---

### DELETE `/doadores/{id}`

Remove um doador pelo identificador.

**Parâmetro de rota:**

- `id`: identificador do doador.

**Resposta de sucesso:**

- Status: `204 No Content`

**Possível resposta de erro:**

- Status: `404 Not Found`, caso o doador não seja encontrado.

---

## Doações

Os endpoints de doações utilizam dois contratos principais: `DoacaoRequestDTO` e `DoacaoResponseDTO`.

### DoacaoRequestDTO

Utilizado no cadastro de novas doações.

```json
{
  "doadorId": 1,
  "dataColeta": "YYYY-MM-DD",
  "horaColeta": "HH:mm:ss",
  "volume_ml": 450,
  "tipoDoacao": "SANGUE_TOTAL | PLAQUETAS_POR_AFERESE | PLASMA",
  "pressaoArterial": "120/80",
  "hemoglobina": 14.2,
  "sala": "string",
  "responsavel": "string",
  "intercorrencia": "string"
}
```

### DoacaoResponseDTO

Retornado pelo backend nas operações de cadastro e consulta.

```json
{
  "id": 1,
  "doadorId": 1,
  "nomeDoador": "string",
  "tipoSanguineo": "O+",
  "dataColeta": "YYYY-MM-DD",
  "horaColeta": "HH:mm:ss",
  "volume_ml": 450,
  "tipoDoacao": "SANGUE_TOTAL",
  "pressaoArterial": "120/80",
  "hemoglobina": 14.2,
  "sala": "string",
  "responsavel": "string",
  "intercorrencia": "string",
  "status": "EM_TRIAGEM | CONCLUIDA | DESCARTADA"
}
```

## Endpoints de Doações

### POST `/doacoes`

Registra uma nova doação associada a um doador cadastrado.

**Corpo da requisição:**

Utiliza o contrato `DoacaoRequestDTO`.

**Resposta de sucesso:**

- Status: `201 Created`
- Corpo: `DoacaoResponseDTO`

**Possíveis respostas de erro:**

- Status: `400 Bad Request`, quando algum campo obrigatório é inválido ou não foi informado.
- Status: `400 Bad Request`, quando o doador não respeita o intervalo mínimo entre doações ou o limite permitido nos últimos 12 meses.
- Status: `404 Not Found`, quando o doador informado não é encontrado.

Exemplo de erro de validação de campo:

```json
{
  "responsavel": "Responsável não pode ser vazio."
}
```

Exemplo de erro de regra de negócio:

```json
{
  "erro": "Ana Souza só poderá doar novamente a partir de 30/10/2026."
}
```

Exemplo de doador inexistente:

```json
{
  "erro": "Doador não encontrado."
}
```

> A API utiliza dois formatos de erro: validações de campos retornam um mapa no formato `campo -> mensagem`, enquanto regras de negócio retornam `{"erro": "mensagem"}`.

---

### GET `/doacoes`

Lista todas as doações cadastradas.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: lista de `DoacaoResponseDTO`.

---

### GET `/doacoes/{id}`

Busca uma doação pelo identificador.

**Parâmetro de rota:**

- `id`: identificador da doação.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `DoacaoResponseDTO`

**Possível resposta de erro:**

- Status: `404 Not Found`, caso a doação não seja encontrada.

---

### GET `/doacoes/doador/{doadorId}`

Consulta as doações associadas a um doador específico.

**Parâmetro de rota:**

- `doadorId`: identificador do doador.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: lista de `DoacaoResponseDTO`.

Caso o doador não possua doações registradas, é retornada uma lista vazia.

---

### PATCH `/doacoes/{id}/concluir`

Altera o status da doação para `CONCLUIDA`.

Ao concluir uma doação, os dados do doador associado também são atualizados:

- `ultima_doacao` recebe a data da coleta;
- `qtd_doacoes` é incrementada;
- o status do doador é recalculado.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `DoacaoResponseDTO`

**Possível resposta de erro:**

- Status: `404 Not Found`, caso a doação não seja encontrada.

---

### PATCH `/doacoes/{id}/descartar`

Altera o status da doação para `DESCARTADA`.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `DoacaoResponseDTO`

**Possível resposta de erro:**

- Status: `404 Not Found`, caso a doação não seja encontrada.

## Tipos utilizados no frontend

Os tipos TypeScript relacionados a doadores estão definidos em:

`frontend/src/types/doador.ts`

Os principais tipos utilizados são:

- `TipoSanguineo`
- `StatusDoador`
- `Sexo`
- `DoadorRequest`
- `DoadorResponse`

O tipo `Doador` é mantido como alias de `DoadorResponse` para preservar compatibilidade com o código existente.