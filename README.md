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
| RF07 — Cadastrar solicitações de sangue | H5 | A H5 cobre o cadastro, a listagem e o acompanhamento das solicitações. |
| RF08 — Verificar compatibilidade e disponibilidade | H5 | A H5 cobre a seleção de bolsas compatíveis e disponíveis ao atender uma solicitação. |
| RF09 — Exibir resumo do estoque e das solicitações | H2 | A H2 se relaciona ao resumo do estoque; o resumo de solicitações não possui uma história específica entre H1 e H6. |

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
| Code smell | Refactoring aplicado | Motivo | PR   |
|-----------------------------------------------------------------------------------|---|---|------|
| Método longo no `DoacaoService.salvar()`                                          | **Extract Method** das validações de intervalo entre doações e limite anual | Separar responsabilidades e tornar o fluxo principal do método mais legível | #128 |
| Setup duplicado em `SolicitacaoServiceTest`                                       | Extração da inicialização dos mocks e do service para `@BeforeEach` | Remover repetição entre os testes e centralizar sua preparação | #128 |
| Setup duplicado em `DoacaoServiceTest`                                            | Extração da inicialização dos mocks e do service para `@BeforeEach` | Remover repetição entre os testes e facilitar sua manutenção | #128 |
| Busca de solicitação por ID duplicada em vários métodos de `SolicitacaoService`   | **Extract Method** para `buscarSolicitacaoOuFalhar()` | Centralizar a busca e o tratamento de solicitação inexistente, eliminando código duplicado | #128 |

### Laura
| Code smell | Refactoring aplicado | Motivo | PR |
|---|---|---|---|
| Funções de data em módulos de domínio: `formatarData` ficava em `utils/doador.ts` e `dataDeHoje` em `utils/doacao.ts`, mas eram usadas por Estoque, Solicitações, Dashboard e exportação CSV | **Move Function** para o novo módulo `utils/data.ts` | Remover dependências desnecessárias entre módulos: `bolsa.ts` e `dashboard.ts` importavam `doacao.ts` só para saber a data de hoje | #136 |
| Código duplicado: estado dos filtros e função `atualizarFiltro` copiados nas telas de Doadores, Doações, Estoque e Solicitações | **Extract Function** para o hook `useFiltros` (`hooks/useFiltros.ts`) | Uma única implementação, testada uma vez e reaproveitada pelas quatro telas | #136 |
| Lógica de plural repetida: 7 trechos com `quantidade === 1 ? ... : ...` em `bolsa.ts`, `solicitacao.ts`, `dashboard.ts`, `SolicitacaoDetalhes.tsx` e `DashboardPage.tsx`, mesmo já existindo a função `pluralizar` | **Replace Inline Code with Function Call**, usando `pluralizar` | Uma única regra de singular e plural para toda a interface | #136 |
| Função genérica no módulo errado: `normalizarTexto` ficava em `utils/doador.ts`, e `utils/doacao.ts` dependia desse módulo só para usá-la | **Move Function** para `utils/texto.ts` | Juntar os utilitários de texto (`normalizarTexto` e `pluralizar`) e tirar uma dependência desnecessária entre doações e doadores | #136 |
| Código duplicado nos testes: `respostaCom` e `falhaDaApi` copiadas em 4 arquivos de teste das telas | **Extract Function** para `testes/respostasApi.ts` | Uma única forma de simular respostas e erros da API, mais fácil de manter | #136 |

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


## Metodologia de desenvolvimento

O grupo adotou uma metodologia **híbrida baseada em Kanban**: o trabalho fluiu continuamente por um quadro no GitHub Projects, organizado em ciclos que acompanharam as entregas da disciplina (Etapas 1 a 6). Escolhemos Kanban em vez de Scrum porque o grupo tem três integrantes com horários diferentes, as entregas da disciplina já definiam os marcos, e o fluxo contínuo permitia que cada área (front-end, back-end e integração) avançasse no seu ritmo sem esperar o fim de uma sprint.

### Papéis

