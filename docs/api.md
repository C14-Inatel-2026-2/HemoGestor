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

**Campos obrigatórios:**

- `nome`
- `cpf`
- `data_nascimento`
- `tipo_sanguineo`

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

**Possível resposta de erro:**

- Status: `400 Bad Request`, quando algum campo obrigatório é inválido ou não foi informado.

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

**Possíveid respostas de erro:**

- Status: `404 Not Found`, caso o doador não seja encontrado.
- Status: `409 Conflict`, caso o doador possua doações registradas e não possa ser removido.

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
  "tipoDoacao": "SANGUE_TOTAL | PLAQUETA_POR_AFERESE | PLASMA",
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

Caso o doador não possua doações registradas, é retornada uma mensagem informativa:
```json
{
  "mensagem": "Não existem doações registradas para este doador."
}
```

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
- Status: `409 Conflict`, caso a doação não esteja em triagem.

---

### PATCH `/doacoes/{id}/descartar`

Altera o status da doação para `DESCARTADA`.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `DoacaoResponseDTO`

**Possível resposta de erro:**

- Status: `404 Not Found`, caso a doação não seja encontrada.
- Status: `409 Conflict`, caso a doação não esteja em triagem.


## Bolsas de Sangue

### Listar todas as bolsas

**GET** `/bolsas`

Retorna todas as bolsas cadastradas no estoque.

**Resposta de sucesso:**

```json
[
  {
    "id": 1,
    "doacaoId": 3,
    "tipoSanguineo": "O+",
    "dataColeta": "2026-11-03",
    "dataValidade": "2026-12-08",
    "situacao": "DISPONIVEL",
    "vencida": false
  }
]
```
Caso não existam bolsas cadastradas:
```json
{
  "mensagem": "Não existem bolsas cadastradas."
}
```

---

### Filtrar bolsas por tipo sanguíneo

**GET** `/bolsas/tipo?tipoSanguineo={tipo}`
Exemplo:

```text
GET /bolsas/tipo?tipoSanguineo=O+
```

Retorna as bolsas correspondentes ao tipo sanguíneo informado.

Caso não existam bolsas do tipo informado:
```json
{
  "mensagem": "Não existem bolsas cadastradas para este tipo sanguíneo."
}
```

---

### Listar bolsas válidas

**GET** `/bolsas/validas`

Retorna somente as bolsas cuja data de validade ainda não foi ultrapassada.

Caso não existam bolsas válidas:
```json
{
  "mensagem": "Não existem bolsas válidas cadastradas."
}
```

---

### Listar bolsas vencidas

**GET** `/bolsas/vencidas`

Retorna somente as bolsas cuja data de validade já foi ultrapassada.

Caso não existam bolsas vencidas:
```json
{
  "mensagem": "Não existem bolsas vencidas cadastradas."
}
```

---

### Filtrar bolsas por situação

**GET** `/bolsas/situacao?situacao={situacao}`

Situações disponíveis:

```text
DISPONIVEL
UTILIZADA
DESCARTADA
```

Exemplo:
```text
GET /bolsas/situacao?situacao=DISPONIVEL
```

Retorna as bolsas correspondentes à situação informada.

Caso não existam bolsas com a situação informada:
```json
{
  "mensagem": "Não existem bolsas cadastradas com esta situação."
}
```

---

### Regras de validade das bolsas

A data de validade é calculada automaticamente no momento da geração da bolsa:

- `SANGUE_TOTAL`: 35 dias após a coleta;
- `PLAQUETA_POR_AFERESE`: 5 dias após a coleta;
- `PLASMA`: 365 dias após a coleta.

A condição de bolsa vencida não é armazenada como uma situação no banco de dados. Ela é calculada dinamicamente a partir da `dataValidade`.

---

### Geração da bolsa

A bolsa é criada automaticamente quando uma doação é concluída.

A bolsa é inicialmente registrada com a situação:

```text
DISPONIVEL
```

Os principais dados retornados na consulta são:
```text
id
doacaoId
tipoSanguineo
dataColeta
dataValidade
situacao
vencida
```

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

---

## Bolsas

As bolsas representam o sangue coletado e armazenado no estoque. Uma bolsa é criada automaticamente pelo backend quando uma doação é concluída (`PATCH /doacoes/{id}/concluir`). Por isso, não existe endpoint de cadastro de bolsas.

### BolsaResponse

Retornado pelo backend nas operações de consulta e de descarte.

```json
{
  "id": 1,
  "doacaoId": 1,
  "doadorId": 1,
  "nomeDoador": "string",
  "tipoSanguineo": "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-",
  "tipoDoacao": "SANGUE_TOTAL | PLAQUETA_POR_AFERESE | PLASMA",
  "volume_ml": 450,
  "dataColeta": "YYYY-MM-DD",
  "dataValidade": "YYYY-MM-DD",
  "status": "DISPONIVEL | RESERVADA | UTILIZADA | DESCARTADA"
}
```

