import { useEffect, useState } from 'react'
import CabecalhoPagina from '../components/CabecalhoPagina'
import { SeloPrioridade, SeloStatusSolicitacao } from '../components/SelosSolicitacao'
import SolicitacaoDetalhes from '../components/SolicitacaoDetalhes'
import SolicitacaoForm from '../components/SolicitacaoForm'
import {
  atenderSolicitacao,
  cancelarSolicitacao,
  concluirSolicitacao,
  criarSolicitacao,
  getSolicitacoes,
} from '../services/solicitacaoService'
import type {
  PrioridadeSolicitacao,
  Solicitacao,
  SolicitacaoRequest,
  StatusSolicitacao,
} from '../types/solicitacao'
import { obterMensagemErro, validarRespostaLista } from '../utils/erro'
import {
  FILTROS_INICIAIS_SOLICITACOES,
  ROTULO_PRIORIDADE,
  ROTULO_STATUS_SOLICITACAO,
  estaAtiva,
  filtrarSolicitacoes,
  formatarCodigoSolicitacao,
  formatarDataHora,
  resumirSolicitacoes,
} from '../utils/solicitacao'
import type { AbaSolicitacoes, FiltrosSolicitacoes } from '../utils/solicitacao'
import '../components/DoadorForm.css'
import './DoadoresPage.css'
import './EstoquePage.css'
import './SolicitacoesPage.css'

const STATUS_POR_ABA: Record<AbaSolicitacoes, StatusSolicitacao[]> = {
  ATIVAS: ['PENDENTE', 'EM_ATENDIMENTO'],
  HISTORICO: ['ATENDIDA', 'CANCELADA'],
}

const PRIORIDADES = Object.keys(ROTULO_PRIORIDADE) as PrioridadeSolicitacao[]

const MENSAGEM_ERRO_CARREGAR = 'Não foi possível carregar as solicitações.'

function ehEmergenciaAtiva(solicitacao: Solicitacao): boolean {
  return solicitacao.prioridade === 'EMERGENCIA' && estaAtiva(solicitacao)
}

async function buscarSolicitacoes(): Promise<Solicitacao[]> {
  const resposta = await getSolicitacoes()
  return validarRespostaLista<Solicitacao>(resposta.data)
}

