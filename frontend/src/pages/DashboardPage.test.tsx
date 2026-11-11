import { render, screen, within } from '@testing-library/react'
import type { AxiosResponse } from 'axios'
import { respostaCom } from '../testes/respostasApi'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'
import { getBolsas } from '../services/bolsaService'
import { getDoacoes } from '../services/doacaoService'
import { getSolicitacoes } from '../services/solicitacaoService'
import type { Bolsa } from '../types/bolsa'
import type { Doacao } from '../types/doacao'
import type { Solicitacao } from '../types/solicitacao'

vi.mock('../services/bolsaService')
vi.mock('../services/doacaoService')
vi.mock('../services/solicitacaoService')

const bolsaDisponivel: Bolsa = {
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

const bolsaVencendo: Bolsa = {
  ...bolsaDisponivel,
  id: 2,
  tipoSanguineo: 'A+',
  dataValidade: '2026-11-07',
}

const bolsaReservada: Bolsa = { ...bolsaDisponivel, id: 3, status: 'RESERVADA' }

const solicitacaoEmergencia: Solicitacao = {
  id: 1,
  instituicao: 'Santa Casa',
  setor: 'Pronto-socorro',
  tipoSanguineo: 'O-',
  quantidade: 3,
  prioridade: 'EMERGENCIA',
  justificativa: '',
  dataSolicitacao: '2026-11-02T06:20:00',
  status: 'PENDENTE',
  bolsasReservadas: [],
  bolsasCompativeisDisponiveis: 4,
}

const solicitacaoNormal: Solicitacao = {
  ...solicitacaoEmergencia,
  id: 2,
  instituicao: 'Hospital São Lucas',
  prioridade: 'NORMAL',
}

const solicitacaoAtendida: Solicitacao = {
  ...solicitacaoEmergencia,
  id: 3,
  instituicao: 'Clínica Vida',
  status: 'ATENDIDA',
}

const doacaoRecente: Doacao = {
  id: 1,
  doadorId: 1,
  nomeDoador: 'Ana Souza',
  tipoSanguineo: 'O-',
  dataColeta: '2026-11-01',
  horaColeta: '10:30:00',
  volume_ml: 450,
  tipoDoacao: 'SANGUE_TOTAL',
  pressaoArterial: '',
  hemoglobina: 14.2,
  sala: '',
  responsavel: 'Enf. Carla',
  intercorrencia: '',
  status: 'CONCLUIDA',
}

function renderizar() {
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

function valorDoCard(nome: string) {
  return within(screen.getByRole('group', { name: nome }))
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 2, 12, 0))
    vi.mocked(getBolsas).mockResolvedValue(
      respostaCom([bolsaDisponivel, bolsaVencendo, bolsaReservada]),
    )
    vi.mocked(getSolicitacoes).mockResolvedValue(
      respostaCom([solicitacaoNormal, solicitacaoEmergencia, solicitacaoAtendida]),
    )
    vi.mocked(getDoacoes).mockResolvedValue(respostaCom([doacaoRecente]))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exibe o resumo nos cards', async () => {
    renderizar()

    await screen.findByText('Santa Casa')

    expect(valorDoCard('Bolsas disponíveis').getByText('2')).toBeInTheDocument()
    expect(valorDoCard('Estoques em nível crítico').getByText('8')).toBeInTheDocument()
    expect(valorDoCard('Solicitações pendentes').getByText('2')).toBeInTheDocument()
    expect(valorDoCard('Doações nos últimos 7 dias').getByText('1')).toBeInTheDocument()
  })

  it('mostra o estoque de cada tipo sanguíneo', async () => {
    renderizar()

    const estoqueOMenos = within(await screen.findByRole('group', { name: 'Estoque O-' }))

    expect(estoqueOMenos.getByText('1')).toBeInTheDocument()
    expect(estoqueOMenos.getByText('Crítico')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Estoque B+' })).getByText('0')).toBeInTheDocument()
  })

  it('mostra como adequado o tipo que atinge o limite', async () => {
    const bolsas = Array.from({ length: 10 }, (_, indice) => ({ ...bolsaDisponivel, id: indice + 1 }))
    vi.mocked(getBolsas).mockResolvedValue(respostaCom(bolsas))

    renderizar()

    const estoqueOMenos = within(await screen.findByRole('group', { name: 'Estoque O-' }))

    expect(estoqueOMenos.getByText('Adequado')).toBeInTheDocument()
  })

  it('lista só as solicitações ativas, com as emergências primeiro e em destaque', async () => {
    renderizar()

    const linha = (await screen.findByText('Santa Casa')).closest('tr')
    const linhas = screen.getAllByRole('row').slice(1)

    expect(linhas).toHaveLength(2)
    expect(linhas[0]).toBe(linha)
    expect(linha).toHaveClass('solicitacoes__linha--emergencia')
    expect(screen.queryByText('Clínica Vida')).not.toBeInTheDocument()
  })

  it('mostra os alertas com link para a área correspondente', async () => {
    renderizar()

    const emergencia = await screen.findByRole('link', { name: /1 solicitação de emergência/ })

    expect(emergencia).toHaveAttribute('href', '/solicitacoes')
    expect(screen.getByRole('link', { name: /8 tipos em estoque crítico/ })).toHaveAttribute('href', '/estoque')
    expect(screen.getByRole('link', { name: /1 bolsa próxima do vencimento/ })).toHaveAttribute('href', '/estoque')
  })

  it('oferece links para as telas completas', async () => {
    renderizar()
    await screen.findByText('Santa Casa')

    expect(screen.getByRole('link', { name: 'Ver estoque completo' })).toHaveAttribute('href', '/estoque')
    expect(screen.getByRole('link', { name: 'Ver fila completa' })).toHaveAttribute('href', '/solicitacoes')
  })

  it('avisa quando não há solicitações ativas', async () => {
    vi.mocked(getSolicitacoes).mockResolvedValue(respostaCom([solicitacaoAtendida]))

    renderizar()

    expect(await screen.findByText('Nenhuma solicitação ativa.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('avisa quando não há alertas', async () => {
    const tipos = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
    const bolsas = tipos.flatMap((tipoSanguineo, posicao) =>
      Array.from({ length: 10 }, (_, indice) => ({
        ...bolsaDisponivel,
        id: posicao * 10 + indice,
        tipoSanguineo,
      })),
    )
    vi.mocked(getBolsas).mockResolvedValue(respostaCom(bolsas))
    vi.mocked(getSolicitacoes).mockResolvedValue(respostaCom([]))

    renderizar()

    expect(await screen.findByText('Nenhum alerta no momento.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mantém o restante da tela quando as solicitações não carregam', async () => {
    vi.mocked(getSolicitacoes).mockRejectedValue(new Error('Falha de rede'))

    renderizar()

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar: solicitações.')
    expect(valorDoCard('Solicitações pendentes').getByText('—')).toBeInTheDocument()
    expect(valorDoCard('Bolsas disponíveis').getByText('2')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /8 tipos em estoque crítico/ })).toBeInTheDocument()
    expect(screen.queryByText('Nenhuma solicitação ativa.')).not.toBeInTheDocument()
  })

  it('não mostra estoque crítico quando as bolsas não carregam', async () => {
    vi.mocked(getBolsas).mockRejectedValue(new Error('Falha de rede'))

    renderizar()

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar: estoque.')
    expect(valorDoCard('Estoques em nível crítico').getByText('—')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Estoque O-' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /estoque crítico/ })).not.toBeInTheDocument()
  })

  it('trata como falha uma resposta que não é lista', async () => {
    vi.mocked(getBolsas).mockResolvedValue({
      data: { mensagem: 'Não existem bolsas cadastradas.' },
    } as unknown as AxiosResponse<Bolsa[]>)

    renderizar()

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar: estoque.')
  })

  it('lista todas as áreas que falharam', async () => {
    vi.mocked(getBolsas).mockRejectedValue(new Error('Falha de rede'))
    vi.mocked(getSolicitacoes).mockRejectedValue(new Error('Falha de rede'))
    vi.mocked(getDoacoes).mockRejectedValue(new Error('Falha de rede'))

    renderizar()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar: estoque, solicitações, doações.',
    )
  })
})