import CabecalhoPagina from '../components/CabecalhoPagina'
import ConfirmarRemocaoDoador from '../components/ConfirmarRemocaoDoador'
import DoadorForm from '../components/DoadorForm'
import { useEffect, useState } from 'react'
import { atualizarDoador, criarDoador, deletarDoador, getDoadores } from '../services/doadorService'
import type { Doador, NovoDoador, StatusDoador, TipoSanguineo } from '../types/doador'
import {
  FILTROS_INICIAIS_DOADORES,
  filtrarDoadores,
  formatarCpf,
  formatarData,
  formatarTelefone,
  montarRequisicaoDeEdicao,
  obterIniciais,
  paraDadosDoFormulario,
} from '../utils/doador'
import type { FiltrosDoadores } from '../utils/doador'
import { obterMensagemErro, validarRespostaLista } from '../utils/erro'
import './DoadoresPage.css'
import './EstoquePage.css'

const TIPOS_SANGUINEOS: TipoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const ROTULO_STATUS: Record<StatusDoador, string> = {
  APTO: 'Apto',
  AGUARDANDO: 'Aguardando',
  INAPTO: 'Inapto',
}

const STATUS_DOADOR = Object.keys(ROTULO_STATUS) as StatusDoador[]

async function buscarDoadores(): Promise<Doador[]> {
  const resposta = await getDoadores()
  return validarRespostaLista<Doador>(resposta.data)
}

