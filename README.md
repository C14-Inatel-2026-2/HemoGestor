# HemoGestor

Aplicação web para o gerenciamento básico de um banco de sangue, desenvolvida na disciplina C14 – Engenharia de Software (Inatel).

## Sobre o projeto

O HemoGestor é uma aplicação web interna, voltada aos funcionários de um banco de sangue, para auxiliar o gerenciamento básico de doadores, doações, estoque de bolsas e solicitações de sangue. O projeto dá continuidade a um trabalho de Programação Orientada a Objetos em Java feito no semestre anterior, cuja lógica foi adaptada para uma aplicação web.

A aplicação tem cinco telas: **Doadores**, **Doações**, **Estoque**, **Solicitações** e **Dashboard**. O front-end em React se comunica por HTTP e JSON com uma API REST em Spring Boot, que acessa o banco de dados MySQL. O código fica em um único repositório (monorepo), com as pastas `frontend/` e `backend/`.

## Funcionalidades e requisitos funcionais

| ID | Requisito | Status   |
|---|---|----------|
| RF01 | Cadastrar doador, com validação de nome, CPF, e-mail e datas | Entregue |
| RF02 | Listar doadores | Entregue |
| RF03 | Editar doador | Entregue |
| RF04 | Remover doador | Entregue |
| RF05 | Registrar e consultar doações, com controle de status e regras de intervalo entre coletas | Entregue |
| RF06 | Consultar bolsas por tipo sanguíneo, validade e situação | Entregue |
| RF07 | Cadastrar solicitações de sangue | Entregue |
| RF08 | Verificar compatibilidade e disponibilidade | Entregue |
| RF09 | Exibir resumo do estoque e das solicitações (Dashboard) | Entregue |

**Legenda:** *Entregue* = funciona de ponta a ponta (tela, API e banco); *Parcial* = parte pronta; *Planejado* = ainda não iniciado.

## Rastreabilidade das histórias de usuário

| História | Issue | PRs relacionados | Arquivos de teste |
|---|---|---|---|
| H1 — Cadastrar doador pelo formulário | #65 | #64 | `frontend/src/pages/DoadoresPage.test.tsx`, `frontend/src/components/DoadorForm.test.tsx`, `frontend/src/utils/doador.test.ts` |
| H2 — Consultar o estoque por tipo sanguíneo | #66 | #82, #91, #100 | `frontend/src/pages/EstoquePage.test.tsx`, `frontend/src/pages/DashboardPage.test.tsx`, `frontend/src/utils/bolsa.test.ts`, `frontend/src/utils/dashboard.test.ts` |
| H3 — Registrar uma nova doação | #70 | #69, #73, #78 | `backend/src/test/java/br/inatel/controller/DoacaoControllerTest.java`, `backend/src/test/java/br/inatel/service/DoacaoServiceTest.java`, `backend/src/test/java/br/inatel/integration/DoacaoIntegrationTest.java`, `backend/src/test/java/br/inatel/model/DoacaoTest.java` |
| H4 — Consultar histórico de doações | #72 | #74, #81 | `backend/src/test/java/br/inatel/controller/DoacaoControllerTest.java`, `backend/src/test/java/br/inatel/service/DoacaoServiceTest.java`, `backend/src/test/java/br/inatel/integration/DoacaoIntegrationTest.java` |
| H5 — Atender solicitações de sangue com bolsas compatíveis | #139 | #90, #105, #106, #118, #120, #123, #132, #134 | `backend/src/test/java/br/inatel/controller/SolicitacaoControllerTest.java`, `backend/src/test/java/br/inatel/service/SolicitacaoServiceTest.java`, `backend/src/test/java/br/inatel/integration/SolicitacaoIntegrationTest.java`, `frontend/src/pages/SolicitacoesPage.test.tsx`, `frontend/src/components/SolicitacaoForm.test.tsx`, `frontend/src/components/SolicitacaoDetalhes.test.tsx`, `frontend/src/services/solicitacaoService.test.ts`, `frontend/src/utils/solicitacao.test.ts` |
| H6 — Consultar doadores cadastrados | #76 | #56, #64 | `frontend/src/services/doadorService.test.ts`, `frontend/src/pages/DoadoresPage.test.tsx` |

