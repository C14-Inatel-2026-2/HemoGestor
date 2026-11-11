import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { falhaDaApi, respostaCom } from '../testes/respostasApi'
import SolicitacoesPage from './SolicitacoesPage'
import { atenderSolicitacao, cancelarSolicitacao, concluirSolicitacao, criarSolicitacao, getSolicitacoes } from '../services/solicitacaoService'
import type { Solicitacao } from '../types/solicitacao'

vi.mock('../services/solicitacaoService')

const pendenteNormal: Solicitacao = {
  id: 1,
  instituicao: 'Hospital São Lucas',
  setor: 'Centro cirúrgico',
  tipoSanguineo: 'A+',
  quantidade: 2,
  prioridade: 'NORMAL',
  justificativa: 'Cirurgia eletiva',
  dataSolicitacao: '2026-11-01T08:00:00',
  status: 'PENDENTE',
  bolsasReservadas: [],
  bolsasCompativeisDisponiveis: 4,
}

const pendenteEmergencia: Solicitacao = {
  ...pendenteNormal,
  id: 2,
  instituicao: 'Santa Casa',
  tipoSanguineo: 'O-',
  prioridade: 'EMERGENCIA',
  dataSolicitacao: '2026-11-02T06:20:00',
}

const emAtendimentoUrgente: Solicitacao = {
  ...pendenteNormal,
  id: 3,
  instituicao: 'Hospital das Clínicas',
  prioridade: 'URGENTE',
  status: 'EM_ATENDIMENTO',
  bolsasReservadas: [7, 8],
}

const atendida: Solicitacao = {
  ...pendenteNormal,
  id: 4,
  instituicao: 'Clínica Vida',
  prioridade: 'EMERGENCIA',
  status: 'ATENDIDA',
  dataSolicitacao: '2026-10-30T10:00:00',
}

const cancelada: Solicitacao = {
  ...pendenteNormal,
  id: 5,
  status: 'CANCELADA',
  dataSolicitacao: '2026-10-31T10:00:00',
}

const todasAsSolicitacoes = [
  pendenteNormal,
  pendenteEmergencia,
  emAtendimentoUrgente,
  atendida,
  cancelada,
]

function codigosNaTabela(): string[] {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((linha) => within(linha).getAllByRole('cell')[0].textContent ?? '')
}

async function abrirDetalhes(codigo: string) {
  await userEvent.click(await screen.findByRole('button', { name: `Ver detalhes de ${codigo}` }))
  return screen.findByRole('dialog')
}

