# HemoGestor

Aplicação web para o gerenciamento básico de um banco de sangue, desenvolvida na disciplina C14 – Engenharia de Software (Inatel).

## Sobre o projeto

O HemoGestor é uma aplicação web interna, voltada aos funcionários de um banco de sangue, para auxiliar o gerenciamento básico de doadores, doações, estoque de bolsas e solicitações de sangue. O projeto dá continuidade a um trabalho de Programação Orientada a Objetos em Java feito no semestre anterior, cuja lógica foi adaptada para uma aplicação web.

A aplicação tem cinco telas: **Doadores**, **Registrar Doação**, **Estoque**, **Solicitações** e **Dashboard**. O front-end em React se comunica por HTTP e JSON com uma API REST em Spring Boot, que acessa o banco de dados MySQL. O código fica em um único repositório (monorepo), com as pastas `frontend/` e `backend/`.

## Funcionalidades e requisitos funcionais

| ID | Requisito | Status |
|---|---|---|
| RF01 | Cadastrar doador, com validação de nome, CPF, e-mail e datas | Entregue |
| RF02 | Listar doadores | Entregue |
| RF03 | Editar doador | Parcial (API pronta, falta a tela) |
| RF04 | Remover doador | Parcial (API pronta, falta a tela) |
| RF05 | Registrar doações e datas de coleta | Planejado |
| RF06 | Consultar bolsas por tipo sanguíneo, validade e situação | Planejado |
| RF07 | Cadastrar solicitações de sangue | Planejado |
| RF08 | Verificar compatibilidade e disponibilidade | Planejado |
| RF09 | Exibir resumo do estoque e das solicitações (Dashboard) | Planejado |

**Legenda:** *Entregue* = funciona de ponta a ponta (tela, API e banco); *Parcial* = parte pronta; *Planejado* = ainda não iniciado.

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

No menu lateral, a tela **Doadores** mostra a lista de doadores cadastrados. O botão **Novo doador** abre o formulário de cadastro, em que nome e CPF são obrigatórios. O CPF é validado, e a aplicação avisa quando ele já está cadastrado. As demais telas (Registrar Doação, Estoque, Solicitações e Dashboard) estão em desenvolvimento, como mostra a tabela de requisitos funcionais.

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
| **Deploy** | — | Sobe MySQL, back-end e front-end com `docker compose` e faz o health check em `/api/health` |

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