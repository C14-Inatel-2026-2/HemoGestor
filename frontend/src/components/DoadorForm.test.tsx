import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DoadorForm from './DoadorForm'
import type { NovoDoador } from '../types/doador'

const doadoraAna: NovoDoador = {
  nome: 'Ana Souza',
  cpf: '52998224725',
  data_nascimento: '1995-04-12',
  sexo: 'FEMININO',
  tipo_sanguineo: 'O-',
  telefone: '(35) 99999-1111',
  email: 'ana.souza@email.com',
  cidade: 'Pouso Alegre',
  bairro: 'Centro',
  observacoes: '',
}

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
  
  it('abre preenchido com os dados do doador que está sendo editado', () => {
    render(<DoadorForm onSubmit={vi.fn()} onCancelar={vi.fn()} doadorInicial={doadoraAna} />)

    expect(screen.getByLabelText('Nome completo')).toHaveValue('Ana Souza')
    expect(screen.getByLabelText('CPF')).toHaveValue('52998224725')
    expect(screen.getByLabelText('Tipo sanguíneo')).toHaveValue('O-')
  })

  it('envia os dados alterados ao salvar uma edição', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <DoadorForm
        onSubmit={onSubmit}
        onCancelar={vi.fn()}
        doadorInicial={doadoraAna}
        textoSalvar="Salvar alterações"
      />,
    )

    await usuario.clear(screen.getByLabelText('Nome completo'))
    await usuario.type(screen.getByLabelText('Nome completo'), 'Ana Souza Lima')
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Ana Souza Lima', cpf: '52998224725' }),
    )
  })

  it('não envia a edição quando o nome é apagado', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DoadorForm onSubmit={onSubmit} onCancelar={vi.fn()} doadorInicial={doadoraAna} />)

    await usuario.clear(screen.getByLabelText('Nome completo'))
    await usuario.click(screen.getByRole('button', { name: 'Salvar doador' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe o nome do doador.')).toBeInTheDocument()
  })
})