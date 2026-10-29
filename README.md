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