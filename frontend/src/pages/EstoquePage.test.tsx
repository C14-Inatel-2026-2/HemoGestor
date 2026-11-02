import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import EstoquePage from './EstoquePage'
import { descartarBolsa, getBolsas } from '../services/bolsaService'
import type { Bolsa } from '../types/bolsa'

vi.mock('../services/bolsaService')

const bolsaValida: Bolsa = {
  id: 1,
  doacaoId: 1,
  doadorId: 1,
  nomeDoador: 'Ana Souza',
  tipoSanguineo: 'O-',
  tipoDoacao: 'SANGUE_TOTAL',
  volume_ml: 450,
  dataColeta: '2026-10-20',
  dataValidade: '2026-12-01',
  status: 'DISPONIVEL',
}

const bolsaReservadaVencendo: Bolsa = {
  ...bolsaValida,
  id: 2,
  doacaoId: 2,
  nomeDoador: 'Carlos Lima',
  tipoSanguineo: 'A+',
  dataValidade: '2026-11-05',
  status: 'RESERVADA',
}

const bolsaVencida: Bolsa = {
  ...bolsaValida,
  id: 3,
  doacaoId: 3,
  nomeDoador: 'João Ferreira',
  tipoSanguineo: 'B+',
  dataValidade: '2026-10-30',
}

const bolsaDescartada: Bolsa = {
  ...bolsaValida,
  id: 4,
  doacaoId: 4,
  nomeDoador: 'Beatriz Rocha',
  tipoSanguineo: 'AB-',
  dataValidade: '2026-11-20',
  status: 'DESCARTADA',
}

const todasAsBolsas = [bolsaValida, bolsaReservadaVencendo, bolsaVencida, bolsaDescartada]

function respostaCom<T>(dados: T[]) {
  return { data: dados } as AxiosResponse<T[]>
}

function falhaDaApi(status: number, corpo: unknown) {
  return new AxiosError('Erro', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data: corpo,
  } as AxiosResponse)
}

function codigosNaTabela(): string[] {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((linha) => within(linha).getAllByRole('cell')[0].textContent ?? '')
}

describe('EstoquePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 2, 12, 0))
    vi.mocked(getBolsas).mockResolvedValue(respostaCom(todasAsBolsas))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exibe nos cards o resumo do estoque', async () => {
    render(<EstoquePage />)

    expect(await screen.findByText('BOL-001')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Bolsas no estoque' })).getByText('2')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Disponíveis' })).getByText('1')).toBeInTheDocument()
    expect(screen.getByText('1 reservadas')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Vencem em 7 dias' })).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Fora do estoque' })).getByText('2')).toBeInTheDocument()
  })

  it('mostra no estoque atual só as bolsas válidas, das que vencem primeiro às últimas', async () => {
    render(<EstoquePage />)

    await screen.findByText('BOL-001')

    expect(codigosNaTabela()).toEqual(['BOL-002', 'BOL-001'])
    expect(screen.getByText('2 bolsas')).toBeInTheDocument()
  })

  it('destaca a bolsa que vence em breve e informa quantos dias faltam', async () => {
    render(<EstoquePage />)

    const linha = (await screen.findByText('BOL-002')).closest('tr')

    expect(linha).toHaveClass('estoque__linha--alerta')
    expect(within(linha!).getByText('em 3 dias')).toBeInTheDocument()
    expect(screen.getByText('29 dias restantes')).toBeInTheDocument()
  })

  it('mostra as bolsas vencidas e descartadas na aba Fora do estoque', async () => {
    render(<EstoquePage />)
    await screen.findByText('BOL-001')

    await userEvent.click(screen.getByRole('button', { name: 'Fora do estoque' }))

    expect(codigosNaTabela()).toEqual(['BOL-003', 'BOL-004'])
    expect(screen.getByText('Vencida')).toBeInTheDocument()
    expect(screen.getByText('vencida há 3 dias')).toBeInTheDocument()
    expect(screen.queryByLabelText('Somente próximas do vencimento')).not.toBeInTheDocument()
  })

  it('filtra as bolsas pelo tipo sanguíneo', async () => {
    render(<EstoquePage />)
    await screen.findByText('BOL-001')

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Tipo sanguíneo' }), 'O-')

    expect(codigosNaTabela()).toEqual(['BOL-001'])
  })

  it('mostra só as bolsas próximas do vencimento quando a opção é marcada', async () => {
    render(<EstoquePage />)
    await screen.findByText('BOL-001')

    await userEvent.click(screen.getByLabelText('Somente próximas do vencimento'))

    expect(codigosNaTabela()).toEqual(['BOL-002'])
  })

  it('não oferece descarte para bolsas reservadas', async () => {
    render(<EstoquePage />)
    await screen.findByText('BOL-002')

    expect(screen.getByRole('button', { name: 'Descartar bolsa BOL-001' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Descartar bolsa BOL-002' })).not.toBeInTheDocument()
  })

  it('descarta uma bolsa e atualiza a lista', async () => {
    vi.mocked(getBolsas)
      .mockResolvedValueOnce(respostaCom(todasAsBolsas))
      .mockResolvedValueOnce(
        respostaCom([{ ...bolsaValida, status: 'DESCARTADA' }, bolsaReservadaVencendo, bolsaVencida, bolsaDescartada]),
      )
    vi.mocked(descartarBolsa).mockResolvedValue({
      data: { ...bolsaValida, status: 'DESCARTADA' },
    } as AxiosResponse<Bolsa>)

    render(<EstoquePage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Descartar bolsa BOL-001' }))

    expect(descartarBolsa).toHaveBeenCalledWith(1)
    expect(await screen.findByText('Bolsa BOL-001 descartada.')).toBeInTheDocument()
    expect(codigosNaTabela()).toEqual(['BOL-002'])
    expect(getBolsas).toHaveBeenCalledTimes(2)
  })

  it('mantém a bolsa na lista e mostra o aviso quando a API recusa o descarte', async () => {
    vi.mocked(descartarBolsa).mockRejectedValue(
      falhaDaApi(409, { erro: 'Só é possível descartar bolsas disponíveis.' }),
    )

    render(<EstoquePage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Descartar bolsa BOL-001' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Só é possível descartar bolsas disponíveis.')
    expect(screen.getByText('BOL-001')).toBeInTheDocument()
    expect(getBolsas).toHaveBeenCalledTimes(1)
  })

  it('avisa quando não consegue carregar o estoque', async () => {
    vi.mocked(getBolsas).mockRejectedValue(new Error('Falha de rede'))

    render(<EstoquePage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar o estoque.')
    expect(screen.queryByText('Nenhuma bolsa encontrada.')).not.toBeInTheDocument()
  })
})