### Relação entre requisitos funcionais e histórias

| Requisito | Histórias relacionadas | Observação |
|---|---|---|
| RF01 — Cadastrar doador | H1 | A H1 cobre o cadastro de doadores pelo formulário. |
| RF02 — Listar doadores | H6 | A H6 cobre a consulta dos doadores cadastrados. |
| RF03 — Editar doador | Sem história específica | A edição foi implementada na tela de Doadores, mas não possui uma história própria entre H1 e H6. |
| RF04 — Remover doador | Sem história específica | A remoção foi implementada na tela de Doadores, mas não possui uma história própria entre H1 e H6. |
| RF05 — Registrar e consultar doações | H3, H4 | A H3 cobre o registro de doações e a H4 cobre a consulta do histórico. |
| RF06 — Consultar bolsas por tipo sanguíneo, validade e situação | H2 | A H2 cobre a consulta do estoque e seus filtros. |
| RF07 — Cadastrar solicitações de sangue | H5 | A H5 cobre o cadastro e o acompanhamento das solicitações de sangue. |
| RF08 — Verificar compatibilidade e disponibilidade | H5 | A H5 cobre o atendimento das solicitações com seleção de bolsas compatíveis e disponíveis. |
| RF09 — Exibir resumo do estoque e das solicitações | H2 | A H2 se relaciona ao resumo do estoque; o resumo de solicitações não possui uma história específica entre H1 e H6. |

### Situação das histórias H5 e H6

