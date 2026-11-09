import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MenuLateral from './MenuLateral'

function renderizarMenu(rotaInicial = '/dashboard') {
  render(
    <MemoryRouter initialEntries={[rotaInicial]}>
      <MenuLateral />
    </MemoryRouter>,
  )
}

describe('MenuLateral', () => {
  it('exibe os cinco links principais', () => {
    renderizarMenu()

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Doadores' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Doações' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Estoque' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Solicitações' })).toBeInTheDocument()
  })

  it('marca o link da rota atual como ativo', () => {
    renderizarMenu('/estoque')

    expect(screen.getByRole('link', { name: 'Estoque' })).toHaveClass('active')
  })
})