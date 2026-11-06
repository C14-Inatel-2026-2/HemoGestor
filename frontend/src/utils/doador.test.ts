import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { formatarCpf, montarRequisicaoDeEdicao, normalizarTexto, obterMensagemErro, paraDadosDoFormulario, validarCpf } from './doador'
import type { Doador } from '../types/doador'
import { FILTROS_INICIAIS_DOADORES, filtrarDoadores, formatarTelefone, validarTelefone } from './doador'

describe('normalizarTexto', () => {
  it('remove acentos, espaços nas pontas e letras maiúsculas', () => {
    expect(normalizarTexto('  JOÃO Conceição ')).toBe('joao conceicao')
  })
})

describe('formatarCpf', () => {
  it('formata um CPF com 11 dígitos no padrão 000.000.000-00', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25')
  })
})

describe('validarCpf', () => {
  it('rejeita CPF com dígito verificador incorreto', () => {
    expect(validarCpf('529.982.247-26')).toBe(false)
  })
})

function erroDaApi(status: number, corpo: unknown): AxiosError {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data: corpo,
  } as AxiosResponse)
}

describe('obterMensagemErro', () => {
  it('usa a mensagem enviada pela API quando o CPF já está cadastrado', () => {
    const erro = erroDaApi(409, { erro: 'Já existe um doador cadastrado com esse CPF.' })

    expect(obterMensagemErro(erro, 'Falha ao salvar.')).toBe(
      'Já existe um doador cadastrado com esse CPF.',
    )
  })

  it('reúne as mensagens de validação de cada campo', () => {
    const erro = erroDaApi(400, {
      email: 'E-mail inválido.',
      qtd_doacoes: 'Quantidade de doações não pode ser negativa.',
    })

    expect(obterMensagemErro(erro, 'Falha ao salvar.')).toBe(
      'E-mail inválido. Quantidade de doações não pode ser negativa.',
    )
  })

  it('usa a mensagem padrão quando o erro não veio da API', () => {
    expect(obterMensagemErro(new Error('Network Error'), 'Falha ao salvar.')).toBe(
      'Falha ao salvar.',
    )
  })
})

const doadoraAna: Doador = {
  id: 1,
  nome: 'Ana Souza',
  cpf: '52998224725',
  data_nascimento: '1995-04-12',
  sexo: 'FEMININO',
  tipo_sanguineo: 'O-',
  telefone: '(35) 99999-1111',
  email: 'ana.souza@email.com',
  cidade: 'Pouso Alegre',
  bairro: 'Centro',
  ultima_doacao: '2026-08-18',
  status: 'APTO',
  qtd_doacoes: 9,
  observacoes: 'Sem restrições',
}

describe('paraDadosDoFormulario', () => {
  it('copia só os campos editáveis do doador', () => {
    expect(paraDadosDoFormulario(doadoraAna)).toEqual({
      nome: 'Ana Souza',
      cpf: '52998224725',
      data_nascimento: '1995-04-12',
      sexo: 'FEMININO',
      tipo_sanguineo: 'O-',
      telefone: '(35) 99999-1111',
      email: 'ana.souza@email.com',
      cidade: 'Pouso Alegre',
      bairro: 'Centro',
      observacoes: 'Sem restrições',
    })
  })

  it('troca campos nulos vindos da API por texto vazio', () => {
    const semContato = { ...doadoraAna, telefone: null, email: null } as unknown as Doador

    const dados = paraDadosDoFormulario(semContato)

    expect(dados.telefone).toBe('')
    expect(dados.email).toBe('')
  })
})

describe('montarRequisicaoDeEdicao', () => {
  it('mantém a última doação e a quantidade de doações do doador original', () => {
    const dados = { ...paraDadosDoFormulario(doadoraAna), nome: 'Ana Souza Lima' }

    const requisicao = montarRequisicaoDeEdicao(doadoraAna, dados)

    expect(requisicao.nome).toBe('Ana Souza Lima')
    expect(requisicao.ultima_doacao).toBe('2026-08-18')
    expect(requisicao.qtd_doacoes).toBe(9)
  })
})

