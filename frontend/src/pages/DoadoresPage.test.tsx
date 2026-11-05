import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import DoadoresPage from './DoadoresPage'
import { atualizarDoador, criarDoador, deletarDoador, getDoadores } from '../services/doadorService'
import type { Doador } from '../types/doador'

vi.mock('../services/doadorService')

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
  ultima_doacao: '2026-08-18',
  status: 'APTO',
  qtd_doacoes: 9,
  observacoes: '',
}

function respostaComLista(doadores: Doador[]) {
  return { data: doadores } as AxiosResponse<Doador[]>
}

describe('DoadoresPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe na tabela os doadores retornados pela API', async () => {
    vi.mocked(getDoadores).mockResolvedValue(respostaComLista([doadoraAna]))

    render(<DoadoresPage />)

    expect(await screen.findByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByText('529.982.247-25')).toBeInTheDocument()
    expect(screen.getByText('18/08/2026')).toBeInTheDocument()
    expect(screen.getByText('Apto')).toBeInTheDocument()
    expect(getDoadores).toHaveBeenCalledTimes(1)
  })

  it('cadastra um doador pelo formulário e atualiza a lista', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores)
      .mockResolvedValueOnce(respostaComLista([]))
      .mockResolvedValueOnce(respostaComLista([doadoraAna]))
    vi.mocked(criarDoador).mockResolvedValue({ data: doadoraAna } as AxiosResponse<Doador>)

    render(<DoadoresPage />)
    expect(await screen.findByText('Nenhum doador cadastrado.')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Novo doador' }))
    await usuario.type(screen.getByLabelText('Nome completo'), 'Ana Souza')
    await usuario.type(screen.getByLabelText('CPF'), '529.982.247-25')
    await usuario.type(screen.getByLabelText('Data de nascimento'), '1995-04-12')
    await usuario.selectOptions(screen.getByLabelText('Tipo sanguíneo'), 'O-')
    await usuario.click(screen.getByRole('button', { name: 'Salvar doador' }))

    expect(await screen.findByText('Doador cadastrado com sucesso.')).toBeInTheDocument()
    expect(criarDoador).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Ana Souza', cpf: '52998224725' }),
    )
    expect(await screen.findByText('529.982.247-25')).toBeInTheDocument()
    expect(getDoadores).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('button', { name: 'Salvar doador' })).not.toBeInTheDocument()
  })

  it('mantém o formulário aberto e mostra o aviso quando o CPF já está cadastrado', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores).mockResolvedValue(respostaComLista([doadoraAna]))
    vi.mocked(criarDoador).mockRejectedValue(
      new AxiosError('Conflict', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 409,
        data: { erro: 'Já existe um doador cadastrado com esse CPF.' },
      } as AxiosResponse),
    )

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Novo doador' }))
    await usuario.type(screen.getByLabelText('Nome completo'), 'Ana Souza')
    await usuario.type(screen.getByLabelText('CPF'), '529.982.247-25')
    await usuario.type(screen.getByLabelText('Data de nascimento'), '1995-04-12')
    await usuario.selectOptions(screen.getByLabelText('Tipo sanguíneo'), 'O-')
    await usuario.click(screen.getByRole('button', { name: 'Salvar doador' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe um doador cadastrado com esse CPF.',
    )
    expect(screen.getByRole('button', { name: 'Salvar doador' })).toBeInTheDocument()
    expect(screen.queryByText('Doador cadastrado com sucesso.')).not.toBeInTheDocument()
    expect(getDoadores).toHaveBeenCalledTimes(1)
  })

  it('fecha o formulário sem cadastrar quando o usuário cancela', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores).mockResolvedValue(respostaComLista([]))

    render(<DoadoresPage />)
    await screen.findByText('Nenhum doador cadastrado.')

    await usuario.click(screen.getByRole('button', { name: 'Novo doador' }))
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('button', { name: 'Salvar doador' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo doador' })).toBeInTheDocument()
    expect(criarDoador).not.toHaveBeenCalled()
  })

  it('abre o formulário preenchido ao clicar em Editar', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores).mockResolvedValue(respostaComLista([doadoraAna]))

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Editar Ana Souza' }))

    expect(screen.getByRole('heading', { name: 'Editar doador' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Ana Souza')
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument()
  })

  it('atualiza o doador, mantém a quantidade de doações e atualiza a lista', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores)
      .mockResolvedValueOnce(respostaComLista([doadoraAna]))
      .mockResolvedValueOnce(respostaComLista([{ ...doadoraAna, nome: 'Ana Souza Lima' }]))
    vi.mocked(atualizarDoador).mockResolvedValue({ data: doadoraAna } as AxiosResponse<Doador>)

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Editar Ana Souza' }))
    await usuario.clear(screen.getByLabelText('Nome completo'))
    await usuario.type(screen.getByLabelText('Nome completo'), 'Ana Souza Lima')
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByText('Doador atualizado com sucesso.')).toBeInTheDocument()
    expect(atualizarDoador).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        nome: 'Ana Souza Lima',
        qtd_doacoes: 9,
        ultima_doacao: '2026-08-18',
      }),
    )
    expect(await screen.findByText('Ana Souza Lima')).toBeInTheDocument()
    expect(getDoadores).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('button', { name: 'Salvar alterações' })).not.toBeInTheDocument()
  })

  it('mantém o formulário aberto e mostra o aviso quando a edição é recusada', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores).mockResolvedValue(respostaComLista([doadoraAna]))
    vi.mocked(atualizarDoador).mockRejectedValue(
      new AxiosError('Conflict', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 409,
        data: { erro: 'Já existe um doador cadastrado com esse CPF.' },
      } as AxiosResponse),
    )

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Editar Ana Souza' }))
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe um doador cadastrado com esse CPF.',
    )
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument()
    expect(screen.queryByText('Doador atualizado com sucesso.')).not.toBeInTheDocument()
    expect(getDoadores).toHaveBeenCalledTimes(1)
  })

    it('pede confirmação e não remove quando o usuário cancela', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores).mockResolvedValue(respostaComLista([doadoraAna]))

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Remover Ana Souza' }))
    const confirmacao = within(screen.getByRole('alertdialog', { name: 'Remover doador' }))
    await usuario.click(confirmacao.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(deletarDoador).not.toHaveBeenCalled()
  })

  it('remove o doador depois da confirmação e atualiza a lista', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores)
      .mockResolvedValueOnce(respostaComLista([doadoraAna]))
      .mockResolvedValueOnce(respostaComLista([]))
    vi.mocked(deletarDoador).mockResolvedValue({} as AxiosResponse)

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Remover Ana Souza' }))
    const confirmacao = within(screen.getByRole('alertdialog'))
    await usuario.click(confirmacao.getByRole('button', { name: 'Remover' }))

    expect(await screen.findByText('Doador removido com sucesso.')).toBeInTheDocument()
    expect(deletarDoador).toHaveBeenCalledWith(1)
    expect(await screen.findByText('Nenhum doador cadastrado.')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(getDoadores).toHaveBeenCalledTimes(2)
  })

  it('mantém o doador e mostra o aviso quando ele já tem doações', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores).mockResolvedValue(respostaComLista([doadoraAna]))
    vi.mocked(deletarDoador).mockRejectedValue(
      new AxiosError('Conflict', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 409,
        data: { erro: 'Não é possível remover um doador que já tem doações registradas.' },
      } as AxiosResponse),
    )

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Remover Ana Souza' }))
    const confirmacao = within(screen.getByRole('alertdialog'))
    await usuario.click(confirmacao.getByRole('button', { name: 'Remover' }))

    expect(await confirmacao.findByRole('alert')).toHaveTextContent(
      'Não é possível remover um doador que já tem doações registradas.',
    )
    expect(screen.getByText('Ana Souza', { selector: '.doador__nome' })).toBeInTheDocument()
    expect(screen.queryByText('Doador removido com sucesso.')).not.toBeInTheDocument()
    expect(getDoadores).toHaveBeenCalledTimes(1)
  })

  it('usa a mensagem padrão quando a remoção falha sem resposta da API', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores).mockResolvedValue(respostaComLista([doadoraAna]))
    vi.mocked(deletarDoador).mockRejectedValue(new Error('Falha de rede'))

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Remover Ana Souza' }))
    const confirmacao = within(screen.getByRole('alertdialog'))
    await usuario.click(confirmacao.getByRole('button', { name: 'Remover' }))

    expect(await confirmacao.findByRole('alert')).toHaveTextContent(
      'Não foi possível remover o doador.',
    )
  })

  it('limpa o erro da tentativa anterior ao reabrir a confirmação', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores).mockResolvedValue(respostaComLista([doadoraAna]))
    vi.mocked(deletarDoador).mockRejectedValue(new Error('Falha de rede'))

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Remover Ana Souza' }))
    await usuario.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remover' }))
    await screen.findByRole('alert')
    await usuario.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancelar' }))
    await usuario.click(screen.getByRole('button', { name: 'Remover Ana Souza' }))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('fecha o formulário de edição quando o doador editado é removido', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores)
      .mockResolvedValueOnce(respostaComLista([doadoraAna]))
      .mockResolvedValueOnce(respostaComLista([]))
    vi.mocked(deletarDoador).mockResolvedValue({} as AxiosResponse)

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Editar Ana Souza' }))
    await usuario.click(screen.getByRole('button', { name: 'Remover Ana Souza' }))
    await usuario.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remover' }))

    expect(await screen.findByText('Doador removido com sucesso.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Editar doador' })).not.toBeInTheDocument()
  })

  it('mantém o formulário aberto quando outro doador é removido', async () => {
    const usuario = userEvent.setup()
    const doadorBruno: Doador = { ...doadoraAna, id: 2, nome: 'Bruno Lima', cpf: '11144477735' }
    vi.mocked(getDoadores)
      .mockResolvedValueOnce(respostaComLista([doadoraAna, doadorBruno]))
      .mockResolvedValueOnce(respostaComLista([doadoraAna]))
    vi.mocked(deletarDoador).mockResolvedValue({} as AxiosResponse)

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Editar Ana Souza' }))
    await usuario.click(screen.getByRole('button', { name: 'Remover Bruno Lima' }))
    await usuario.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remover' }))

    expect(await screen.findByText('Doador removido com sucesso.')).toBeInTheDocument()
    expect(deletarDoador).toHaveBeenCalledWith(2)
    expect(screen.getByRole('heading', { name: 'Editar doador' })).toBeInTheDocument()
  })

  it('avisa quando a lista não recarrega depois da remoção', async () => {
    const usuario = userEvent.setup()
    vi.mocked(getDoadores)
      .mockResolvedValueOnce(respostaComLista([doadoraAna]))
      .mockRejectedValueOnce(new Error('Falha de rede'))
    vi.mocked(deletarDoador).mockResolvedValue({} as AxiosResponse)

    render(<DoadoresPage />)
    await screen.findByText('Ana Souza')

    await usuario.click(screen.getByRole('button', { name: 'Remover Ana Souza' }))
    await usuario.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remover' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os doadores.',
    )
  })
})