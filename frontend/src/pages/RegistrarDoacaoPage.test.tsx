import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import RegistrarDoacaoPage from './RegistrarDoacaoPage'
import {
  concluirDoacao,
  criarDoacao,
  descartarDoacao,
  getDoacoes,
} from '../services/doacaoService'
import { getDoadores } from '../services/doadorService'
import type { Doacao } from '../types/doacao'
import type { Doador } from '../types/doador'
import { dataDeHoje } from '../utils/doacao'

vi.mock('../services/doacaoService')
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
  ultima_doacao: '2026-04-18',
  status: 'APTO',
  qtd_doacoes: 9,
  observacoes: '',
}

const doacaoEmTriagem: Doacao = {
  id: 7,
  doadorId: 1,
  nomeDoador: 'Ana Souza',
  tipoSanguineo: 'O-',
  dataColeta: '2026-10-28',
  horaColeta: '10:30:00',
  volume_ml: 450,
  tipoDoacao: 'SANGUE_TOTAL',
  pressaoArterial: '120/80',
  hemoglobina: 14.2,
  sala: 'Sala 1',
  responsavel: 'Enf. Carla',
  intercorrencia: '',
  status: 'EM_TRIAGEM',
}

function respostaCom<T>(dados: T[]) {
  return { data: dados } as AxiosResponse<T[]>
}

function falhaDaApi(status: number, corpo: unknown) {
  return new AxiosError('Erro', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data: corpo,
  } as AxiosResponse)
}