| Integrante | Papéis |
|---|---|
| Laura Fernanda | Product Owner e facilitadora (prioriza o backlog, escreve histórias, organiza o quadro e as entregas), design (protótipo de referência) e desenvolvimento front-end |
| Luísa Salvadori | Desenvolvimento back-end e banco de dados (entidades, regras de negócio, endpoints e testes JUnit) |
| Maria Luisa Barroso | Integração front-end/back-end (axios, services, contratos de dados, CORS) e CI/CD (Jenkins) |

Não houve um QA dedicado: cada integrante escreve os testes automatizados da sua parte, e todas atuam como revisoras nos pull requests das colegas.

### Cadência e ferramentas

- **Ciclos:** um ciclo por entrega da disciplina (por exemplo, Entrega 2 até 11/09, Entrega 4 até 18/10, Entrega 5 até 31/10 e Entrega 6 até 13/11), com o backlog revisado e quebrado em issues no início de cada etapa.
- **Reuniões:** não houve reuniões fixas; o alinhamento foi feito de forma assíncrona pelo WhatsApp e em conversas pontuais no início de cada entrega.
- **Quadro:** GitHub Projects com as colunas Backlog, In Progress, In Review e Done, acessível ao monitor como leitor. Cada tarefa é uma issue com label (`feature`, `tests`, `ci-cd`, `story`, `documentation`) e responsável.
- **Código e revisão:** GitHub (branches, pull requests e revisões).
- **Integração contínua:** Jenkins, com stages de build e testes do back-end e do front-end e deploy com Docker.

### Definição de Preparado (DoR)

Uma issue entra em desenvolvimento quando tem:
- descrição clara do que deve ser feito e, no caso de histórias, critérios de aceite no formato Dado/Quando/Então;
- label e responsável definidos;
- dependências conhecidas (por exemplo, endpoint ou contrato de dados já combinado).

### Definição de Pronto (DoD)

Uma tarefa está pronta quando:
- o código está em um pull request com descrição no modelo do grupo (resumo, o que foi feito, testes e como testar);
- os testes automatizados novos ou afetados foram escritos e passam localmente, junto com lint e build;
- o PR foi revisado e aprovado por outra integrante;
- a pipeline do Jenkins está verde após o merge;
- a issue foi fechada e ligada ao PR (`Closes #número` ou `Refs #número`), e o README foi atualizado quando a mudança afeta instalação ou uso.

### Métricas

Dados extraídos do GitHub em 13/11/2026:

| Métrica | Valor |
|---|---|
| Issues criadas | 67 (66 concluídas e 1 descartada como *not planned*) |
| Pull requests | 76, todos integrados à `main` |
| PRs por integrante | Laura 22, Luísa 25, Maria Luisa 29 |
| Issues fechadas por mês | setembro: 1, outubro: 25, novembro: 41 |
| PRs integrados por mês | setembro: 5, outubro: 31, novembro: 40 |
| Lead time de PR (abertura → merge) | mediana de 3,5 h (média de 14,7 h) |
| Lead time de issue (abertura → fechamento) | mediana de 4,7 dias (média de 8,8 dias) |
| PRs com discussão em comentários | 32 (40 comentários no total) |
| Commits por tipo | `feat` 131, `test` 126, `docs` 44, `refactor` 39, `fix` 29, `chore` 17, `ci` 8 |

Como o grupo não trabalhou com sprints de duração fixa, não há gráfico de burndown; o acompanhamento foi feito pelo fluxo do quadro e pelas issues fechadas por período.

## Dinâmica de desenvolvimento

### Divisão de tarefas e decisões técnicas

O trabalho foi dividido por camada desde a Entrega 2: front-end (Laura), back-end e banco de dados (Luísa) e integração e CI/CD (Maria Luisa). A integração foi planejada por entidade, na ordem Doadores → Doações → Estoque → Solicitações: para cada uma, o back-end criava a entidade e os endpoints, o front-end criava a tela e a integração ligava as duas partes.

No início de cada entrega, a líder quebrava o enunciado em issues por fase e cada integrante revisava e completava as suas. As histórias de usuário seguiram a mesma dinâmica: cada integrante escreveu as histórias da sua área.