function DoadoresPage() {
  const [doadores, setDoadores] = useState<Doador[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [exibindoFormulario, setExibindoFormulario] = useState(false)
  const [doadorEmEdicao, setDoadorEmEdicao] = useState<Doador | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroCadastro, setErroCadastro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [doadorEmRemocao, setDoadorEmRemocao] = useState<Doador | null>(null)
  const [removendo, setRemovendo] = useState(false)
  const [erroRemocao, setErroRemocao] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosDoadores>(FILTROS_INICIAIS_DOADORES)

  useEffect(() => {
    buscarDoadores()
      .then(setDoadores)
      .catch(() => setErro('Não foi possível carregar os doadores.'))
      .finally(() => setCarregando(false))
  }, [])

  const formularioAberto = exibindoFormulario || doadorEmEdicao !== null
  const doadoresVisiveis = filtrarDoadores(doadores, filtros)

  function atualizarFiltro<K extends keyof FiltrosDoadores>(
    campo: K,
    valor: FiltrosDoadores[K],
  ) {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }))
  }

  function abrirFormulario() {
    setSucesso(null)
    setErroCadastro(null)
    setDoadorEmEdicao(null)
    setExibindoFormulario(true)
  }

  function editarDoador(doador: Doador) {
    setSucesso(null)
    setErroCadastro(null)
    setExibindoFormulario(false)
    setDoadorEmEdicao(doador)
  }

  function fecharFormulario() {
    setErroCadastro(null)
    setExibindoFormulario(false)
    setDoadorEmEdicao(null)
  }

  async function recarregarDoadores() {
    try {
      setDoadores(await buscarDoadores())
      setErro(null)
    } catch {
      setErro('Não foi possível carregar os doadores.')
    }
  }

  async function salvarDoador(dados: NovoDoador) {
    const editando = doadorEmEdicao !== null
    setSalvando(true)
    setErroCadastro(null)

    try {
      if (doadorEmEdicao) {
        await atualizarDoador(
          doadorEmEdicao.id,
          montarRequisicaoDeEdicao(doadorEmEdicao, dados),
        )
      } else {
        await criarDoador(dados)
      }
    } catch (falha) {
      const mensagemPadrao = editando
        ? 'Não foi possível atualizar o doador.'
        : 'Não foi possível cadastrar o doador.'

      setErroCadastro(obterMensagemErro(falha, mensagemPadrao))
      setSalvando(false)
      return
    }

    fecharFormulario()
    setSucesso(
      editando
        ? 'Doador atualizado com sucesso.'
        : 'Doador cadastrado com sucesso.',
    )
    setSalvando(false)
    await recarregarDoadores()
  }

  function pedirRemocao(doador: Doador) {
    setSucesso(null)
    setErroRemocao(null)
    setDoadorEmRemocao(doador)
  }

  function fecharRemocao() {
    setErroRemocao(null)
    setDoadorEmRemocao(null)
  }

  async function removerDoador() {
    if (!doadorEmRemocao) return

    setRemovendo(true)
    setErroRemocao(null)

    try {
      await deletarDoador(doadorEmRemocao.id)
    } catch (falha) {
      setErroRemocao(
        obterMensagemErro(falha, 'Não foi possível remover o doador.'),
      )
      setRemovendo(false)
      return
    }

    if (doadorEmEdicao?.id === doadorEmRemocao.id) {
      fecharFormulario()
    }

    fecharRemocao()
    setSucesso('Doador removido com sucesso.')
    setRemovendo(false)
    await recarregarDoadores()
  }

  return (
    <section className="doadores">
      <CabecalhoPagina
        titulo="Doadores"
        subtitulo="Cadastro e acompanhamento de doadores"
      />

      <div className="doadores__conteudo">
        <div className="doadores__barra">
          <span className="doadores__contagem">
            {doadoresVisiveis.length} doadores
          </span>

          {!formularioAberto && (
            <button
              type="button"
              className="botao botao--primario doadores__novo"
              onClick={abrirFormulario}
            >
              Novo doador
            </button>
          )}
        </div>

        {sucesso && (
          <p role="status" className="doadores__sucesso">
            {sucesso}
          </p>
        )}

        {erro && (
          <p role="alert" className="doadores__erro">
            {erro}
          </p>
        )}

        {formularioAberto && (
          <div className="tabela-card doadores__formulario">
            <h2 className="doadores__formulario-titulo">
              {doadorEmEdicao ? 'Editar doador' : 'Novo doador'}
            </h2>

            {erroCadastro && (
              <p role="alert" className="doadores__erro">
                {erroCadastro}
              </p>
            )}

            <DoadorForm
              key={doadorEmEdicao?.id ?? 'novo'}
              onSubmit={salvarDoador}
              onCancelar={fecharFormulario}
              salvando={salvando}
              doadorInicial={
                doadorEmEdicao
                  ? paraDadosDoFormulario(doadorEmEdicao)
                  : undefined
              }
              textoSalvar={
                doadorEmEdicao ? 'Salvar alterações' : undefined
              }
            />
          </div>
        )}

        <div className="estoque__filtros">
          <input
            type="search"
            aria-label="Buscar por nome ou CPF"
            className="estoque__filtro estoque__filtro--busca"
            placeholder="Buscar por nome ou CPF"
            value={filtros.busca}
            onChange={(e) => atualizarFiltro('busca', e.target.value)}
          />

          <select
            aria-label="Filtrar por tipo sanguíneo"
            className="estoque__filtro"
            value={filtros.tipoSanguineo}
            onChange={(e) =>
              atualizarFiltro(
                'tipoSanguineo',
                e.target.value as TipoSanguineo | '',
              )
            }
          >
            <option value="">Tipo sanguíneo: todos</option>

            {TIPOS_SANGUINEOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por status"
            className="estoque__filtro"
            value={filtros.status}
            onChange={(e) =>
              atualizarFiltro(
                'status',
                e.target.value as StatusDoador | '',
              )
            }
          >
            <option value="">Status: todos</option>

            {STATUS_DOADOR.map((status) => (
              <option key={status} value={status}>
                {ROTULO_STATUS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="tabela-card">
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Tipo</th>
                <th>Telefone</th>
                <th>Última doação</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {doadoresVisiveis.map((doador) => (
                <tr key={doador.id}>
                  <td>
                    <div className="doador">
                      <span className="doador__avatar">
                        {obterIniciais(doador.nome)}
                      </span>

                      <div>
                        <div className="doador__nome">
                          {doador.nome}
                        </div>

                        <div className="doador__local">
                          {doador.cidade} · {doador.bairro}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="tabela__mono">
                    {formatarCpf(doador.cpf)}
                  </td>

                  <td>
                    {doador.tipo_sanguineo ? (
                      <span className="selo-tipo">
                        {doador.tipo_sanguineo}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td>
                    {formatarTelefone(doador.telefone ?? '') || '—'}
                  </td>

                  <td>
                    {formatarData(doador.ultima_doacao)}
                  </td>

                  <td>
                    <span
                      className={`selo-status selo-status--${doador.status.toLowerCase()}`}
                    >
                      {ROTULO_STATUS[doador.status]}
                    </span>
                  </td>

                  <td>
                    <div className="doacoes__acoes">
                      <button
                        type="button"
                        className="botao botao--secundario doadores__editar"
                        aria-label={`Editar ${doador.nome}`}
                        onClick={() => editarDoador(doador)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="botao botao--secundario doadores__remover"
                        aria-label={`Remover ${doador.nome}`}
                        onClick={() => pedirRemocao(doador)}
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!carregando && !erro && doadores.length === 0 && (
            <p className="tabela__vazia">
              Nenhum doador cadastrado.
            </p>
          )}

          {doadores.length > 0 && doadoresVisiveis.length === 0 && (
            <p className="tabela__vazia">
              Nenhum doador encontrado.
            </p>
          )}

          {carregando && (
            <p className="tabela__vazia">
              Carregando doadores...
            </p>
          )}
        </div>
      </div>

      {doadorEmRemocao && (
        <ConfirmarRemocaoDoador
          nome={doadorEmRemocao.nome}
          removendo={removendo}
          erro={erroRemocao}
          onConfirmar={removerDoador}
          onCancelar={fecharRemocao}
        />
      )}
    </section>
  )
}

export default DoadoresPage