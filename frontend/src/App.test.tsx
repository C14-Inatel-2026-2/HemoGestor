import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AxiosResponse } from 'axios'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { getBolsas } from './services/bolsaService'
import { getDoacoes } from './services/doacaoService'
import { getSolicitacoes } from './services/solicitacaoService'
import type { Bolsa } from './types/bolsa'
import type { Doacao } from './types/doacao'
import type { Solicitacao } from './types/solicitacao'

vi.mock('./services/bolsaService')
vi.mock('./services/doacaoService')
vi.mock('./services/solicitacaoService')

function renderizarEm(caminho: string) {
  render(
    <MemoryRouter initialEntries={[caminho]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  beforeEach(() => {
    const semBolsas: Bolsa[] = []
    const semSolicitacoes: Solicitacao[] = []
    const semDoacoes: Doacao[] = []
    vi.mocked(getBolsas).mockResolvedValue({ data: semBolsas } as AxiosResponse<Bolsa[]>)
    vi.mocked(getSolicitacoes).mockResolvedValue({ data: semSolicitacoes } as AxiosResponse<Solicitacao[]>)
    vi.mocked(getDoacoes).mockResolvedValue({ data: semDoacoes } as AxiosResponse<Doacao[]>)
  })

  it('navega para a tela de Estoque ao clicar no menu', async () => {
    renderizarEm('/dashboard')

    await userEvent.click(screen.getByRole('link', { name: 'Estoque' }))

    expect(screen.getByRole('heading', { name: 'Estoque' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Estoque' })).toHaveAttribute('aria-current', 'page')
    expect(await screen.findByText('Nenhuma bolsa encontrada.')).toBeInTheDocument()
  })

  it('redireciona para o Dashboard quando a rota não existe', async () => {
    renderizarEm('/rota-inexistente')

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(await screen.findByText('Nenhuma solicitação ativa.')).toBeInTheDocument()
  })
})