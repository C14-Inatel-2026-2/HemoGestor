import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmarRemocaoDoador from './ConfirmarRemocaoDoador'

function renderizar(dados: { removendo?: boolean; erro?: string | null } = {}) {
  const onConfirmar = vi.fn()
  const onCancelar = vi.fn()
  const { container } = render(
    <ConfirmarRemocaoDoador
      nome="Ana Souza"
      removendo={dados.removendo ?? false}
      erro={dados.erro ?? null}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    />,
  )
  const fundo = container.querySelector('.confirmacao__fundo') as HTMLElement
  return { onConfirmar, onCancelar, fundo }
}

describe('ConfirmarRemocaoDoador', () => {
  it('mostra o nome do doador e começa com o foco em Cancelar', () => {
    renderizar()

    expect(screen.getByRole('alertdialog', { name: 'Remover doador' })).toHaveTextContent('Ana Souza')
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
  })

  it('confirma a remoção ao clicar em Remover', async () => {
    const { onConfirmar, onCancelar } = renderizar()

    await userEvent.click(screen.getByRole('button', { name: 'Remover' }))

    expect(onConfirmar).toHaveBeenCalledTimes(1)
    expect(onCancelar).not.toHaveBeenCalled()
  })

  it('cancela ao clicar em Cancelar', async () => {
    const { onCancelar } = renderizar()

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancelar).toHaveBeenCalledTimes(1)
  })

  it('cancela ao apertar Esc', async () => {
    const { onCancelar } = renderizar()

    await userEvent.keyboard('{Escape}')

    expect(onCancelar).toHaveBeenCalledTimes(1)
  })

  it('ignora as outras teclas', async () => {
    const { onCancelar } = renderizar()

    await userEvent.keyboard('a')

    expect(onCancelar).not.toHaveBeenCalled()
  })

  it('cancela ao clicar fora da caixa, mas não ao clicar dentro dela', async () => {
    const { onCancelar, fundo } = renderizar()

    await userEvent.click(screen.getByRole('alertdialog'))
    expect(onCancelar).not.toHaveBeenCalled()

    await userEvent.click(fundo)
    expect(onCancelar).toHaveBeenCalledTimes(1)
  })

  it('mostra o erro recebido', () => {
    renderizar({ erro: 'Não é possível remover um doador que já tem doações registradas.' })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não é possível remover um doador que já tem doações registradas.',
    )
  })

  it('não deixa fechar nem repetir enquanto está removendo', async () => {
    const { onCancelar, fundo } = renderizar({ removendo: true })

    await userEvent.keyboard('{Escape}')
    await userEvent.click(fundo)

    expect(onCancelar).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Removendo...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })
})