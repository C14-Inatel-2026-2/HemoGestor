import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

function renderizarEm(caminho: string) {
  render(
    <MemoryRouter initialEntries={[caminho]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('navega para a tela de Estoque ao clicar no menu', async () => {
    renderizarEm('/dashboard')

    await userEvent.click(screen.getByRole('link', { name: 'Estoque' }))

    expect(screen.getByRole('heading', { name: 'Estoque' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Estoque' })).toHaveAttribute('aria-current', 'page')
  })

  it('redireciona para o Dashboard quando a rota não existe', () => {
    renderizarEm('/rota-inexistente')

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })
})