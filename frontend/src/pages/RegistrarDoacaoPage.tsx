import { useEffect, useState } from 'react'
import CabecalhoPagina from '../components/CabecalhoPagina'
import DoacaoForm from '../components/DoacaoForm'
import { useFiltros } from '../hooks/useFiltros'
import { concluirDoacao, criarDoacao, descartarDoacao, getDoacoes } from '../services/doacaoService'
import { getDoadores } from '../services/doadorService'
import type { Doacao, DoacaoRequest, StatusDoacao } from '../types/doacao'
import type { Doador } from '../types/doador'
import { FILTROS_INICIAIS_DOACOES, ROTULO_STATUS_DOACAO, ROTULO_TIPO_DOACAO, filtrarDoacoes, formatarHora } from '../utils/doacao'
import type { FiltrosDoacoes } from '../utils/doacao'
import { formatarData } from '../utils/data'
import { obterMensagemErro, validarRespostaLista } from '../utils/erro'
import './DoadoresPage.css'
import './EstoquePage.css'

const CLASSE_STATUS: Record<StatusDoacao, string> = {
  EM_TRIAGEM: 'aguardando',
  CONCLUIDA: 'apto',
  DESCARTADA: 'inapto',
}

const STATUS_DOACAO = Object.keys(ROTULO_STATUS_DOACAO) as StatusDoacao[]

async function buscarLista<T>(requisicao: Promise<{ data: T[] }>): Promise<T[]> {
  const resposta = await requisicao
  return validarRespostaLista<T>(resposta.data)
}

async function buscarDados(): Promise<{ doacoes: Doacao[]; doadores: Doador[] }> {
  const [doacoes, doadores] = await Promise.all([
    buscarLista(getDoacoes()),
    buscarLista(getDoadores()),
  ])
  return { doacoes, doadores }
}

function formatarNumero(valor: number): string {
  return String(valor).replace('.', ',')
}

