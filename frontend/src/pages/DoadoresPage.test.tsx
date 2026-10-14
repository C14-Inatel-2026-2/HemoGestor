import { render, screen } from '@testing-library/react'
import type { AxiosResponse } from 'axios'
import DoadoresPage from './DoadoresPage'
import { getDoadores } from '../services/doadorService'
import type { Doador } from '../types/doador'

vi.mock('../services/doadorService')

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
  observacoes: '',
}

describe('DoadoresPage', () => {
  it('exibe na tabela os doadores retornados pela API', async () => {
    vi.mocked(getDoadores).mockResolvedValue({ data: [doadoraAna] } as AxiosResponse<Doador[]>)

    render(<DoadoresPage />)

    expect(await screen.findByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByText('529.982.247-25')).toBeInTheDocument()
    expect(screen.getByText('18/08/2026')).toBeInTheDocument()
    expect(screen.getByText('Apto')).toBeInTheDocument()
    expect(getDoadores).toHaveBeenCalledTimes(1)
  })
})