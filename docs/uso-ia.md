# Uso de Inteligência Artificial

Durante o desenvolvimento do **HemoGestor**, foram utilizadas ferramentas de Inteligência Artificial como apoio na compreensão de conceitos, organização da arquitetura do sistema, implementação de funcionalidades e resolução de problemas técnicos, tanto no back-end quanto no front-end.

As ferramentas utilizadas foram:

- **ChatGPT (OpenAI)** — modelo utilizado durante o desenvolvimento.
- **[Nome da outra ferramenta]** — [Empresa desenvolvedora e versão/modelo utilizado].

A utilização dessas ferramentas teve como objetivo esclarecer dúvidas técnicas, fornecer exemplos de código, auxiliar na identificação e correção de erros e contribuir para a aplicação de boas práticas de Engenharia de Software.

A seguir, estão registrados os prompts utilizados e as respectivas respostas fornecidas pelas ferramentas, incluindo explicações técnicas, sugestões de implementação e exemplos de código que auxiliaram no desenvolvimento do sistema.


## 1. Teste de integração da classe BolsaSangue com MySQL

**Prompt:**

> Baseado no projeto HemoGestor, que estou desenvolvendo para a matéria Engenharia de Software, poderia me auxiliar a realizar um teste de integração para integrar a classe Bolsa Sangue com o banco de dados, mySQL?

**Resposta:**

Para realizar um teste de integração entre a classe `BolsaSangue` e o banco de dados MySQL no projeto HemoGestor, recomendo utilizar o JUnit 5, juntamente com o Spring Boot Test e o Spring Data JPA, que permitem verificar a comunicação entre as entidades, os repositórios e a camada de serviço da aplicação.

### 1. Criar a classe de teste de integração

Inicialmente, crie a classe `BolsaSangueIntegrationTest` no pacote `br.inatel.integration`, dentro do diretório de testes do projeto.

Utilize as anotações `@SpringBootTest` e `@ActiveProfiles("test")` para inicializar o contexto do Spring Boot e ativar as configurações específicas do ambiente de testes.

Em seguida, utilize `@Autowired` para injetar os seguintes componentes:

- `BolsaSangueRepository`: responsável pela persistência das bolsas sanguíneas.
- `DoacaoRepository`: responsável pelas operações de persistência das doações.
- `DoadorRepository`: responsável pelo armazenamento dos dados dos doadores.
- `BolsaSangueService`: responsável pelas operações de consulta das bolsas sanguíneas.

### 2. Configurar a preparação dos testes

Implemente um método chamado `setUp()`, utilizando a anotação `@BeforeEach`, para realizar a limpeza dos registros antes da execução de cada teste.

```java
@BeforeEach
void setUp() {
    bolsaSangueRepository.deleteAll();
    doacaoRepository.deleteAll();
    doadorRepository.deleteAll();
}
```

Essa configuração garante que os testes sejam executados sem interferência de registros anteriores. Recomendo utilizar um banco de dados exclusivo para testes, evitando a exclusão de informações do ambiente de desenvolvimento.

### 3. Implementar o teste de listagem de bolsas sanguíneas

Crie o método `listarBolsasSalvas()`, utilizando a anotação `@Test`.

Nesse método, realize as seguintes operações:

1. Instancie um objeto `Doador` e defina nome, CPF e tipo sanguíneo `A+`.
2. Salve o doador utilizando `doadorRepository.save()`.
3. Instancie um objeto `Doacao`, associando-o ao doador cadastrado.
4. Configure a doação como `SANGUE_TOTAL`, utilizando a data atual, hemoglobina de `13.5`, horário de coleta às `10:00`, volume de `450 ml` e um responsável.
5. Utilize `concluirDoacao()` para finalizar a doação e salve o registro por meio de `doacaoRepository.save()`.
6. Instancie uma `BolsaSangue`, associando-a à doação, com tipo sanguíneo `A+` e situação `DISPONIVEL`.
7. Salve a bolsa utilizando `bolsaSangueRepository.save()`.
8. Execute o método `service.listarTodas()` para consultar as bolsas cadastradas.

Por fim, utilize as seguintes verificações:

```java
assertEquals(1, resultado.size());
assertEquals("A+", resultado.getFirst().getTipoSanguineo());
```

Essas instruções permitirão verificar se o sistema recupera corretamente a bolsa cadastrada e se o tipo sanguíneo permanece consistente após a persistência.

### 4. Implementar o teste de filtragem por situação

Crie um segundo método, denominado `filtrarBolsasPorSituacao()`, também utilizando a anotação `@Test`.