function RegistrarDoacaoPage() {
  const [doacoes, setDoacoes] = useState<Doacao[]>([])
  const [doadores, setDoadores] = useState<Doador[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [exibindoFormulario, setExibindoFormulario] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroCadastro, setErroCadastro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(false)
  const { filtros, atualizarFiltro } = useFiltros<FiltrosDoacoes>(FILTROS_INICIAIS_DOACOES)

  function aplicarDados(dados: { doacoes: Doacao[]; doadores: Doador[] }) {
    setDoacoes(dados.doacoes)
    setDoadores(dados.doadores)
    setErro(null)
  }

  async function recarregar() {
    try {
      aplicarDados(await buscarDados())
    } catch {
      setErro('Não foi possível carregar as doações.')
    }
  }

  useEffect(() => {
    buscarDados()
      .then((dados) => {
        setDoacoes(dados.doacoes)
        setDoadores(dados.doadores)
      })
      .catch(() => setErro('Não foi possível carregar as doações.'))
      .finally(() => setCarregando(false))
  }, [])

  function abrirFormulario() {
    setSucesso(null)
    setErroCadastro(null)
    setExibindoFormulario(true)
  }

  function fecharFormulario() {
    setErroCadastro(null)
    setExibindoFormulario(false)
  }

  async function registrarDoacao(dados: DoacaoRequest) {
    setSalvando(true)
    setErroCadastro(null)

    try {
      await criarDoacao(dados)
    } catch (falha) {
      setErroCadastro(obterMensagemErro(falha, 'Não foi possível registrar a doação.'))
      setSalvando(false)
      return
    }

    setExibindoFormulario(false)
    setSucesso('Doação registrada com sucesso.')
    setSalvando(false)
    await recarregar()
  }

  async function alterarStatus(
    doacao: Doacao,
    acao: (id: number) => Promise<unknown>,
    mensagemSucesso: string,
    mensagemErro: string,
  ) {
    setSucesso(null)
    setAcaoEmAndamento(true)

    try {
      await acao(doacao.id)
    } catch (falha) {
      setErro(obterMensagemErro(falha, mensagemErro))
      setAcaoEmAndamento(false)
      return
    }

    setSucesso(mensagemSucesso)
    setAcaoEmAndamento(false)
    await recarregar()
  }

  const doacoesVisiveis = filtrarDoacoes(doacoes, filtros)

  return (
    <section className="doadores">
      <CabecalhoPagina titulo="Doações" subtitulo="Histórico e registro de coletas" />
      <div className="doadores__conteudo">
        <div className="doadores__barra">
          <span className="doadores__contagem">{doacoesVisiveis.length} doações</span>          {!exibindoFormulario && (
            <button
              type="button"
              className="botao botao--primario doadores__novo"
              onClick={abrirFormulario}
            >
              Nova doação
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

        {exibindoFormulario && (
          <div className="tabela-card doadores__formulario">
            <h2 className="doadores__formulario-titulo">Nova doação</h2>
            {erroCadastro && (
              <p role="alert" className="doadores__erro">
                {erroCadastro}
              </p>
            )}
            <DoacaoForm
              doadores={doadores}
              doacoes={doacoes}
              onSubmit={registrarDoacao}
              onCancelar={fecharFormulario}
              salvando={salvando}
            />
          </div>
        )}
        <div className="estoque__filtros">
          <input
            type="search"
            aria-label="Buscar por doador"
            className="estoque__filtro estoque__filtro--busca"
            placeholder="Buscar por doador"
            value={filtros.busca}
            onChange={(e) => atualizarFiltro('busca', e.target.value)}
          />

          <select
            aria-label="Status"
            className="estoque__filtro"
            value={filtros.status}
            onChange={(e) => atualizarFiltro('status', e.target.value as StatusDoacao | '')}
          >
            <option value="">Status: todos</option>
            {STATUS_DOACAO.map((status) => (
              <option key={status} value={status}>
                {ROTULO_STATUS_DOACAO[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="tabela-card">
          <table className="tabela">
            <thead>
              <tr>
                <th>Doador</th>
                <th>Coleta</th>
                <th>Tipo</th>
                <th>Volume</th>
                <th>Hemoglobina</th>
                <th>Responsável</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {doacoesVisiveis.map((doacao) => (
                <tr key={doacao.id}>
                  <td>
                    <div className="doador__nome">{doacao.nomeDoador}</div>
                    <div className="doador__local">{doacao.tipoSanguineo ?? 'Tipo não informado'}</div>
                  </td>
                  <td>
                    {formatarData(doacao.dataColeta)} · {formatarHora(doacao.horaColeta)}
                  </td>
                  <td>{ROTULO_TIPO_DOACAO[doacao.tipoDoacao]}</td>
                  <td>{doacao.volume_ml} ml</td>
                  <td>{formatarNumero(doacao.hemoglobina)} g/dL</td>
                  <td>{doacao.responsavel}</td>
                  <td>
                    <span className={`selo-status selo-status--${CLASSE_STATUS[doacao.status]}`}>
                      {ROTULO_STATUS_DOACAO[doacao.status]}
                    </span>
                  </td>
                  <td>
                    {doacao.status === 'EM_TRIAGEM' && (
                      <div className="doacoes__acoes">
                        <button
                          type="button"
                          className="botao botao--primario doadores__editar"
                          aria-label={`Concluir doação de ${doacao.nomeDoador}`}
                          disabled={acaoEmAndamento}
                          onClick={() =>
                            alterarStatus(
                              doacao,
                              concluirDoacao,
                              'Doação concluída com sucesso.',
                              'Não foi possível concluir a doação.',
                            )
                          }
                        >
                          Concluir
                        </button>
                        <button
                          type="button"
                          className="botao botao--secundario doadores__editar"
                          aria-label={`Descartar doação de ${doacao.nomeDoador}`}
                          disabled={acaoEmAndamento}
                          onClick={() =>
                            alterarStatus(
                              doacao,
                              descartarDoacao,
                              'Doação descartada.',
                              'Não foi possível descartar a doação.',
                            )
                          }
                        >
                          Descartar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!carregando && !erro && doacoes.length === 0 && (
            <p className="tabela__vazia">Nenhuma doação registrada.</p>
          )}
          {doacoes.length > 0 && doacoesVisiveis.length === 0 && (
            <p className="tabela__vazia">Nenhuma doação encontrada.</p>
          )}
          {carregando && <p className="tabela__vazia">Carregando doações...</p>}
        </div>
      </div>
    </section>
  )
}

export default RegistrarDoacaoPage