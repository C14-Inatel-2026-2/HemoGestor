import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DoadorForm from './DoadorForm'

describe('DoadorForm', () => {
  it('não envia o cadastro quando o CPF é inválido', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DoadorForm onSubmit={onSubmit} onCancelar={vi.fn()} />)

    await usuario.type(screen.getByLabelText('Nome completo'), 'Ana Souza')
    await usuario.type(screen.getByLabelText('CPF'), '529.982.247-26')
    await usuario.click(screen.getByRole('button', { name: 'Salvar doador' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('CPF inválido.')).toBeInTheDocument()
  })

  it('desabilita o botão de salvar enquanto o cadastro está em andamento', () => {
    render(<DoadorForm onSubmit={vi.fn()} onCancelar={vi.fn()} salvando />)

    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled()
  })
})