### Regras das bolsas

- Cada doação concluída gera exatamente uma bolsa. Doações descartadas não geram bolsa.
- A bolsa herda o tipo sanguíneo do doador, o tipo de doação, o volume e a data de coleta da doação.
- A data de validade é calculada a partir da data de coleta, conforme o tipo de doação:

| Tipo de doação | Validade |
|---|---|
| `SANGUE_TOTAL` | 35 dias |
| `PLAQUETA_POR_AFERESE` | 5 dias |
| `PLASMA` | 365 dias |

- Toda bolsa nasce com o status `DISPONIVEL`.
- `RESERVADA` e `UTILIZADA` são definidos pelo fluxo de solicitações.
- "Vencida" não é um status armazenado: uma bolsa está vencida quando `dataValidade` é anterior à data atual. O frontend faz essa verificação na exibição.

---

## Endpoints de Bolsas

### GET `/bolsas`

Lista todas as bolsas cadastradas, ordenadas pela data de validade (da mais próxima para a mais distante).

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: lista de `BolsaResponse`. Caso não existam bolsas, é retornada uma lista vazia.

---

### GET `/bolsas/{id}`

Busca uma bolsa pelo identificador.

**Parâmetro de rota:**

- `id`: identificador da bolsa.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `BolsaResponse`

**Possível resposta de erro:**

- Status: `404 Not Found`, caso a bolsa não seja encontrada.

---

### PATCH `/bolsas/{id}/descartar`

Altera o status da bolsa para `DESCARTADA`. É usado, por exemplo, para retirar do estoque uma bolsa vencida ou com problema na qualidade.

**Parâmetro de rota:**

- `id`: identificador da bolsa.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `BolsaResponse`

**Possíveis respostas de erro:**

- Status: `404 Not Found`, caso a bolsa não seja encontrada.
- Status: `409 Conflict`, caso a bolsa não esteja disponível.

```json
{
  "erro": "Só é possível descartar bolsas disponíveis."
}
```

---

## Alteração em PATCH `/doacoes/{id}/concluir`

Além de atualizar os dados do doador, a conclusão de uma doação passa a gerar uma bolsa no estoque, seguindo as regras da seção de Bolsas.

**Nova resposta de erro:**

- Status: `400 Bad Request`, caso o doador não tenha tipo sanguíneo informado, porque a bolsa não pode ser gerada sem ele.

```json
{
  "erro": "Informe o tipo sanguíneo do doador antes de concluir a doação."
}
```

---

## Tipos de bolsa utilizados no frontend

Os tipos TypeScript relacionados a bolsas ficam em `frontend/src/types/bolsa.ts`:

```ts
import type { TipoDoacao } from './doacao'
import type { TipoSanguineo } from './doador'

export type StatusBolsa =
  | 'DISPONIVEL'
  | 'RESERVADA'
  | 'UTILIZADA'
  | 'DESCARTADA'

export interface BolsaResponse {
  id: number
  doacaoId: number
  doadorId: number
  nomeDoador: string
  tipoSanguineo: TipoSanguineo
  tipoDoacao: TipoDoacao
  volume_ml: number
  dataColeta: string
  dataValidade: string
  status: StatusBolsa
}

export type Bolsa = BolsaResponse
```
---

## Solicitações

As solicitações representam os pedidos de bolsas de sangue feitos por instituições de saúde. Uma solicitação pede uma quantidade de bolsas de um tipo sanguíneo e é atendida com bolsas de sangue total compatíveis que estejam disponíveis no estoque.

### SolicitacaoRequest

Utilizado no cadastro de novas solicitações.

```json
{
  "instituicao": "string",
  "setor": "string",
  "tipoSanguineo": "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-",
  "quantidade": 2,
  "prioridade": "NORMAL | URGENTE | EMERGENCIA",
  "justificativa": "string"
}
```

Campos obrigatórios: `instituicao`, `tipoSanguineo`, `quantidade` (maior que zero) e `prioridade`.

### SolicitacaoResponse

Retornado pelo backend nas operações de cadastro, consulta e mudança de status.

```json
{
  "id": 1,
  "instituicao": "string",
  "setor": "string",
  "tipoSanguineo": "A+",
  "quantidade": 2,
  "prioridade": "NORMAL | URGENTE | EMERGENCIA",
  "justificativa": "string",
  "dataSolicitacao": "YYYY-MM-DDTHH:mm:ss",
  "status": "PENDENTE | EM_ATENDIMENTO | ATENDIDA | CANCELADA",
  "bolsasReservadas": [3, 7],
  "bolsasCompativeisDisponiveis": 4
}
```

- `dataSolicitacao` é preenchida pelo backend no momento do cadastro.
- `bolsasReservadas` traz os ids das bolsas separadas para a solicitação (lista vazia enquanto ela está pendente).
- `bolsasCompativeisDisponiveis` informa quantas bolsas compatíveis estão disponíveis no estoque naquele momento.

