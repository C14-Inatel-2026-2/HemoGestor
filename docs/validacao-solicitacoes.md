# Validação da integração de Solicitações

Validação realizada para a issue #112, com o ambiente completo executado via Docker Compose.

## Ambiente validado

- MySQL
- Back-end Spring Boot
- Front-end React
- API disponível em `http://localhost:8081`
- Health check `/api/health` retornando HTTP 200

## Cenários validados

### Atender solicitação sem bolsas compatíveis

Foi criada uma solicitação de 1 bolsa O- sem estoque disponível.

Resultado esperado e obtido:

- HTTP 409 Conflict
- solicitação permaneceu pendente

### Solicitação inexistente

Foi realizada uma tentativa de atendimento para uma solicitação inexistente.

Resultado esperado e obtido:

- HTTP 404 Not Found

### Atender solicitação

Após o registro e a conclusão de uma doação O-, uma bolsa compatível foi criada automaticamente no estoque.

A solicitação pendente foi atendida com sucesso.

Resultado:

- status alterado de `PENDENTE` para `EM_ATENDIMENTO`
- bolsa compatível reservada

### Concluir solicitação

A solicitação em atendimento foi concluída com sucesso.

Resultado:

- status alterado de `EM_ATENDIMENTO` para `ATENDIDA`

### Cancelar solicitação

Foi criada uma nova solicitação pendente e realizado o cancelamento.

Resultado:

- status alterado de `PENDENTE` para `CANCELADA`

### Status inválido

Foi realizada uma tentativa de atender uma solicitação já cancelada.

Resultado esperado e obtido:

- HTTP 409 Conflict

## Testes automatizados

Também foram executados os testes da tela de Solicitações no front-end e os testes de integração adicionados no back-end.

Os cenários de solicitação inexistente, falta de bolsas compatíveis e status inválido foram adicionados ao `SolicitacaoIntegrationTest`.

Todos os testes executados passaram com sucesso.