import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DoacaoForm from './DoacaoForm'
import type { Doacao } from '../types/doacao'
import type { Doador } from '../types/doador'
import { dataDeHoje } from '../utils/doacao'

const doadoraAna: Doador = {
  id: 1,
  nome: 'Ana Souza',
  cpf: '52998224725',
  data_nascimento: '1995-04-12',
  sexo: 'FEMININO',
  tipo_sanguineo: 'O-',
  telefone: '(35) 99999-1111',
  email: 'ana.souza@email.com',
  cidade: 'Pouso Alegre',
  bairro: 'Centro',
  ultima_doacao: '2026-04-18',
  status: 'APTO',
  qtd_doacoes: 9,
  observacoes: '',
}

const doadorRecente: Doador = {
  ...doadoraAna,
  id: 2,
  nome: 'Bruno Lima',
  cpf: '11144477735',
  status: 'AGUARDANDO',
}

const doacaoDeHoje: Doacao = {
  id: 7,
  doadorId: 1,
  nomeDoador: 'Ana Souza',
  tipoSanguineo: 'O-',
  dataColeta: dataDeHoje(),
  horaColeta: '10:30:00',
  volume_ml: 450,
  tipoDoacao: 'SANGUE_TOTAL',
  pressaoArterial: '',
  hemoglobina: 14.2,
  sala: '',
  responsavel: 'Enf. Carla',
  intercorrencia: '',
  status: 'EM_TRIAGEM',
}

describe('DoacaoForm', () => {
  it('lista os doadores e desabilita os que não estão aptos', () => {
    render(<DoacaoForm doadores={[doadoraAna, doadorRecente]} onSubmit={vi.fn()} onCancelar={vi.fn()} />)

    expect(screen.getByRole('option', { name: /Ana Souza/ })).toBeEnabled()
    expect(screen.getByRole('option', { name: /Bruno Lima.*Aguardando/ })).toBeDisabled()
  })

  it('não envia e mostra os avisos quando faltam campos obrigatórios', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DoacaoForm doadores={[doadoraAna]} onSubmit={onSubmit} onCancelar={vi.fn()} />)

    await usuario.click(screen.getByRole('button', { name: 'Registrar doação' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Selecione o doador.')).toBeInTheDocument()
    expect(screen.getByText('Informe uma hemoglobina maior que zero.')).toBeInTheDocument()
    expect(screen.getByText('Informe o responsável pela coleta.')).toBeInTheDocument()
  })

  it('envia a doação no formato esperado pela API', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DoacaoForm doadores={[doadoraAna]} onSubmit={onSubmit} onCancelar={vi.fn()} />)

    await usuario.selectOptions(screen.getByLabelText('Doador'), '1')
    fireEvent.change(screen.getByLabelText('Hora da coleta'), { target: { value: '10:30' } })
    await usuario.type(screen.getByLabelText('Hemoglobina (g/dL)'), '14,2')
    await usuario.type(screen.getByLabelText('Responsável'), 'Enf. Carla')
    await usuario.click(screen.getByRole('button', { name: 'Registrar doação' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        doadorId: 1,
        horaColeta: '10:30',
        volume_ml: 450,
        tipoDoacao: 'SANGUE_TOTAL',
        hemoglobina: 14.2,
        responsavel: 'Enf. Carla',
      }),
    )
  })

  it('desabilita o botão enquanto a doação está sendo registrada', () => {
    render(<DoacaoForm doadores={[doadoraAna]} onSubmit={vi.fn()} onCancelar={vi.fn()} salvando />)

    expect(screen.getByRole('button', { name: 'Registrando...' })).toBeDisabled()
  })

  it('chama o cancelamento ao clicar em Cancelar', async () => {
    const usuario = userEvent.setup()
    const onCancelar = vi.fn()
    render(<DoacaoForm doadores={[doadoraAna]} onSubmit={vi.fn()} onCancelar={onCancelar} />)

    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancelar).toHaveBeenCalledTimes(1)
  })

    it('desabilita o doador que já tem uma doação recente e informa quando ele poderá doar', () => {
    render(
      <DoacaoForm
        doadores={[doadoraAna]}
        doacoes={[doacaoDeHoje]}
        onSubmit={vi.fn()}
        onCancelar={vi.fn()}
      />,
    )

    expect(screen.getByRole('option', { name: /Ana Souza.*disponível em/ })).toBeDisabled()
  })

  it('não envia quando a data da coleta fere o intervalo mínimo entre doações', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DoacaoForm doadores={[doadoraAna]} onSubmit={onSubmit} onCancelar={vi.fn()} />)

    await usuario.selectOptions(screen.getByLabelText('Doador'), '1')
    fireEvent.change(screen.getByLabelText('Data da coleta'), { target: { value: '2026-06-01' } })
    await usuario.type(screen.getByLabelText('Hemoglobina (g/dL)'), '14,2')
    await usuario.type(screen.getByLabelText('Responsável'), 'Enf. Carla')
    await usuario.click(screen.getByRole('button', { name: 'Registrar doação' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(
      screen.getByText(
        'Ana Souza só poderá doar novamente a partir de 17/07/2026 (intervalo mínimo de 90 dias).',
      ),
    ).toBeInTheDocument()
  })
})