### Regras das solicitações

- Toda solicitação nasce com o status `PENDENTE`.
- Só são usadas bolsas de `SANGUE_TOTAL`, com status `DISPONIVEL` e dentro da validade.
- A compatibilidade segue a tabela de transfusão de hemácias:

| Tipo do paciente | Pode receber de |
|---|---|
| O- | O- |
| O+ | O+, O- |
| A- | A-, O- |
| A+ | A+, A-, O+, O- |
| B- | B-, O- |
| B+ | B+, B-, O+, O- |
| AB- | AB-, A-, B-, O- |
| AB+ | todos os tipos |

- Ao atender, o backend escolhe primeiro as bolsas do mesmo tipo sanguíneo da solicitação e depois as dos outros tipos compatíveis. Dentro de cada grupo, escolhe as que vencem primeiro.
- Fluxo de status:

| Ação | Status de origem | Status final | Efeito nas bolsas |
|---|---|---|---|
| Atender | `PENDENTE` | `EM_ATENDIMENTO` | As bolsas escolhidas passam para `RESERVADA` |
| Concluir | `EM_ATENDIMENTO` | `ATENDIDA` | As bolsas reservadas passam para `UTILIZADA` |
| Cancelar | `PENDENTE` ou `EM_ATENDIMENTO` | `CANCELADA` | As bolsas reservadas voltam para `DISPONIVEL` |

---

## Endpoints de Solicitações

### GET `/solicitacoes`

Lista todas as solicitações cadastradas.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: lista de `SolicitacaoResponse`. Caso não existam solicitações, é retornada uma lista vazia.

---

### GET `/solicitacoes/{id}`

Busca uma solicitação pelo identificador.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `SolicitacaoResponse`

**Possível resposta de erro:**

- Status: `404 Not Found`, caso a solicitação não seja encontrada.

---

### POST `/solicitacoes`

Cadastra uma nova solicitação.

**Corpo da requisição:**

Utiliza o contrato `SolicitacaoRequest`.

**Resposta de sucesso:**

- Status: `201 Created`
- Corpo: `SolicitacaoResponse`

**Possível resposta de erro:**

- Status: `400 Bad Request`, quando algum campo obrigatório é inválido ou não foi informado.

```json
{
  "quantidade": "Quantidade deve ser maior que zero."
}
```

---

### PATCH `/solicitacoes/{id}/atender`

Reserva as bolsas compatíveis e altera o status da solicitação para `EM_ATENDIMENTO`.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `SolicitacaoResponse`

**Possíveis respostas de erro:**

- Status: `404 Not Found`, caso a solicitação não seja encontrada.
- Status: `409 Conflict`, caso a solicitação não esteja pendente.
- Status: `409 Conflict`, caso não existam bolsas compatíveis suficientes.

```json
{
  "erro": "Há apenas 2 bolsas compatíveis disponíveis para 3 solicitadas."
}
```

---

### PATCH `/solicitacoes/{id}/concluir`

Altera o status da solicitação para `ATENDIDA` e marca as bolsas reservadas como `UTILIZADA`.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `SolicitacaoResponse`

**Possíveis respostas de erro:**

- Status: `404 Not Found`, caso a solicitação não seja encontrada.
- Status: `409 Conflict`, caso a solicitação não esteja em atendimento.

---

### PATCH `/solicitacoes/{id}/cancelar`

Altera o status da solicitação para `CANCELADA` e devolve ao estoque as bolsas reservadas.

**Resposta de sucesso:**

- Status: `200 OK`
- Corpo: `SolicitacaoResponse`

**Possíveis respostas de erro:**

- Status: `404 Not Found`, caso a solicitação não seja encontrada.
- Status: `409 Conflict`, caso a solicitação já tenha sido atendida ou cancelada.

---

## Tipos de solicitação utilizados no frontend

Os tipos TypeScript relacionados a solicitações ficam em `frontend/src/types/solicitacao.ts`:

```ts
import type { TipoSanguineo } from './doador'

export type PrioridadeSolicitacao = 'NORMAL' | 'URGENTE' | 'EMERGENCIA'

export type StatusSolicitacao = 'PENDENTE' | 'EM_ATENDIMENTO' | 'ATENDIDA' | 'CANCELADA'

export interface SolicitacaoRequest {
  instituicao: string
  setor: string
  tipoSanguineo: TipoSanguineo
  quantidade: number
  prioridade: PrioridadeSolicitacao
  justificativa: string
}

export interface SolicitacaoResponse {
  id: number
  instituicao: string
  setor: string
  tipoSanguineo: TipoSanguineo
  quantidade: number
  prioridade: PrioridadeSolicitacao
  justificativa: string
  dataSolicitacao: string
  status: StatusSolicitacao
  bolsasReservadas: number[]
  bolsasCompativeisDisponiveis: number
}

export type Solicitacao = SolicitacaoResponse
```