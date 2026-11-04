import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SolicitacaoDetalhes from './SolicitacaoDetalhes'
import type { Solicitacao } from '../types/solicitacao'

const solicitacaoPendente: Solicitacao = {
  id: 5,
  instituicao: 'Hospital São Lucas',
  setor: 'UTI adulto',
  tipoSanguineo: 'O-',
  quantidade: 2,
  prioridade: 'EMERGENCIA',
  justificativa: 'Hemorragia pós-parto',
  dataSolicitacao: '2026-11-02T06:20:00',
  status: 'PENDENTE',
  bolsasReservadas: [],
  bolsasCompativeisDisponiveis: 4,
}

function renderizar(dados: Partial<Solicitacao> = {}, erro: string | null = null) {
  const acoes = {
    onFechar: vi.fn(),
    onAtender: vi.fn(),
    onConcluir: vi.fn(),
    onCancelar: vi.fn(),
  }
  render(
    <SolicitacaoDetalhes
      solicitacao={{ ...solicitacaoPendente, ...dados }}
      processando={false}
      erro={erro}
      {...acoes}
    />,
  )
  return acoes
}

describe('SolicitacaoDetalhes', () => {
  it('mostra os dados da solicitação', () => {
    renderizar()

    expect(screen.getByRole('dialog', { name: 'Hospital São Lucas' })).toBeInTheDocument()
    expect(screen.getByText('SOL-005')).toBeInTheDocument()
    expect(screen.getByText('Emergência')).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText('2 bolsas')).toBeInTheDocument()
    expect(screen.getByText('02/11/2026 · 06:20')).toBeInTheDocument()
    expect(screen.getByText('Hemorragia pós-parto')).toBeInTheDocument()
  })

  it('mostra um traço quando o setor e a justificativa não foram informados', () => {
    renderizar({ setor: '', justificativa: '' })

    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  it('permite atender quando há bolsas suficientes', async () => {
    const acoes = renderizar()

    expect(screen.getByText('Suficiente para atender esta solicitação.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Atender solicitação' }))

    expect(acoes.onAtender).toHaveBeenCalledTimes(1)
  })

  it('não permite atender quando faltam bolsas', () => {
    renderizar({ quantidade: 3, bolsasCompativeisDisponiveis: 1 })

    expect(screen.getByText('bolsa compatível disponível', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Insuficiente: esta solicitação pede 3 bolsas.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Atender solicitação' })).toBeDisabled()
  })

  it('oferece concluir e mostra as bolsas separadas quando está em atendimento', async () => {
    const acoes = renderizar({ status: 'EM_ATENDIMENTO', bolsasReservadas: [3, 7] })

    expect(screen.getByText('BOL-003')).toBeInTheDocument()
    expect(screen.getByText('BOL-007')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Disponibilidade' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Atender solicitação' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Concluir atendimento' }))

    expect(acoes.onConcluir).toHaveBeenCalledTimes(1)
  })

  it('permite cancelar uma solicitação ativa', async () => {
    const acoes = renderizar()

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar solicitação' }))

    expect(acoes.onCancelar).toHaveBeenCalledTimes(1)
  })

  it.each(['ATENDIDA', 'CANCELADA'] as const)('não oferece ações para uma solicitação %s', (status) => {
    renderizar({ status })

    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument()
  })

  it('mostra o erro recebido', () => {
    renderizar({}, 'Há apenas 2 bolsas compatíveis disponíveis para 3 solicitadas.')

    expect(screen.getByRole('alert')).toHaveTextContent('Há apenas 2 bolsas compatíveis disponíveis para 3 solicitadas.')
  })

  it('fecha pelo botão e ao clicar fora do painel, mas não ao clicar dentro dele', async () => {
    const acoes = renderizar()

    await userEvent.click(screen.getByText('Hemorragia pós-parto'))
    expect(acoes.onFechar).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(acoes.onFechar).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('dialog').parentElement!)
    expect(acoes.onFechar).toHaveBeenCalledTimes(2)
  })
})