- **H5 — Agendar doação (#75):** permanece em backlog. A funcionalidade de agendamento ainda não foi implementada e não possui PRs ou testes associados.
- **H6 — Consultar doadores cadastrados (#76):** concluída. Os critérios de aceite foram validados com base na listagem de doadores, tratamento de lista vazia e de erros, integração com a API e testes automatizados da funcionalidade.

## Requisitos não funcionais

| ID | Requisito | Como o projeto atende |
|---|---|---|
| RNF01 | Validação de dados | O front-end valida nome e CPF (inclusive os dígitos verificadores) e o back-end valida com Bean Validation, devolvendo mensagens claras de erro |
| RNF02 | Usabilidade | Interface web em português, com menu lateral e avisos de sucesso e de erro nas operações |
| RNF03 | Portabilidade | Banco de dados, back-end e front-end sobem com `docker compose` |
| RNF04 | Testabilidade | Testes automatizados no back-end (JUnit 5, Mockito, MockMvc e H2) e no front-end (Vitest e Testing Library), com relatórios de cobertura |
| RNF05 | Integração contínua | Pipeline no Jenkins com Build, Testes e Deploy, incluindo relatórios JUnit e de cobertura |
| RNF06 | Reprodutibilidade do build | `package-lock.json` e Maven Wrapper versionados |
| RNF07 | Segurança básica | O front-end não acessa o banco, só o back-end; as credenciais ficam em variáveis de ambiente (o `.env` não é versionado); o CORS é restrito à origem do front-end |
| RNF08 | Padronização do trabalho | Commits no padrão Conventional Commits, ESLint no front-end e revisão por pull request |

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Front-end | React 19, TypeScript, Vite, react-router-dom e axios |
| Back-end | Java 21, Spring Boot 4, Spring Data JPA e Bean Validation |
| Banco de dados | MySQL 8 |
| Testes do front-end | Vitest e Testing Library |
| Testes do back-end | JUnit 5, Mockito, AssertJ, Spring Boot Test, MockMvc, H2 (em memória) e JaCoCo |
| Gerenciamento de dependências | npm (`package.json` e `package-lock.json`) e Maven Wrapper (`pom.xml`) |
| Qualidade de código | ESLint |
| Contêineres | Docker e Docker Compose |
| Integração contínua | Jenkins |

## Decisões técnicas

- **MySQL no lugar do PostgreSQL.** A proposta inicial previa PostgreSQL, mas o banco passou a ser o MySQL porque a integrante responsável pelo back-end e pelo banco de dados já o conhecia e tinha mais familiaridade com ele.
- **Jenkins no lugar do CircleCI.** A proposta inicial previa o CircleCI. A ferramenta passou a ser o Jenkins por recomendação do monitor da disciplina.
- **Monorepo e API única.** Front-end e back-end ficam no mesmo repositório, nas pastas `frontend/` e `backend/`. A API é uma única aplicação (monolítica), dividida internamente em módulos de doadores, doações, estoque e solicitações, e não em microsserviços.

## Como rodar a aplicação

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e aberto
- Para desenvolver o front-end: Node.js 24, de preferência com o `nvm` (a versão está no `frontend/.nvmrc`)

### Com Docker (recomendado)

1. Na raiz do repositório, crie o arquivo de variáveis de ambiente a partir do modelo:

```bash
cp .env.example .env
```

2. Suba o banco, o back-end e o front-end:

```bash
docker compose up -d --build mysql backend frontend
```

3. Abra a aplicação em `http://localhost:5173`.

| Serviço | Endereço |
|---|---|
| Front-end | http://localhost:5173 |
| API (health check) | http://localhost:8081/api/health |
| MySQL | `localhost:3307` |

Para parar: `docker compose down`. Os dados do banco ficam guardados em um volume e permanecem até ele ser apagado.

### Desenvolvendo o front-end

Com o banco e o back-end rodando no Docker, o front-end pode rodar em modo de desenvolvimento, com recarregamento automático:

```bash
docker compose up -d --build mysql backend
cd frontend
echo "VITE_API_URL=http://localhost:8081" > .env.local
npm ci
npm run dev
```

O front-end deve rodar na porta 5173, porque o CORS do back-end só aceita essa origem. Se o contêiner `hemogestor-frontend` estiver rodando, pare-o antes com `docker stop hemogestor-frontend`.

## Como usar

No menu lateral, o **Dashboard** mostra o resumo do estoque por tipo sanguíneo, as solicitações que exigem ação e os alertas operacionais. Cada alerta leva à área correspondente.

A tela **Doadores** mostra a lista de doadores cadastrados, com busca por nome ou CPF e filtros por tipo sanguíneo e status. O botão **Novo doador** abre o formulário de cadastro, em que nome, CPF, data de nascimento e tipo sanguíneo são obrigatórios. O CPF é validado, e a aplicação avisa quando ele já está cadastrado. Em cada linha, o botão **Editar** abre o formulário preenchido, e o botão **Remover** pede uma confirmação antes de apagar. Um doador com doações registradas não pode ser removido.

A tela **Doações** lista as doações já registradas, com busca por doador e filtro por status. O botão **Nova doação** abre o formulário de registro, em que o doador, a data, a hora, o volume, a hemoglobina e o responsável são obrigatórios. A tela impede uma nova doação antes do intervalo mínimo (60 dias para homens e 90 dias para mulheres) e do limite de 12 meses (4 doações para homens e 3 para mulheres), e mostra a data em que o doador poderá doar novamente. Cada doação começa **Em triagem** e pode ser concluída ou descartada na própria tabela. Ao concluir, uma bolsa é criada no estoque.

A tela **Estoque** lista as bolsas, com filtros por tipo sanguíneo e status, e destaca as que vencem em breve. Uma bolsa pode ser descartada na própria tabela.

A tela **Solicitações** lista os pedidos de sangue por prioridade e permite cadastrar novos pedidos. Também é possível atender, concluir e cancelar solicitações, com validação de disponibilidade de bolsas, compatibilidade sanguínea e tratamento de erros retornados pela API.

## Testes

**Back-end** (requer Java 21):

```bash
cd backend
./mvnw verify
```

O relatório de cobertura (JaCoCo) fica em `backend/target/site/jacoco/index.html`.

**Front-end:**

```bash
cd frontend
npm ci
npm test
npm run coverage
```

O relatório de cobertura fica em `frontend/coverage/index.html`. Os testes também rodam na pipeline do Jenkins, que publica os relatórios (veja a seção a seguir).

## Documentação da API

Os endpoints do back-end e os contratos de dados (requisições e respostas) estão descritos em [`docs/api.md`](docs/api.md).

## Pipeline de CI/CD

A pipeline roda no **Jenkins**, definida no `Jenkinsfile` da raiz do repositório. O próprio Jenkins sobe via Docker, já configurado pelo `jenkins/casc.yaml`, com o job **HemoGestor** apontando para a branch `main`.

### Stages

| Stage | Em paralelo | O que faz |
|---|---|---|
| **Build** | Build Back | `./mvnw clean package` |
| | Build Front | `npm ci`, `npm run lint` e `npm run build` |
| **Testes** | Testes Back | `./mvnw verify`, com relatório JUnit e cobertura JaCoCo |
| | Testes Front | `npm run test:ci`, com relatório JUnit e cobertura (Vitest) |
| **Deploy** | — | Sobe MySQL, back-end e front-end com `docker compose`, faz o health check em `/api/health` e valida as rotas principais `/doadores`, `/doacoes`, `/bolsas` e `/solicitacoes` |

Após o health check, a pipeline executa requisições `GET` para as rotas principais da API. O deploy falha caso qualquer uma delas não responda com status HTTP `200`.

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e aberto

### Como rodar

1. Na raiz do repositório, crie o arquivo de variáveis de ambiente a partir do modelo:

```bash
cp .env.example .env
```

2. Suba o Jenkins:

```bash
docker compose up -d --build jenkins
```

3. Acesse `http://localhost:8080` e entre com o usuário e a senha definidos no `.env` (`JENKINS_ADMIN_ID` e `JENKINS_ADMIN_PASSWORD`).
4. Abra o job **HemoGestor** e clique em **Construir agora** (Build Now).

Na primeira execução, a pipeline demora alguns minutos, porque baixa as imagens Docker e as dependências do Maven e do npm.

### Onde ver os resultados

No build do Jenkins:
- **Tests**: resultado dos testes do front-end e do back-end (JUnit).
- **Cobertura Frontend**: cobertura de testes do front-end em gráfico.
- **Artifacts**: relatórios HTML de cobertura do front-end (`frontend/coverage`) e do back-end (`backend/target/site/jacoco`).

### Aplicação após o deploy

| Serviço | Endereço |
|---|---|
| Front-end | http://localhost:5173 |
| Back-end (health check) | http://localhost:8081/api/health |
| MySQL | `localhost:3307` |
| Jenkins | http://localhost:8080 |

### Observações

- Após alterar algo na pasta `jenkins/` ou no `docker-compose.yml`, recrie o Jenkins com `docker compose up -d --build jenkins`.
- O `.env` não é versionado. Cada pessoa cria o seu a partir do `.env.example`.


## Refactorings

Nesta etapa foram aplicados refactorings com o objetivo de melhorar a organização, legibilidade e manutenção do código, preservando o comportamento externo da aplicação.

### Luísa
| Code smell                                                                        | Refactoring aplicado | Motivo | PR   |
|-----------------------------------------------------------------------------------|---|---|------|
| Método longo no `DoacaoService.salvar()`                                          | **Extract Method** das validações de intervalo entre doações e limite anual | Separar responsabilidades e tornar o fluxo principal do método mais legível | #128 |
| Setup duplicado em `SolicitacaoServiceTest`                                       | Extração da inicialização dos mocks e do service para `@BeforeEach` | Remover repetição entre os testes e centralizar sua preparação | #128 |
| Setup duplicado em `DoacaoServiceTest`                                            | Extração da inicialização dos mocks e do service para `@BeforeEach` | Remover repetição entre os testes e facilitar sua manutenção | #128 |
| Busca de solicitação por ID duplicada em vários métodos de `SolicitacaoService`   | **Extract Method** para `buscarSolicitacaoOuFalhar()` | Centralizar a busca e o tratamento de solicitação inexistente, eliminando código duplicado | #128 |
| Busca de bolsa por ID duplicada em `BolsaSangueService`                           | **Extract Method** para `buscarBolsaOuFalhar()` | Centralizar a busca e o tratamento de bolsa inexistente, evitando duplicação | A adicionar |
| Método `DoadorService.atualizar()` com muitos detalhes de implementação           | **Extract Method** para `atualizarDados()` | Separar a atualização dos campos da lógica de busca e persistência do doador | A adicionar |
| Construção duplicada de respostas de erro em `GlobalExceptionHandler`             | **Extract Method** para `criarRespostaErro()` | Centralizar a criação das respostas HTTP de erro e reduzir duplicação | A adicionar |
| Normalização de sexo duplicada no construtor e no setter de `Doador`              | **Extract Method** para `normalizarSexo()` | Centralizar o tratamento de sexo não informado e evitar repetição de lógica | A adicionar |
| Normalização de tipo sanguíneo duplicada no construtor e no setter de `Doador`    | **Extract Method** para `normalizarTipoSanguineo()` | Centralizar a normalização do tipo sanguíneo e facilitar sua manutenção | A adicionar |
| Método `SolicitacaoService.atender()` com múltiplas responsabilidades             | **Extract Method** para validação da quantidade e seleção das bolsas | Separar etapas do atendimento e tornar o fluxo principal mais legível | A adicionar |
| Conversão de listas de `BolsaSangue` para DTO repetida em `BolsaSangueController` | **Extract Method** para `mapearParaDTO()` | Centralizar o mapeamento das bolsas e eliminar código repetido nos endpoints | A adicionar |
| Conversão de `Optional<Doacao>` para resposta HTTP repetida em `DoacaoController` | **Extract Method** para `criarRespostaDoacao()` | Centralizar o mapeamento para DTO e o tratamento das respostas `200` e `404` | A adicionar |
| Conversão de `Optional<Doador>` para resposta HTTP repetida em `DoadorController` | **Extract Method** para `criarRespostaDoador()` | Centralizar o mapeamento para DTO e o tratamento das respostas `200` e `404` | A adicionar |
| Cadeia de condicionais em `BolsaSangue.calcularDataValidade()`                    | Simplificação de condicional com `switch` | Tornar o cálculo da validade mais direto e legível sem alterar seu comportamento | A adicionar |
| Ordenação por validade em `BolsaSangueService`                                    | Simplificação da expressão com `Comparator.comparing()` | Expressar diretamente o critério de ordenação e melhorar a legibilidade | A adicionar |

### Maria Luisa

| Code smell | Refactoring aplicado | Motivo | PR |
|---|---|---|---|
| Tratamento de erros e validação de respostas da API duplicados em diferentes telas | **Extract Function / centralização de funções reutilizáveis**, com extração de `obterMensagemErro` e `validarRespostaLista` para um utilitário comum | Eliminar código duplicado, padronizar o tratamento das respostas da API e facilitar a manutenção sem alterar o comportamento externo da aplicação | #119 |
| Lista de tipos sanguíneos duplicada em diferentes componentes e utilitários do front-end | **Extração e centralização de constante compartilhada** em `TIPOS_SANGUINEOS` | Manter uma única fonte para os tipos sanguíneos, reduzir duplicação e evitar inconsistências em futuras alterações | #122 |

> **Observação:** durante o desenvolvimento, outros commits foram classificados com o prefixo `refactor`. Após a revisão dos critérios da entrega final, eles não foram contabilizados nesta seção por não atenderem integralmente à definição adotada de refactoring, pois alguns envolveram mudanças no comportamento externo, contrato da API, regras de negócio ou apenas organização/formatação do código. Nesta seção foram considerados somente os refactorings estruturais que preservam o comportamento da aplicação.

## Equipe

| Integrante | Responsabilidade | GitHub |
|---|---|---|
| Laura Fernanda de Castro Ferreira | Líder do projeto, design e front-end | [laurafernandacf](https://github.com/laurafernandacf) |
| Maria Luisa Barroso Silva | Integração (axios, services, CORS e contratos de dados) | [maria-luisa-bs](https://github.com/maria-luisa-bs) |
| Luísa de Medeiros Salvadori | Back-end e banco de dados | [luisasalvadori](https://github.com/luisasalvadori) |

## Fluxo de trabalho

- **Branches:** a `main` recebe apenas código revisado. Cada integrante trabalha em branches de funcionalidade (`feat/...`, `fix/...`, `docs/...`) e nas branches de área (`dev-front`, `dev-back` e `dev-integration`).
- **Commits:** padrão Conventional Commits com escopo (por exemplo, `feat(frontend):`, `test(backend):` e `ci:`), com um commit por assunto.
- **Pull requests:** todo PR é revisado por outro integrante antes do merge, e a descrição segue um modelo com resumo, o que foi feito, testes e como testar.
- **Gestão do trabalho:** quadro Kanban no GitHub Projects, com tarefas e histórias de usuário registradas como issues e ligadas aos PRs por `Refs #número`.