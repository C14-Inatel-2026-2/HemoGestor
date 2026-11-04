import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SolicitacaoForm from './SolicitacaoForm'

describe('SolicitacaoForm', () => {
  it('começa com uma bolsa e prioridade normal', () => {
    render(<SolicitacaoForm onSubmit={vi.fn()} onCancelar={vi.fn()} />)

    expect(screen.getByLabelText('Quantidade de bolsas')).toHaveValue(1)
    expect(screen.getByLabelText('Prioridade')).toHaveValue('NORMAL')
  })

  it('não envia e mostra os avisos quando faltam campos obrigatórios', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SolicitacaoForm onSubmit={onSubmit} onCancelar={vi.fn()} />)

    await usuario.clear(screen.getByLabelText('Quantidade de bolsas'))
    await usuario.click(screen.getByRole('button', { name: 'Criar solicitação' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe a instituição solicitante.')).toBeInTheDocument()
    expect(screen.getByText('Selecione o tipo sanguíneo.')).toBeInTheDocument()
    expect(screen.getByText('Informe uma quantidade maior que zero.')).toBeInTheDocument()
  })

  it('envia os dados preenchidos', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SolicitacaoForm onSubmit={onSubmit} onCancelar={vi.fn()} />)

    await usuario.type(screen.getByLabelText('Instituição solicitante'), ' Hospital São Lucas ')
    await usuario.selectOptions(screen.getByLabelText('Tipo sanguíneo'), 'O-')
    await usuario.clear(screen.getByLabelText('Quantidade de bolsas'))
    await usuario.type(screen.getByLabelText('Quantidade de bolsas'), '3')
    await usuario.selectOptions(screen.getByLabelText('Prioridade'), 'EMERGENCIA')
    await usuario.type(screen.getByLabelText('Setor/responsável clínico'), 'UTI adulto')
    await usuario.type(screen.getByLabelText('Justificativa clínica'), 'Hemorragia pós-parto')
    await usuario.click(screen.getByRole('button', { name: 'Criar solicitação' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      instituicao: 'Hospital São Lucas',
      setor: 'UTI adulto',
      tipoSanguineo: 'O-',
      quantidade: 3,
      prioridade: 'EMERGENCIA',
      justificativa: 'Hemorragia pós-parto',
    })
  })

  it('avisa quando o usuário cancela', async () => {
    const usuario = userEvent.setup()
    const onCancelar = vi.fn()
    render(<SolicitacaoForm onSubmit={vi.fn()} onCancelar={onCancelar} />)

    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancelar).toHaveBeenCalledTimes(1)
  })

  it('desabilita o envio enquanto está salvando', () => {
    render(<SolicitacaoForm onSubmit={vi.fn()} onCancelar={vi.fn()} salvando />)

    expect(screen.getByRole('button', { name: 'Criando...' })).toBeDisabled()
  })
})