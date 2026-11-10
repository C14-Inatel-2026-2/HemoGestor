import { useEffect, useState } from 'react'
import CabecalhoPagina from '../components/CabecalhoPagina'
import { descartarBolsa, getBolsas } from '../services/bolsaService'
import type { Bolsa, StatusBolsa } from '../types/bolsa'
import type { TipoSanguineo } from '../types/doador'
import {
  DIAS_ALERTA_VENCIMENTO,
  FILTROS_INICIAIS,
  ROTULO_STATUS_BOLSA,
  descreverValidade,
  estaVencida,
  filtrarBolsas,
  formatarCodigoBolsa,
  resumirEstoque,
  venceEmBreve,
} from '../utils/bolsa'
import type { AbaEstoque, FiltrosEstoque } from '../utils/bolsa'
import { gerarCsvEstoque } from '../utils/csvEstoque'
import { formatarData } from '../utils/doador'
import { obterMensagemErro, validarRespostaLista } from '../utils/erro'
import '../components/DoadorForm.css'
import './DoadoresPage.css'
import './EstoquePage.css'
import { TIPOS_SANGUINEOS } from '../constants/tiposSanguineos'

const STATUS_POR_ABA: Record<AbaEstoque, StatusBolsa[]> = {
  ATUAL: ['DISPONIVEL', 'RESERVADA'],
  FORA: ['DESCARTADA', 'UTILIZADA'],
}

const CLASSE_STATUS: Record<StatusBolsa, string> = {
  DISPONIVEL: 'apto',
  RESERVADA: 'reservada',
  UTILIZADA: 'neutro',
  DESCARTADA: 'inapto',
}

function foiRetirada(bolsa: Bolsa): boolean {
  return bolsa.status === 'DESCARTADA' || bolsa.status === 'UTILIZADA'
}

function situacaoDaBolsa(bolsa: Bolsa): { rotulo: string; classe: string } {
  if (!foiRetirada(bolsa) && estaVencida(bolsa)) {
    return { rotulo: 'Vencida', classe: 'inapto' }
  }
  return { rotulo: ROTULO_STATUS_BOLSA[bolsa.status], classe: CLASSE_STATUS[bolsa.status] }
}

function classeDoAviso(bolsa: Bolsa): string {
  if (estaVencida(bolsa)) return 'estoque__aviso estoque__aviso--vencida'
  if (venceEmBreve(bolsa)) return 'estoque__aviso estoque__aviso--alerta'
  return 'estoque__aviso'
}

async function buscarBolsas(): Promise<Bolsa[]> {
  const resposta = await getBolsas()
  return validarRespostaLista<Bolsa>(resposta.data)
}