describe('formatarTelefone', () => {
  it('formata um celular com 11 dígitos', () => {
    expect(formatarTelefone('35992243243')).toBe('(35) 99224-3243')
  })

  it('formata um telefone fixo com 10 dígitos', () => {
    expect(formatarTelefone('3234567890')).toBe('(32) 3456-7890')
  })

  it('padroniza um telefone que já veio com outra formatação', () => {
    expect(formatarTelefone('(32)9921-7788')).toBe('(32) 9921-7788')
  })

  it('devolve o valor original quando a quantidade de dígitos é inesperada', () => {
    expect(formatarTelefone('99221')).toBe('99221')
  })
})

describe('validarTelefone', () => {
  it('aceita telefone em branco, porque o campo é opcional', () => {
    expect(validarTelefone('')).toBe(true)
  })

  it('aceita telefone com 10 ou 11 dígitos, com ou sem formatação', () => {
    expect(validarTelefone('3234567890')).toBe(true)
    expect(validarTelefone('(35) 99224-3243')).toBe(true)
  })

  it('rejeita telefone sem DDD', () => {
    expect(validarTelefone('99224-3243')).toBe(false)
  })
})

describe('paraDadosDoFormulario com telefone', () => {
  it('abre o telefone formatado na edição', () => {
    const dados = paraDadosDoFormulario({ ...doadoraAna, telefone: '35992243243' })

    expect(dados.telefone).toBe('(35) 99224-3243')
  })
})

describe('filtrarDoadores', () => {
  const doadores = [
    { ...doadoraAna, id: 1 },
    { ...doadoraAna, id: 2, nome: 'João Conceição', cpf: '11144477735', tipo_sanguineo: 'A+', status: 'INAPTO' },
    { ...doadoraAna, id: 3, nome: 'Ana Lima', cpf: '12345678909', tipo_sanguineo: null, status: 'AGUARDANDO' },
  ] as Doador[]

  function idsDe(lista: Doador[]) {
    return lista.map((doador) => doador.id)
  }

  it('mostra todos quando não há filtro', () => {
    expect(idsDe(filtrarDoadores(doadores, FILTROS_INICIAIS_DOADORES))).toEqual([1, 2, 3])
  })

  it('busca pelo nome, sem diferenciar maiúsculas e acentos', () => {
    const filtros = { ...FILTROS_INICIAIS_DOADORES, busca: ' joao conc ' }

    expect(idsDe(filtrarDoadores(doadores, filtros))).toEqual([2])
  })

  it('busca pelo CPF, com ou sem formatação', () => {
    const semFormatacao = { ...FILTROS_INICIAIS_DOADORES, busca: '111444' }
    const comFormatacao = { ...FILTROS_INICIAIS_DOADORES, busca: '111.444.777-35' }

    expect(idsDe(filtrarDoadores(doadores, semFormatacao))).toEqual([2])
    expect(idsDe(filtrarDoadores(doadores, comFormatacao))).toEqual([2])
  })

  it('filtra pelo tipo sanguíneo', () => {
    const filtros = { ...FILTROS_INICIAIS_DOADORES, tipoSanguineo: 'A+' as const }

    expect(idsDe(filtrarDoadores(doadores, filtros))).toEqual([2])
  })

  it('filtra pelo status', () => {
    const filtros = { ...FILTROS_INICIAIS_DOADORES, status: 'AGUARDANDO' as const }

    expect(idsDe(filtrarDoadores(doadores, filtros))).toEqual([3])
  })

  it('combina todos os filtros', () => {
    const filtros = { busca: 'ana', tipoSanguineo: 'O-' as const, status: 'APTO' as const }

    expect(idsDe(filtrarDoadores(doadores, filtros))).toEqual([1])
  })

  it('devolve uma lista vazia quando nada corresponde', () => {
    const filtros = { ...FILTROS_INICIAIS_DOADORES, busca: 'Pedro' }

    expect(filtrarDoadores(doadores, filtros)).toEqual([])
  })
})