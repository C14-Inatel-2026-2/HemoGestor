import { describe, expect, it } from 'vitest'
import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { obterMensagemErro } from './erro'

describe('obterMensagemErro', () => {
  it('retorna a mensagem da API quando ela existe', () => {
    const erro = new AxiosError(
      'Bad Request',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        data: { erro: 'Já existe um doador cadastrado com esse CPF.' },
      } as AxiosResponse,
    )

    expect(obterMensagemErro(erro, 'Falha ao salvar.')).toBe(
      'Já existe um doador cadastrado com esse CPF.',
    )
  })

  it('concatena as mensagens quando a API retorna mais de um erro', () => {
    const erro = new AxiosError(
      'Bad Request',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        data: {
          nome: 'Nome é obrigatório.',
          cpf: 'CPF inválido.',
        },
      } as AxiosResponse,
    )

    expect(obterMensagemErro(erro, 'Falha ao salvar.')).toBe(
      'Nome é obrigatório. CPF inválido.',
    )
  })

  it('usa a mensagem padrão quando não existe resposta da API', () => {
    expect(
      obterMensagemErro(new Error('Network Error'), 'Falha ao salvar.'),
    ).toBe('Falha ao salvar.')
  })
})