Repita o procedimento de criação e persistência do doador, da doação e da bolsa sanguínea. Para esse cenário, utilize uma bolsa com situação `SituacaoBolsa.DISPONIVEL`.

Em seguida, execute o método:

```java
List<BolsaSangue> resultado =
    service.listarPorSituacao(SituacaoBolsa.DISPONIVEL);
```

Para verificar o funcionamento da filtragem, utilize:

```java
assertEquals(1, resultado.size());
assertEquals(
    SituacaoBolsa.DISPONIVEL,
    resultado.getFirst().getSituacao()
);
```

Essas verificações permitirão confirmar se o método retorna a quantidade esperada de bolsas e se a situação recuperada corresponde ao filtro aplicado.

### 5. Resultado esperado

Ao concluir a implementação, você terá dois testes de integração responsáveis por validar operações essenciais da classe `BolsaSangue`:

- `listarBolsasSalvas()`: verifica a persistência e a recuperação de uma bolsa sanguínea por meio da camada de serviço.
- `filtrarBolsasPorSituacao()`: verifica a consulta de bolsas sanguíneas com base na situação informada.

Esses testes ajudarão a garantir que os relacionamentos entre `Doador`, `Doacao` e `BolsaSangue` estejam funcionando corretamente, assim como a comunicação entre os repositórios, a camada de serviço e o banco de dados configurado.

Com isso, o HemoGestor contará com uma validação automatizada das operações de listagem e filtragem de bolsas sanguíneas, contribuindo para a confiabilidade e a manutenção do sistema.

---

## 2. Utilização de enumerações para atributos com valores predefinidos

**Prompt:**

> Como eu posso fazer para que os atributos de uma classe tenham respostas pré-definidas, como por exemplo o sexo de um doaodor, que só pode ser 'feminino', 'masculino' ou 'não informado'?

**Resposta:**

Para definir valores pré-estabelecidos para os atributos de uma classe no projeto HemoGestor, recomendo utilizar o recurso `enum` (enumeração) da linguagem Java.

Uma enumeração permite estabelecer um conjunto fixo de valores que determinado atributo pode assumir, evitando o armazenamento de informações inválidas e garantindo maior consistência dos dados.

### 1. Criar uma enumeração para o atributo sexo

Inicialmente, crie um pacote chamado `enumeracao` dentro de `br.inatel`, caso ainda não exista.

Em seguida, crie o arquivo `Sexo.java` e defina os valores permitidos:

```java
package br.inatel.enumeracao;

public enum Sexo {
    FEMININO,
    MASCULINO,
    NAO_INFORMADO
}
```

Dessa forma, o atributo poderá receber apenas um dos três valores definidos na enumeração.

### 2. Utilizar a enumeração na classe Doador

Na classe `Doador`, substitua o tipo `String` do atributo `sexo` pelo tipo `Sexo`.

```java
import br.inatel.enumeracao.Sexo;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Enumerated(EnumType.STRING)
private Sexo sexo;
```

A anotação `@Enumerated(EnumType.STRING)` é importante para a integração com o MySQL, pois permite que os valores da enumeração sejam armazenados como texto no banco de dados, em vez de números.

Por exemplo, o valor `FEMININO` será armazenado como `"FEMININO"`.

### 3. Definir o sexo ao cadastrar um doador

Ao criar um objeto da classe `Doador`, utilize os valores da enumeração para definir o atributo:

```java
Doador doador = new Doador();

doador.setNome("Maria");
doador.setSexo(Sexo.FEMININO);
```

Caso seja necessário definir outro valor, basta utilizar `Sexo.MASCULINO` ou `Sexo.NAO_INFORMADO`.

Isso evita que sejam atribuídos valores diferentes daqueles estabelecidos pela aplicação.

### 4. Considerações sobre a validação

É importante destacar que a utilização de `enum` impede a atribuição direta de valores não definidos na enumeração, mas não impede, por si só, que um atributo receba `null`.

Se o preenchimento for obrigatório, recomendo adicionar a anotação `@NotNull` ao atributo e garantir que a validação seja executada na camada responsável pelo cadastro.

Além disso, caso os valores sejam recebidos por uma API REST, o Spring Boot poderá realizar a conversão dos textos recebidos para os valores correspondentes da enumeração.

Valores inexistentes resultarão em erro de conversão, que poderá ser tratado pela aplicação.

### Conclusão

A utilização de enumerações (`enum`) é uma solução adequada para definir atributos com valores pré-estabelecidos no HemoGestor.

Essa abordagem contribui para a padronização dos dados, reduz a possibilidade de informações inconsistentes e facilita a implementação das regras de negócio.