describe('RegistrarDoacaoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDoadores).mockResolvedValue(respostaCom([doadoraAna]))
  })

  it('exibe na tabela as doações retornadas pela API', async () => {
    vi.mocked(getDoacoes).mockResolvedValue(respostaCom([doacaoEmTriagem]))

    render(<RegistrarDoacaoPage />)

    expect(await screen.findByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByText('28/10/2026 · 10:30')).toBeInTheDocument()
    expect(screen.getByText('Sangue total')).toBeInTheDocument()
    expect(screen.getByText('450 ml')).toBeInTheDocument()
    expect(screen.getByText('14,2 g/dL')).toBeInTheDocument()
    expect(screen.getByText('Em triagem', { selector: '.selo-status' })).toBeInTheDocument()
  })

  it('avisa quando não consegue carregar os dados', async () => {
    vi.mocked(getDoacoes).mockRejectedValue(new Error('Falha de rede'))

    render(<RegistrarDoacaoPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as doações.',
    )
  })

  it('registra uma doação pelo formulário e atualiza a lista', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoacoes)
      .mockResolvedValueOnce(respostaCom([]))
      .mockResolvedValueOnce(respostaCom([doacaoEmTriagem]))
    vi.mocked(criarDoacao).mockResolvedValue({ data: doacaoEmTriagem } as AxiosResponse<Doacao>)

    render(<RegistrarDoacaoPage />)
    expect(await screen.findByText('Nenhuma doação registrada.')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Nova doação' }))
    await usuario.selectOptions(screen.getByLabelText('Doador'), '1')
    await usuario.type(screen.getByLabelText('Hemoglobina (g/dL)'), '14,2')
    await usuario.type(screen.getByLabelText('Responsável'), 'Enf. Carla')
    await usuario.click(screen.getByRole('button', { name: 'Registrar doação' }))

    expect(await screen.findByText('Doação registrada com sucesso.')).toBeInTheDocument()
    expect(criarDoacao).toHaveBeenCalledWith(
      expect.objectContaining({ doadorId: 1, hemoglobina: 14.2, responsavel: 'Enf. Carla' }),
    )
    expect(await screen.findByText('Em triagem', { selector: '.selo-status' })).toBeInTheDocument()
    expect(getDoacoes).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('button', { name: 'Registrar doação' })).not.toBeInTheDocument()
  })

  it('mantém o formulário aberto e mostra o aviso quando a API recusa a doação', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoacoes).mockResolvedValue(respostaCom([]))
    vi.mocked(criarDoacao).mockRejectedValue(
      falhaDaApi(400, { erro: 'Data de coleta não pode ser futura.' }),
    )

    render(<RegistrarDoacaoPage />)
    await screen.findByText('Nenhuma doação registrada.')

    await usuario.click(screen.getByRole('button', { name: 'Nova doação' }))
    await usuario.selectOptions(screen.getByLabelText('Doador'), '1')
    await usuario.type(screen.getByLabelText('Hemoglobina (g/dL)'), '14,2')
    await usuario.type(screen.getByLabelText('Responsável'), 'Enf. Carla')
    await usuario.click(screen.getByRole('button', { name: 'Registrar doação' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Data de coleta não pode ser futura.',
    )
    expect(screen.getByRole('button', { name: 'Registrar doação' })).toBeInTheDocument()
    expect(screen.queryByText('Doação registrada com sucesso.')).not.toBeInTheDocument()
  })

  it('conclui uma doação em triagem e atualiza a lista', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoacoes)
      .mockResolvedValueOnce(respostaCom([doacaoEmTriagem]))
      .mockResolvedValueOnce(respostaCom([{ ...doacaoEmTriagem, status: 'CONCLUIDA' }]))
    vi.mocked(concluirDoacao).mockResolvedValue({} as AxiosResponse<Doacao>)

    render(<RegistrarDoacaoPage />)
    await screen.findByText('Em triagem', { selector: '.selo-status' })

    await usuario.click(screen.getByRole('button', { name: 'Concluir doação de Ana Souza' }))

    expect(await screen.findByText('Doação concluída com sucesso.')).toBeInTheDocument()
    expect(concluirDoacao).toHaveBeenCalledWith(7)
    expect(await screen.findByText('Concluída', { selector: '.selo-status' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Concluir doação de/ })).not.toBeInTheDocument()
  })

  it('descarta uma doação em triagem e atualiza a lista', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoacoes)
      .mockResolvedValueOnce(respostaCom([doacaoEmTriagem]))
      .mockResolvedValueOnce(respostaCom([{ ...doacaoEmTriagem, status: 'DESCARTADA' }]))
    vi.mocked(descartarDoacao).mockResolvedValue({} as AxiosResponse<Doacao>)

    render(<RegistrarDoacaoPage />)
    await screen.findByText('Em triagem', { selector: '.selo-status' })

    await usuario.click(screen.getByRole('button', { name: 'Descartar doação de Ana Souza' }))

    expect(await screen.findByText('Doação descartada.')).toBeInTheDocument()
    expect(descartarDoacao).toHaveBeenCalledWith(7)
    expect(await screen.findByText('Descartada', { selector: '.selo-status' })).toBeInTheDocument()
  })

  it('não oferece ações para doações que já foram concluídas', async () => {
    vi.mocked(getDoacoes).mockResolvedValue(
      respostaCom([{ ...doacaoEmTriagem, status: 'CONCLUIDA' as const }]),
    )

    render(<RegistrarDoacaoPage />)

    const linha = (await screen.findByText('Ana Souza')).closest('tr') as HTMLElement
    expect(within(linha).getByText('Concluída', { selector: '.selo-status' })).toBeInTheDocument()
    expect(within(linha).queryByRole('button')).not.toBeInTheDocument()
  })

    it('impede nova doação de quem já tem uma doação recente registrada', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoacoes).mockResolvedValue(
      respostaCom([{ ...doacaoEmTriagem, dataColeta: dataDeHoje() }]),
    )

    render(<RegistrarDoacaoPage />)
    await screen.findByText('Em triagem', { selector: '.selo-status' })
    await usuario.click(screen.getByRole('button', { name: 'Nova doação' }))

    expect(screen.getByRole('option', { name: /Ana Souza.*disponível em/ })).toBeDisabled()
  })

    describe('filtros', () => {
    const doacaoConcluida: Doacao = {
      ...doacaoEmTriagem,
      id: 8,
      nomeDoador: 'João Conceição',
      status: 'CONCLUIDA',
    }

    beforeEach(() => {
      vi.mocked(getDoacoes).mockResolvedValue(respostaCom([doacaoEmTriagem, doacaoConcluida]))
    })

    it('mostra só as doações do doador buscado e atualiza a contagem', async () => {
      const usuario = userEvent.setup()

      render(<RegistrarDoacaoPage />)
      await screen.findByText('Ana Souza')

      await usuario.type(screen.getByRole('searchbox', { name: 'Buscar por doador' }), 'joao')

      expect(screen.getByText('João Conceição')).toBeInTheDocument()
      expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument()
      expect(screen.getByText('1 doações')).toBeInTheDocument()
    })

    it('mostra só as doações do status escolhido', async () => {
      const usuario = userEvent.setup()

      render(<RegistrarDoacaoPage />)
      await screen.findByText('Ana Souza')

      await usuario.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'EM_TRIAGEM')

      expect(screen.getByText('Ana Souza')).toBeInTheDocument()
      expect(screen.queryByText('João Conceição')).not.toBeInTheDocument()
    })

    it('avisa quando nenhuma doação corresponde aos filtros', async () => {
      const usuario = userEvent.setup()

      render(<RegistrarDoacaoPage />)
      await screen.findByText('Ana Souza')

      await usuario.type(screen.getByRole('searchbox', { name: 'Buscar por doador' }), 'Pedro')

      expect(screen.getByText('Nenhuma doação encontrada.')).toBeInTheDocument()
      expect(screen.queryByText('Nenhuma doação registrada.')).not.toBeInTheDocument()
    })

    it('continua usando todas as doações para validar uma nova doação', async () => {
      const usuario = userEvent.setup()
      vi.mocked(getDoacoes).mockResolvedValue(
        respostaCom([{ ...doacaoEmTriagem, dataColeta: dataDeHoje() }]),
      )

      render(<RegistrarDoacaoPage />)
      await screen.findByText('Em triagem', { selector: '.selo-status' })

      await usuario.type(screen.getByRole('searchbox', { name: 'Buscar por doador' }), 'Pedro')
      await usuario.click(screen.getByRole('button', { name: 'Nova doação' }))

      expect(screen.getByRole('option', { name: /Ana Souza.*disponível em/ })).toBeDisabled()
    })
  })
})