Algumas decisões técnicas e como foram tomadas:
- **MySQL em vez de PostgreSQL:** a Luísa, responsável pelo back-end, já conhecia o MySQL, e o grupo priorizou a ferramenta que dominava.
- **Contrato de dados do doador:** front-end e back-end tinham campos diferentes (por exemplo, peso e formato do sexo). O grupo alinhou os dois lados na issue #4, com enumerações iguais para sexo e situação do doador.
- **Campos obrigatórios:** tipo sanguíneo e data de nascimento passaram a ser obrigatórios no cadastro de doador depois de testes na interface, porque sem eles não é possível registrar uma doação.
- **Um stage da pipeline por integrante:** definido depois de uma dúvida esclarecida com o monitor.

Dúvidas sobre o enunciado (stages da pipeline, ferramenta de Kanban e commit do gerenciador de dependências) foram levadas ao monitor pelo Teams antes de implementar. As decisões internas foram combinadas pelo WhatsApp e registradas nas issues e nos PRs.

### Branches, commits e code review

- **Branches:** no começo, cada integrante criou uma branch com o mesmo nome (`dev`), e elas foram renomeadas para `dev-front`, `dev-back` e `dev-integration`. Depois, o grupo passou a usar branches curtas por assunto (`feat/...`, `fix/...`, `test/...`, `refactor/...`, `docs/...`, `ci/...`), criadas a partir da `main` atualizada.
- **Commits:** Conventional Commits com escopo (`feat(frontend):`, `test(backend):`, `ci:`), um commit por assunto.
- **Code review:** as revisões seguiam um rodízio entre as integrantes. A revisora lia o código, rodava os testes e, quando encontrava problemas, enviava uma lista de ajustes para a autora corrigir antes do merge. No quadro, a issue ia para **In Review** quando o PR era aberto e para **Done** depois do merge.

### O que funcionou

- A divisão por camada permitiu que front-end, back-end e integração avançassem em paralelo, sem uma integrante esperar pela outra.
- O rodízio de revisões fez todas conhecerem partes do sistema além da própria.
- Os testes automatizados e a pipeline detectaram problemas antes de chegarem à aplicação, como o build quebrado e a configuração errada dos testes.
- Tirar dúvidas com o monitor antes de implementar evitou retrabalho nas entregas.

### Bloqueios e como o grupo se reorganizou

- **Pipeline vermelha no back-end:** com a entrada dos testes de integração, o build do back-end passou a falhar no Jenkins porque a variável `SPRING_DATASOURCE_URL` do container sobrescrevia a configuração H2 dos testes. O problema foi registrado na issue #135 e corrigido no PR #138.
- **Branches longas por área:** as branches `dev-front`, `dev-back` e `dev-integration` ficaram muito diferentes da `main` e geraram conflitos. O grupo passou a usar branches curtas por assunto, criadas a partir da `main` atualizada.
- **Testes dependentes de ambiente:** testes que dependiam de um MySQL local ou da data atual passaram a falhar fora da máquina de quem os escreveu. Eles foram ajustados para usar H2 (PR #132) e datas fixas (PR #137).
- **Revisão de escopo:** a história de agendamento de doações (#75) foi descartada por não ter sido implementada, e o atendimento de solicitações, já entregue, ganhou uma história própria (#139).

### Lições aprendidas

- Definir o contrato de dados entre front-end e back-end antes de implementar as telas.
- Tratar a pipeline verde como condição para o merge desde o início.
- Começar cada entrega mais cedo, com ciclos de datas fixas, para não concentrar o trabalho perto do prazo.

## Uso de Inteligência Artificial

Durante o desenvolvimento do HemoGestor, ferramentas de Inteligência Artificial foram utilizadas como apoio técnico em diferentes etapas do projeto.

A documentação completa dos prompts utilizados, respostas obtidas e aplicações no sistema está disponível em:

➡️ [Documentação do uso de Inteligência Artificial](docs/uso-ia.md)