Além disso, a combinação de enumerações com `@Enumerated(EnumType.STRING)` permite integrar esses atributos ao MySQL de maneira organizada e legível, favorecendo a manutenção e a evolução do projeto.

---

## 3. Separação de responsabilidades entre Model, Service e Controller

**Prompt:**

> Como eu posso separar corretamente as responsabilidades entre Model, Service e Controller de uma classe, por exemplo a Doador?

**Resposta:**

Para organizar corretamente as responsabilidades entre as classes Model, Service e Controller no projeto HemoGestor, recomendo utilizar uma arquitetura em camadas, baseada no princípio da Separação de Responsabilidades (Separation of Concerns).

Essa abordagem permite dividir as funcionalidades da aplicação de acordo com suas responsabilidades, facilitando a manutenção, a realização de testes e a evolução do sistema.

Utilizando a classe `Doador` como exemplo, a organização pode ser realizada da seguinte maneira:

### 1. Model — Representação da entidade e suas regras

A camada Model deve representar os dados do doador e os comportamentos diretamente relacionados à entidade.

Na classe `Doador`, mantenha os atributos que caracterizam o doador, como nome, CPF, idade, peso, sexo, tipo sanguíneo e histórico de doações.

Também podem permanecer nessa classe métodos relacionados às regras de negócio da própria entidade, como:

- `verificarApto()`: verifica a aptidão do doador conforme as regras implementadas.
- `calculoProximaDoacao()`: calcula a próxima data permitida para doação.
- `doacaoAnterior()`: verifica informações referentes à doação anterior.
- `registrarDoacao()`: atualiza as informações do doador após uma doação.

A classe também deve conter as anotações JPA necessárias para o mapeamento com o banco de dados, como `@Entity`, `@Id` e `@GeneratedValue`.

Importante: a entidade não deve ser responsável por receber requisições HTTP ou executar diretamente consultas no banco de dados.

### 2. Repository — Acesso ao banco de dados

Embora a dúvida esteja relacionada às três camadas principais, recomendo manter também uma camada Repository, responsável exclusivamente pelo acesso aos dados.

No HemoGestor, utilize a interface `DoadorRepository`, estendendo `JpaRepository`.

```java
package br.inatel.repository;

import br.inatel.model.Doador;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoadorRepository
        extends JpaRepository<Doador, Long> {
}
```

Essa interface disponibiliza operações como `save()`, `findAll()`, `findById()` e `deleteById()`, sem a necessidade de implementar manualmente os comandos SQL básicos.

### 3. Service — Regras de negócio e coordenação das operações

A camada Service deve concentrar a lógica necessária para executar as funcionalidades do sistema, coordenando as entidades e os repositórios.

Na classe `DoadorService`, implemente métodos responsáveis por cadastrar, consultar, atualizar e excluir doadores.

Por exemplo:

```java
@Service
public class DoadorService {

    @Autowired
    private DoadorRepository repository;

    public List<Doador> listarTodos() {
        return repository.findAll();
    }

    public Doador salvar(Doador doador) {
        return repository.save(doador);
    }

    public Optional<Doador> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void excluir(Long id) {
        repository.deleteById(id);
    }
}
```

As validações que dependem de consultas ao banco de dados ou da interação entre diferentes entidades devem ser coordenadas nessa camada.

Por exemplo, antes de cadastrar um doador, o Service pode verificar se já existe outro registro com o mesmo CPF.

Entretanto, métodos que representam comportamentos internos da entidade, como `verificarApto()`, podem continuar no Model e ser chamados pelo Service quando necessário.

### 4. Controller — Comunicação com a API REST

A camada Controller deve ser responsável por receber as requisições HTTP, encaminhá-las para o Service e retornar as respostas adequadas.

Na classe `DoadorController`, utilize as anotações `@RestController` e `@RequestMapping` para definir os endpoints da API.

Por exemplo:

```java
@RestController
@RequestMapping("/doadores")
public class DoadorController {

    @Autowired
    private DoadorService service;

    @GetMapping
    public List<Doador> listarTodos() {
        return service.listarTodos();
    }

    @PostMapping
    public Doador cadastrar(@RequestBody Doador doador) {
        return service.salvar(doador);
    }
}
```

Nesse exemplo, o Controller não acessa diretamente o banco de dados e não implementa as regras de negócio. Sua responsabilidade é receber a requisição e delegar o processamento ao Service.

Em uma implementação mais completa, também é recomendável utilizar `ResponseEntity` para controlar os códigos HTTP e DTOs para definir os dados recebidos e retornados pela API.

### 5. Resumo das responsabilidades