function EstoquePage() {
  const [bolsas, setBolsas] = useState<Bolsa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosEstoque>(FILTROS_INICIAIS)
  const [descartando, setDescartando] = useState(false)

  useEffect(() => {
    buscarBolsas()
      .then(setBolsas)
      .catch(() => setErro('Não foi possível carregar o estoque.'))
      .finally(() => setCarregando(false))
  }, [])

  function atualizarFiltro<K extends keyof FiltrosEstoque>(campo: K, valor: FiltrosEstoque[K]) {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }))
  }

  function trocarAba(aba: AbaEstoque) {
    setFiltros((anteriores) => ({ ...anteriores, aba, status: '', somenteVencendo: false }))
  }

  async function descartar(bolsa: Bolsa) {
    setSucesso(null)
    setErro(null)
    setDescartando(true)

    try {
      await descartarBolsa(bolsa.id)
    } catch (falha) {
      setErro(obterMensagemErro(falha, 'Não foi possível descartar a bolsa.'))
      setDescartando(false)
      return
    }

    setSucesso(`Bolsa ${formatarCodigoBolsa(bolsa.id)} descartada.`)
    setDescartando(false)

    try {
      setBolsas(await buscarBolsas())
    } catch {
      setErro('Não foi possível carregar o estoque.')
    }
  }

  const resumo = resumirEstoque(bolsas)
  const bolsasVisiveis = filtrarBolsas(bolsas, filtros)

  function exportarCsv() {
    const csv = gerarCsvEstoque(bolsasVisiveis)
    const arquivo = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(arquivo)
    const link = document.createElement('a')

    link.href = url
    link.download = 'estoque.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="doadores">
      <CabecalhoPagina titulo="Estoque" subtitulo="Controle de bolsas e validade" />
      <div className="doadores__conteudo">
        <div className="estoque__cards">
          <div className="estoque__card" role="group" aria-label="Bolsas no estoque">
            <span className="estoque__card-titulo">Bolsas no estoque</span>
            <strong className="estoque__card-valor">{resumo.noEstoque}</strong>
            <span className="estoque__card-detalhe">Disponíveis + reservadas</span>
          </div>
          <div className="estoque__card" role="group" aria-label="Disponíveis">
            <span className="estoque__card-titulo">Disponíveis</span>
            <strong className="estoque__card-valor estoque__card-valor--sucesso">
              {resumo.disponiveis}
            </strong>
            <span className="estoque__card-detalhe">{resumo.reservadas} reservadas</span>
          </div>
          <div
            className="estoque__card estoque__card--alerta"
            role="group"
            aria-label={`Vencem em ${DIAS_ALERTA_VENCIMENTO} dias`}
          >
            <span className="estoque__card-titulo">Vencem em {DIAS_ALERTA_VENCIMENTO} dias</span>
            <strong className="estoque__card-valor estoque__card-valor--alerta">
              {resumo.vencemEmBreve}
            </strong>
            <span className="estoque__card-detalhe">Priorizar liberação</span>
          </div>
          <div className="estoque__card" role="group" aria-label="Fora do estoque">
            <span className="estoque__card-titulo">Fora do estoque</span>
            <strong className="estoque__card-valor estoque__card-valor--neutro">
              {resumo.foraDoEstoque}
            </strong>
            <span className="estoque__card-detalhe">Vencidas, descartadas e utilizadas</span>
          </div>
        </div>

        <div className="estoque__abas">
          <button
            type="button"
            className={`estoque__aba ${filtros.aba === 'ATUAL' ? 'estoque__aba--ativa' : ''}`}
            aria-pressed={filtros.aba === 'ATUAL'}
            onClick={() => trocarAba('ATUAL')}
          >
            Estoque atual
          </button>
          <button
            type="button"
            className={`estoque__aba ${filtros.aba === 'FORA' ? 'estoque__aba--ativa' : ''}`}
            aria-pressed={filtros.aba === 'FORA'}
            onClick={() => trocarAba('FORA')}
          >
            Fora do estoque
          </button>
        </div>

        <div className="estoque__filtros">
          <select
            aria-label="Tipo sanguíneo"
            className="estoque__filtro"
            value={filtros.tipoSanguineo}
            onChange={(e) => atualizarFiltro('tipoSanguineo', e.target.value as TipoSanguineo | '')}
          >
            <option value="">Tipo sanguíneo: todos</option>
            {TIPOS_SANGUINEOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>

          <select
            aria-label="Status"
            className="estoque__filtro"
            value={filtros.status}
            onChange={(e) => atualizarFiltro('status', e.target.value as StatusBolsa | '')}
          >
            <option value="">Status: todos</option>
            {STATUS_POR_ABA[filtros.aba].map((status) => (
              <option key={status} value={status}>
                {ROTULO_STATUS_BOLSA[status]}
              </option>
            ))}
          </select>

          {filtros.aba === 'ATUAL' && (
            <label className="estoque__filtro estoque__checkbox">
              <input
                type="checkbox"
                checked={filtros.somenteVencendo}
                onChange={(e) => atualizarFiltro('somenteVencendo', e.target.checked)}
              />
              Somente próximas do vencimento
            </label>
          )}

          <span className="doadores__contagem">{bolsasVisiveis.length} bolsas</span>

          <button
            type="button"
            className="botao botao--secundario"
            onClick={exportarCsv}
          >
            Exportar CSV
          </button>
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

        <div className="tabela-card">
          <table className="tabela">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Coleta</th>
                <th>Validade</th>
                <th>Status</th>
                <th>Origem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {bolsasVisiveis.map((bolsa) => {
                const situacao = situacaoDaBolsa(bolsa)
                const codigo = formatarCodigoBolsa(bolsa.id)

                return (
                  <tr
                    key={bolsa.id}
                    className={venceEmBreve(bolsa) ? 'estoque__linha--alerta' : undefined}
                  >
                    <td className="tabela__mono">{codigo}</td>
                    <td>
                      <span className="selo-tipo">{bolsa.tipoSanguineo}</span>
                    </td>
                    <td>{formatarData(bolsa.dataColeta)}</td>
                    <td>
                      <div className="estoque__data">{formatarData(bolsa.dataValidade)}</div>
                      {!foiRetirada(bolsa) && (
                        <div className={classeDoAviso(bolsa)}>
                          {descreverValidade(bolsa.dataValidade)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`selo-status selo-status--${situacao.classe}`}>
                        {situacao.rotulo}
                      </span>
                    </td>
                    <td>{bolsa.nomeDoador}</td>
                    <td>
                      {bolsa.status === 'DISPONIVEL' && (
                        <button
                          type="button"
                          className="botao botao--secundario doadores__editar"
                          aria-label={`Descartar bolsa ${codigo}`}
                          disabled={descartando}
                          onClick={() => descartar(bolsa)}
                        >
                          Descartar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!carregando && !erro && bolsasVisiveis.length === 0 && (
            <p className="tabela__vazia">Nenhuma bolsa encontrada.</p>
          )}
          {carregando && <p className="tabela__vazia">Carregando estoque...</p>}
        </div>
      </div>
    </section>
  )
}

export default EstoquePage