function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosSolicitacoes>(FILTROS_INICIAIS_SOLICITACOES)
  const [exibindoFormulario, setExibindoFormulario] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroCadastro, setErroCadastro] = useState<string | null>(null)
  const [idSelecionada, setIdSelecionada] = useState<number | null>(null)
  const [processando, setProcessando] = useState(false)
  const [erroAcao, setErroAcao] = useState<string | null>(null)

  useEffect(() => {
    buscarSolicitacoes()
      .then(setSolicitacoes)
      .catch(() => setErro(MENSAGEM_ERRO_CARREGAR))
      .finally(() => setCarregando(false))
  }, [])

  async function recarregar() {
    try {
      setSolicitacoes(await buscarSolicitacoes())
      setErro(null)
    } catch {
      setErro(MENSAGEM_ERRO_CARREGAR)
    }
  }

  function atualizarFiltro<K extends keyof FiltrosSolicitacoes>(
    campo: K,
    valor: FiltrosSolicitacoes[K],
  ) {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }))
  }

  function trocarAba(aba: AbaSolicitacoes) {
    setFiltros((anteriores) => ({ ...anteriores, aba, status: '' }))
  }

  function abrirFormulario() {
    setSucesso(null)
    setErroCadastro(null)
    setExibindoFormulario(true)
  }

  function fecharFormulario() {
    setErroCadastro(null)
    setExibindoFormulario(false)
  }

  async function salvarSolicitacao(dados: SolicitacaoRequest) {
    setSalvando(true)
    setErroCadastro(null)

    let codigo: string
    try {
      const resposta = await criarSolicitacao(dados)
      codigo = formatarCodigoSolicitacao(resposta.data.id)
    } catch (falha) {
      setErroCadastro(obterMensagemErro(falha, 'Não foi possível criar a solicitação.'))
      setSalvando(false)
      return
    }

    fecharFormulario()
    setSucesso(`Solicitação ${codigo} criada.`)
    setSalvando(false)
    await recarregar()
  }

  function abrirDetalhes(solicitacao: Solicitacao) {
    setErroAcao(null)
    setIdSelecionada(solicitacao.id)
  }

  function fecharDetalhes() {
    setErroAcao(null)
    setIdSelecionada(null)
  }

  async function executarAcao(
    acao: (id: number) => Promise<unknown>,
    solicitacao: Solicitacao,
    resultado: string,
    mensagemFalha: string,
  ) {
    setSucesso(null)
    setErroAcao(null)
    setProcessando(true)

    try {
      await acao(solicitacao.id)
    } catch (falha) {
      setErroAcao(obterMensagemErro(falha, mensagemFalha))
      setProcessando(false)
      await recarregar()
      return
    }

    fecharDetalhes()
    setSucesso(`Solicitação ${formatarCodigoSolicitacao(solicitacao.id)} ${resultado}.`)
    setProcessando(false)
    await recarregar()
  }

  const resumo = resumirSolicitacoes(solicitacoes)
  const solicitacoesVisiveis = filtrarSolicitacoes(solicitacoes, filtros)
  const selecionada = solicitacoes.find((solicitacao) => solicitacao.id === idSelecionada)

  return (
    <section className="doadores">
      <CabecalhoPagina titulo="Solicitações" subtitulo="Requisições de instituições de saúde" />
      <div className="doadores__conteudo">
        <div className="estoque__cards">
          <div className="estoque__card" role="group" aria-label="Pendentes">
            <span className="estoque__card-titulo">Pendentes</span>
            <strong className="estoque__card-valor">{resumo.pendentes}</strong>
            <span className="estoque__card-detalhe">Aguardando atendimento</span>
          </div>
          <div className="estoque__card" role="group" aria-label="Em atendimento">
            <span className="estoque__card-titulo">Em atendimento</span>
            <strong className="estoque__card-valor">{resumo.emAtendimento}</strong>
            <span className="estoque__card-detalhe">Com bolsas reservadas</span>
          </div>
          <div className="estoque__card" role="group" aria-label="Atendidas">
            <span className="estoque__card-titulo">Atendidas</span>
            <strong className="estoque__card-valor estoque__card-valor--sucesso">
              {resumo.atendidas}
            </strong>
            <span className="estoque__card-detalhe">No histórico</span>
          </div>
          <div
            className="estoque__card estoque__card--alerta"
            role="group"
            aria-label="Urgentes/emergência"
          >
            <span className="estoque__card-titulo">Urgentes/emergência</span>
            <strong className="estoque__card-valor estoque__card-valor--alerta">
              {resumo.prioritariasAtivas}
            </strong>
            <span className="estoque__card-detalhe">Ativas no momento</span>
          </div>
        </div>

        <div className="estoque__abas">
          <button
            type="button"
            className={`estoque__aba ${filtros.aba === 'ATIVAS' ? 'estoque__aba--ativa' : ''}`}
            aria-pressed={filtros.aba === 'ATIVAS'}
            onClick={() => trocarAba('ATIVAS')}
          >
            Solicitações ativas ({resumo.ativas})
          </button>
          <button
            type="button"
            className={`estoque__aba ${filtros.aba === 'HISTORICO' ? 'estoque__aba--ativa' : ''}`}
            aria-pressed={filtros.aba === 'HISTORICO'}
            onClick={() => trocarAba('HISTORICO')}
          >
            Histórico ({resumo.historico})
          </button>
        </div>

        <div className="estoque__filtros">
          <select
            aria-label="Status"
            className="estoque__filtro"
            value={filtros.status}
            onChange={(e) => atualizarFiltro('status', e.target.value as StatusSolicitacao | '')}
          >
            <option value="">Status: todos</option>
            {STATUS_POR_ABA[filtros.aba].map((status) => (
              <option key={status} value={status}>
                {ROTULO_STATUS_SOLICITACAO[status]}
              </option>
            ))}
          </select>

          <select
            aria-label="Prioridade"
            className="estoque__filtro"
            value={filtros.prioridade}
            onChange={(e) =>
              atualizarFiltro('prioridade', e.target.value as PrioridadeSolicitacao | '')
            }
          >
            <option value="">Prioridade: todas</option>
            {PRIORIDADES.map((prioridade) => (
              <option key={prioridade} value={prioridade}>
                {ROTULO_PRIORIDADE[prioridade]}
              </option>
            ))}
          </select>

          <span className="doadores__contagem">{solicitacoesVisiveis.length} solicitações</span>

          {!exibindoFormulario && (
            <button
              type="button"
              className="botao botao--primario doadores__novo"
              onClick={abrirFormulario}
            >
              + Nova solicitação
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
            <h2 className="doadores__formulario-titulo">Nova solicitação</h2>
            {erroCadastro && (
              <p role="alert" className="doadores__erro">
                {erroCadastro}
              </p>
            )}
            <SolicitacaoForm
              onSubmit={salvarSolicitacao}
              onCancelar={fecharFormulario}
              salvando={salvando}
            />
          </div>
        )}

        <div className="tabela-card">
          <table className="tabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Instituição</th>
                <th>Tipo</th>
                <th>Qtd.</th>
                <th>Data</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoesVisiveis.map((solicitacao) => {
                const codigo = formatarCodigoSolicitacao(solicitacao.id)
                const emergencia = ehEmergenciaAtiva(solicitacao)

                return (
                  <tr
                    key={solicitacao.id}
                    className={emergencia ? 'solicitacoes__linha--emergencia' : undefined}
                  >
                    <td className="tabela__mono solicitacoes__sem-quebra">
                      {emergencia && <span className="solicitacoes__ponto" aria-hidden="true" />}
                      {codigo}
                    </td>
                    <td>
                      <div className="doador__nome">{solicitacao.instituicao}</div>
                      {solicitacao.setor && <div className="doador__local">{solicitacao.setor}</div>}
                    </td>
                    <td>
                      <span className="selo-tipo">{solicitacao.tipoSanguineo}</span>
                    </td>
                    <td>{solicitacao.quantidade}</td>
                    <td className="solicitacoes__sem-quebra">
                      {formatarDataHora(solicitacao.dataSolicitacao)}
                    </td>
                    <td>
                      <SeloPrioridade prioridade={solicitacao.prioridade} />
                    </td>
                    <td>
                      <SeloStatusSolicitacao status={solicitacao.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="botao botao--secundario doadores__editar"
                        aria-label={`Ver detalhes de ${codigo}`}
                        onClick={() => abrirDetalhes(solicitacao)}
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!carregando && !erro && solicitacoesVisiveis.length === 0 && (
            <p className="tabela__vazia">Nenhuma solicitação encontrada.</p>
          )}
          {carregando && <p className="tabela__vazia">Carregando solicitações...</p>}
        </div>
      </div>

      {selecionada && (
        <SolicitacaoDetalhes
          solicitacao={selecionada}
          processando={processando}
          erro={erroAcao}
          onFechar={fecharDetalhes}
          onAtender={() =>
            executarAcao(
              atenderSolicitacao,
              selecionada,
              'em atendimento',
              'Não foi possível atender a solicitação.',
            )
          }
          onConcluir={() =>
            executarAcao(
              concluirSolicitacao,
              selecionada,
              'concluída',
              'Não foi possível concluir a solicitação.',
            )
          }
          onCancelar={() =>
            executarAcao(
              cancelarSolicitacao,
              selecionada,
              'cancelada',
              'Não foi possível cancelar a solicitação.',
            )
          }
        />
      )}
    </section>
  )
}

export default SolicitacoesPage