| Camada | Responsabilidade |
|---|---|
| Model | Representar a entidade e implementar comportamentos próprios do doador. |
| Repository | Realizar as operações de persistência e consulta no banco de dados. |
| Service | Coordenar as funcionalidades, aplicar regras de negócio e utilizar os repositórios. |
| Controller | Receber requisições HTTP e retornar respostas da API REST. |

### Conclusão

Para o HemoGestor, recomendo manter a classe `Doador` responsável pela representação dos dados e por seus comportamentos internos, a classe `DoadorService` responsável pela coordenação das operações e a classe `DoadorController` responsável pela comunicação com o front-end.

O acesso ao MySQL deve permanecer concentrado no `DoadorRepository`, evitando o acoplamento direto entre as demais camadas e o banco de dados.

Essa organização segue os princípios de responsabilidade única e baixo acoplamento, contribuindo para um código mais organizado, reutilizável, testável e de fácil manutenção.

## 4. Organização da integração entre front-end e back-end

**Prompt:**

> Como eu posso organizar melhor a integração entre o front e o back do HemoGestor usando Axios, sem deixar toda a lógica concentrada em um lugar só?

**Resposta:**

Você pode organizar essa integração em camadas, deixando o Axios responsável apenas pela comunicação HTTP e distribuindo o restante da lógica entre arquivos específicos. No HemoGestor, uma estrutura adequada seria esta:

### 1. Centralizar a configuração do Axios em `src/services/api.ts`

Esse arquivo deve conter apenas a instância do Axios, com a `baseURL` configurada a partir da variável de ambiente.

```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})
```

Assim, nenhuma tela precisa saber diretamente qual é a URL do back-end.

### 2. Criar um service para cada entidade

Em vez de chamar `api.get()`, `api.post()` ou `api.delete()` diretamente dentro das páginas, você pode separar por responsabilidade:

```text
src/services/
├── api.ts
├── doadorService.ts
├── doacaoService.ts
├── bolsaService.ts
└── solicitacaoService.ts
```

Por exemplo, em `doadorService.ts`:

```ts
import { api } from './api'
import type { Doador } from '../types/doador'

export function getDoadores() {
  return api.get<Doador[]>('/doadores')
}

export function criarDoador(doador: Doador) {
  return api.post('/doadores', doador)
}

export function atualizarDoador(id: number, doador: Doador) {
  return api.put(`/doadores/${id}`, doador)
}

export function deletarDoador(id: number) {
  return api.delete(`/doadores/${id}`)
}
```

### 3. Deixar as páginas responsáveis pelo fluxo da interface

A `DoadoresPage`, por exemplo, não precisa conhecer os detalhes do Axios. Ela apenas chama:

```ts
const resposta = await getDoadores()
setDoadores(resposta.data)
```

ou:

```ts
await criarDoador(dados)
await carregarDoadores()
```

Assim, a página fica responsável por estado, carregamento, mensagens e atualização da interface, enquanto o service cuida da comunicação com o back-end.

### 4. Centralizar comportamentos repetidos em utilitários

Se várias telas estiverem repetindo a mesma lógica para validar respostas da API ou extrair mensagens de erro, isso também pode ser retirado das páginas.

Por exemplo, em um arquivo como:

```text
src/utils/erro.ts
```

você pode manter funções reutilizáveis, como:

```ts
export function obterMensagemErro(
    erro: unknown,
    mensagemPadrao: string,
): string {
    // tratamento do erro retornado pelo Axios
}
```

O mesmo vale para validações de respostas em lista, evitando repetir esse código em `DoadoresPage`, `EstoquePage`, `SolicitacoesPage` e outras telas.

A divisão final fica, portanto:

```text
Pages/Components
      ↓
Services
      ↓
api.ts (Axios)
      ↓
Spring Boot
```

E os utilitários ficam ao lado dessa estrutura para comportamentos compartilhados.

No HemoGestor, essa separação é especialmente útil porque vocês possuem várias entidades — doadores, doações, bolsas e solicitações — e cada uma pode ter seu próprio service sem concentrar toda a integração em um único arquivo. Isso também facilita os testes, porque cada service pode ser mockado separadamente nas páginas e componentes.

---

## 5. Centralização do tratamento de erros da API

**Prompt:**

> Eu percebi que várias telas do front estão repetindo o tratamento de erros e a validação das respostas da API. Tem como centralizar isso em funções reutilizáveis sem mudar o comportamento da aplicação?

**Resposta:**

Sim. No HemoGestor, a melhor forma de fazer isso é retirar das páginas a lógica repetida de tratamento de erro e validação de respostas e colocá-la em um utilitário compartilhado.

Por exemplo, você pode criar ou manter um arquivo como:

