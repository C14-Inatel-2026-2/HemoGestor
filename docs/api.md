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