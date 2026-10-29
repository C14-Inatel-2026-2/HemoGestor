import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { formatarCpf, obterMensagemErro, validarCpf } from './doador'

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