```text
src/utils/erro.ts
```

Nesse arquivo, podem ficar funções reutilizáveis como `obterMensagemErro` e `validarRespostaLista`.

Para o tratamento de erros, uma função pode receber o erro retornado pela API e uma mensagem padrão:

```ts
import { AxiosError } from 'axios'

export function obterMensagemErro(
    erro: unknown,
    mensagemPadrao: string,
): string {
    if (erro instanceof AxiosError) {
        const mensagem = erro.response?.data?.erro

        if (typeof mensagem === 'string') {
            return mensagem
        }
    }

    return mensagemPadrao
}
```

Assim, em vez de cada tela repetir verificações de `AxiosError`, `response`, `data` e `erro`, ela pode simplesmente fazer:

```ts
catch (erro) {
    setErro(
        obterMensagemErro(
            erro,
            'Não foi possível cadastrar o doador.',
        ),
    )
}
```

A mesma ideia pode ser usada para validar respostas que deveriam conter listas. Como várias telas do HemoGestor trabalham com coleções de doadores, doações, bolsas e solicitações, você pode centralizar essa verificação:

```ts
export function validarRespostaLista<T>(
    dados: unknown,
): T[] {
    if (!Array.isArray(dados)) {
        throw new Error('Resposta inválida da API')
    }

    return dados as T[]
}
```

Depois, em uma página como `DoadoresPage`, em vez de validar manualmente:

```ts
const resposta = await getDoadores()
const dados = validarRespostaLista<Doador>(resposta.data)

setDoadores(dados)
```

A mesma função pode ser reutilizada em `EstoquePage`, `RegistrarDoacaoPage` e `SolicitacoesPage`.

Essa mudança não precisa alterar o comportamento da aplicação. A ideia é apenas mover uma lógica que já existe para um lugar comum.

A divisão fica mais ou menos assim:

```text
services/
    api.ts
    doadorService.ts
    doacaoService.ts
    bolsaService.ts
    solicitacaoService.ts

utils/
    erro.ts
```

Os `services` continuam responsáveis pelas requisições HTTP, enquanto `erro.ts` concentra comportamentos compartilhados relacionados às respostas da API.

No HemoGestor, isso é especialmente útil porque evita que cada página tenha sua própria versão do tratamento de erros e da validação de listas, reduzindo duplicação e facilitando futuras alterações.

---

## 6. Testes do front-end no Jenkins

**Prompt:**

> Os testes do front passam localmente, mas alguns estão dando timeout no Jenkins. Como eu posso ajustar o Vitest para deixar esses testes mais estáveis no CI?

**Resposta:**

Nesse caso, eu ajustaria a configuração do Vitest pensando especificamente no ambiente de CI, porque o Jenkins costuma ter menos recursos disponíveis e alguns testes podem levar mais tempo do que na execução local.

No HemoGestor, você pode fazer isso no arquivo:

```text
frontend/vite.config.ts
```

Dentro da configuração de `test`, adicione um tempo maior para cada teste e limite a quantidade de workers:

```ts
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/setupTests.ts'],
  testTimeout: 20000,
  maxWorkers: 2,
```

O `testTimeout: 20000` aumenta o limite de execução de cada teste para 20 segundos. Isso ajuda nos testes de interface que usam `userEvent`, `findBy...` e outras operações assíncronas, que podem demorar mais dentro do Jenkins.

Já o:

```ts
maxWorkers: 2
```

reduz a quantidade de testes executados em paralelo. Isso evita que o Jenkins tente usar muitos recursos ao mesmo tempo e deixe os testes mais lentos ou instáveis.

No HemoGestor, a configuração pode ficar assim:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      testTimeout: 20000,
      maxWorkers: 2,
      coverage: {
       provider: 'v8',
       reporter: ['text', 'html', 'lcov', 'cobertura'],
       reportsDirectory: './coverage',
       reportOnFailure: true,
       include: ['src/**/*.{ts,tsx}'],
       exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx',
'src/setupTests.ts'],
      },
  },
})
```

Depois da alteração, eu validaria primeiro localmente com:

```bash
npm run test:ci
```

O objetivo é confirmar que a suíte continua passando sem alterar o comportamento dos testes.

Depois, a mesma branch pode ser executada no Jenkins. Se os testes que antes falhavam por `Test timed out in 5000ms` passarem, isso indica que o problema estava relacionado às condições do ambiente de CI, e não necessariamente à lógica dos testes.

Essa alteração melhora a estabilidade da pipeline sem modificar a funcionalidade da aplicação nem remover testes; apenas adapta a forma como eles são executados no Jenkins.
