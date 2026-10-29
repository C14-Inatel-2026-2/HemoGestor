import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import {formatarCpf, montarRequisicaoDeEdicao, obterMensagemErro, paraDadosDoFormulario, validarCpf,} from './doador'
import type { Doador } from '../types/doador'

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