describe('SolicitacoesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getSolicitacoes).mockResolvedValue(respostaCom(todasAsSolicitacoes))
  })

  it('exibe nos cards e nas abas o resumo das solicitações', async () => {
    render(<SolicitacoesPage />)

    expect(await screen.findByText('SOL-001')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Pendentes' })).getByText('2')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Em atendimento' })).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Atendidas' })).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Urgentes/emergência' })).getByText('2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Solicitações ativas (3)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Histórico (2)' })).toBeInTheDocument()
  })

  it('ordena as solicitações ativas por prioridade e destaca emergências', async () => {
    render(<SolicitacoesPage />)

    const linha = (await screen.findByText('SOL-002')).closest('tr')

    expect(codigosNaTabela()).toEqual(['SOL-002', 'SOL-003', 'SOL-001'])
    expect(linha).toHaveClass('solicitacoes__linha--emergencia')
    expect(screen.getByText('SOL-001').closest('tr')).not.toHaveClass(
      'solicitacoes__linha--emergencia',
    )
  })

  it('atualiza a contagem de solicitações no singular e no plural', async () => {
    const usuario = userEvent.setup()

    render(<SolicitacoesPage />)

    await screen.findByText('SOL-001')

    expect(screen.getByText('3 solicitações')).toBeInTheDocument()

    await usuario.selectOptions(
      screen.getByRole('combobox', { name: 'Prioridade' }),
      'NORMAL',
    )

    expect(screen.getByText('1 solicitação')).toBeInTheDocument()
  })

  it('mostra as atendidas e canceladas na aba Histórico, sem destaque', async () => {
    render(<SolicitacoesPage />)
    await screen.findByText('SOL-001')

    await userEvent.click(screen.getByRole('button', { name: 'Histórico (2)' }))

    expect(codigosNaTabela()).toEqual(['SOL-005', 'SOL-004'])
    expect(screen.getByText('SOL-004').closest('tr')).not.toHaveClass('solicitacoes__linha--emergencia')
    expect(within(screen.getByRole('combobox', { name: 'Status' })).getByRole('option', { name: 'Cancelada' })).toBeInTheDocument()
  })

  it('limpa o filtro de status ao trocar de aba', async () => {
    render(<SolicitacoesPage />)
    await screen.findByText('SOL-001')

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'PENDENTE')
    await userEvent.click(screen.getByRole('button', { name: 'Histórico (2)' }))

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('')
    expect(codigosNaTabela()).toEqual(['SOL-005', 'SOL-004'])
  })

  it('filtra por status e por prioridade', async () => {
    render(<SolicitacoesPage />)
    await screen.findByText('SOL-001')

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'PENDENTE')
    expect(codigosNaTabela()).toEqual(['SOL-002', 'SOL-001'])

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Prioridade' }), 'NORMAL')
    expect(codigosNaTabela()).toEqual(['SOL-001'])
  })

  it('cria uma solicitação e atualiza a lista', async () => {
    const nova: Solicitacao = { ...pendenteNormal, id: 6, instituicao: 'Hospital Novo' }
    vi.mocked(getSolicitacoes)
      .mockResolvedValueOnce(respostaCom(todasAsSolicitacoes))
      .mockResolvedValueOnce(respostaCom([...todasAsSolicitacoes, nova]))
    vi.mocked(criarSolicitacao).mockResolvedValue(respostaCom(nova))

    render(<SolicitacoesPage />)
    await userEvent.click(await screen.findByRole('button', { name: '+ Nova solicitação' }))
    await userEvent.type(screen.getByLabelText('Instituição solicitante'), 'Hospital Novo')
    await userEvent.selectOptions(screen.getByLabelText('Tipo sanguíneo'), 'A+')
    await userEvent.click(screen.getByRole('button', { name: 'Criar solicitação' }))

    expect(await screen.findByText('Solicitação SOL-006 criada.')).toBeInTheDocument()
    expect(criarSolicitacao).toHaveBeenCalledWith({
      instituicao: 'Hospital Novo',
      setor: '',
      tipoSanguineo: 'A+',
      quantidade: 1,
      prioridade: 'NORMAL',
      justificativa: '',
    })
    expect(await screen.findByText('SOL-006')).toBeInTheDocument()
    expect(screen.queryByLabelText('Instituição solicitante')).not.toBeInTheDocument()
  })

  it('mantém o formulário aberto e mostra o erro quando a API recusa o cadastro', async () => {
    vi.mocked(criarSolicitacao).mockRejectedValue(falhaDaApi(400, { erro: 'Dados inválidos.' }))

    render(<SolicitacoesPage />)
    await userEvent.click(await screen.findByRole('button', { name: '+ Nova solicitação' }))
    await userEvent.type(screen.getByLabelText('Instituição solicitante'), 'Hospital Novo')
    await userEvent.selectOptions(screen.getByLabelText('Tipo sanguíneo'), 'A+')
    await userEvent.click(screen.getByRole('button', { name: 'Criar solicitação' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Dados inválidos.')
    expect(screen.getByLabelText('Instituição solicitante')).toHaveValue('Hospital Novo')
    expect(getSolicitacoes).toHaveBeenCalledTimes(1)
  })

  it('fecha o formulário ao cancelar', async () => {
    render(<SolicitacoesPage />)
    await userEvent.click(await screen.findByRole('button', { name: '+ Nova solicitação' }))

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByLabelText('Instituição solicitante')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Nova solicitação' })).toBeInTheDocument()
  })

  it('atende uma solicitação, fecha o painel e atualiza a lista', async () => {
    vi.mocked(getSolicitacoes)
      .mockResolvedValueOnce(respostaCom(todasAsSolicitacoes))
      .mockResolvedValueOnce(
        respostaCom([
          pendenteNormal,
          { ...pendenteEmergencia, status: 'EM_ATENDIMENTO' as const, bolsasReservadas: [1, 2] },
          emAtendimentoUrgente,
          atendida,
          cancelada,
        ]),
      )
    vi.mocked(atenderSolicitacao).mockResolvedValue(respostaCom(pendenteEmergencia))

    render(<SolicitacoesPage />)
    const painel = await abrirDetalhes('SOL-002')
    await userEvent.click(within(painel).getByRole('button', { name: 'Atender solicitação' }))

    expect(atenderSolicitacao).toHaveBeenCalledWith(2)
    expect(await screen.findByText('Solicitação SOL-002 em atendimento.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Em atendimento' })).getByText('2')).toBeInTheDocument()
  })

  it('mantém o painel aberto e mostra o motivo quando a API recusa o atendimento', async () => {
    const mensagem = 'Não há bolsas compatíveis suficientes para atender a solicitação.'
    vi.mocked(atenderSolicitacao).mockRejectedValue(falhaDaApi(409, { erro: mensagem }))

    render(<SolicitacoesPage />)
    const painel = await abrirDetalhes('SOL-002')
    await userEvent.click(within(painel).getByRole('button', { name: 'Atender solicitação' }))

    expect(await within(painel).findByRole('alert')).toHaveTextContent(mensagem)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(getSolicitacoes).toHaveBeenCalledTimes(2)
  })

  it('mostra erro quando a solicitação não existe', async () => {
    vi.mocked(atenderSolicitacao).mockRejectedValue(
      falhaDaApi(404, { erro: 'Solicitação não encontrada.' }),
    )

    render(<SolicitacoesPage />)
    const painel = await abrirDetalhes('SOL-002')
    await userEvent.click(
      within(painel).getByRole('button', { name: 'Atender solicitação' }),
    )

    expect(await within(painel).findByRole('alert')).toHaveTextContent(
      'Solicitação não encontrada.',
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('mostra erro quando a solicitação está em status inválido para concluir', async () => {
    vi.mocked(concluirSolicitacao).mockRejectedValue(
      falhaDaApi(409, {
        erro: 'Só é possível concluir solicitações em atendimento.',
      }),
    )

    render(<SolicitacoesPage />)
    const painel = await abrirDetalhes('SOL-003')

    await userEvent.click(
      within(painel).getByRole('button', { name: 'Concluir atendimento' }),
    )

    expect(await within(painel).findByRole('alert')).toHaveTextContent(
      'Só é possível concluir solicitações em atendimento.',
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('conclui uma solicitação em atendimento', async () => {
    vi.mocked(concluirSolicitacao).mockResolvedValue(respostaCom(emAtendimentoUrgente))

    render(<SolicitacoesPage />)
    const painel = await abrirDetalhes('SOL-003')
    await userEvent.click(within(painel).getByRole('button', { name: 'Concluir atendimento' }))

    expect(concluirSolicitacao).toHaveBeenCalledWith(3)
    expect(await screen.findByText('Solicitação SOL-003 concluída.')).toBeInTheDocument()
  })

  it('cancela uma solicitação', async () => {
    vi.mocked(cancelarSolicitacao).mockResolvedValue(respostaCom(pendenteNormal))

    render(<SolicitacoesPage />)
    const painel = await abrirDetalhes('SOL-001')
    await userEvent.click(within(painel).getByRole('button', { name: 'Cancelar solicitação' }))

    expect(cancelarSolicitacao).toHaveBeenCalledWith(1)
    expect(await screen.findByText('Solicitação SOL-001 cancelada.')).toBeInTheDocument()
  })

  it('não mostra o erro da ação anterior ao abrir o painel de novo', async () => {
    vi.mocked(atenderSolicitacao).mockRejectedValue(falhaDaApi(409, { erro: 'Sem estoque.' }))

    render(<SolicitacoesPage />)
    const painel = await abrirDetalhes('SOL-002')
    await userEvent.click(within(painel).getByRole('button', { name: 'Atender solicitação' }))
    await within(painel).findByRole('alert')
    await userEvent.click(within(painel).getByRole('button', { name: 'Fechar' }))

    const painelReaberto = await abrirDetalhes('SOL-002')

    expect(within(painelReaberto).queryByRole('alert')).not.toBeInTheDocument()
  })

  it('avisa quando não há solicitações', async () => {
    vi.mocked(getSolicitacoes).mockResolvedValue(respostaCom([]))

    render(<SolicitacoesPage />)

    expect(await screen.findByText('Nenhuma solicitação encontrada.')).toBeInTheDocument()
  })

  it('avisa quando não consegue carregar as solicitações', async () => {
    vi.mocked(getSolicitacoes).mockRejectedValue(new Error('Falha de rede'))

    render(<SolicitacoesPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar as solicitações.')
    expect(screen.queryByText('Nenhuma solicitação encontrada.')).not.toBeInTheDocument()
  })
})