import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CabecalhoPagina from '../components/CabecalhoPagina'
import { SeloPrioridade, SeloStatusSolicitacao } from '../components/SelosSolicitacao'
import { getBolsas } from '../services/bolsaService'
import { getDoacoes } from '../services/doacaoService'
import { getSolicitacoes } from '../services/solicitacaoService'
import type { Bolsa } from '../types/bolsa'
import type { Doacao } from '../types/doacao'
import type { Solicitacao } from '../types/solicitacao'
import { resumirEstoque } from '../utils/bolsa'
import { DIAS_DOACOES_RECENTES, LIMITE_ESTOQUE_CRITICO, alertasDeEstoque, alertasDeSolicitacoes, contarDoacoesRecentes, estoquePorTipo, solicitacoesEmDestaque } from '../utils/dashboard'
import { resumirSolicitacoes } from '../utils/solicitacao'
import { pluralizar } from '../utils/texto'
import '../components/DoadorForm.css'
import './DoadoresPage.css'
import './EstoquePage.css'
import './SolicitacoesPage.css'
import './DashboardPage.css'
import { validarRespostaLista } from '../utils/erro'

interface DadosDashboard {
  bolsas: Bolsa[] | null
  solicitacoes: Solicitacao[] | null
  doacoes: Doacao[] | null
}

const SEM_DADOS: DadosDashboard = { bolsas: null, solicitacoes: null, doacoes: null }

async function buscarLista<T>(buscar: () => Promise<{ data: unknown }>): Promise<T[]> {
  const resposta = await buscar()
  return validarRespostaLista<T>(resposta.data)
}

function valorOuNulo<T>(resultado: PromiseSettledResult<T>): T | null {
  return resultado.status === 'fulfilled' ? resultado.value : null
}

function DashboardPage() {
  const [dados, setDados] = useState<DadosDashboard>(SEM_DADOS)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      buscarLista<Bolsa>(getBolsas),
      buscarLista<Solicitacao>(getSolicitacoes),
      buscarLista<Doacao>(getDoacoes),
    ])
      .then(([bolsas, solicitacoes, doacoes]) =>
        setDados({
          bolsas: valorOuNulo(bolsas),
          solicitacoes: valorOuNulo(solicitacoes),
          doacoes: valorOuNulo(doacoes),
        }),
      )
      .finally(() => setCarregando(false))
  }, [])

  const { bolsas, solicitacoes, doacoes } = dados
  const estoque = bolsas && estoquePorTipo(bolsas)
  const destaques = solicitacoes && solicitacoesEmDestaque(solicitacoes)
  const alertas = [
    ...(solicitacoes ? alertasDeSolicitacoes(solicitacoes) : []),
    ...(bolsas ? alertasDeEstoque(bolsas) : []),
  ]
  const falhas = [
    !bolsas && 'estoque',
    !solicitacoes && 'solicitações',
    !doacoes && 'doações',
  ].filter(Boolean)

  return (
    <section className="doadores">
      <CabecalhoPagina titulo="Dashboard" subtitulo="Visão geral do banco de sangue" />
      <div className="doadores__conteudo">
        {!carregando && falhas.length > 0 && (
          <p role="alert" className="doadores__erro">
            Não foi possível carregar: {falhas.join(', ')}.
          </p>
        )}

        <div className="estoque__cards">
          <div className="estoque__card" role="group" aria-label="Bolsas disponíveis">
            <span className="estoque__card-titulo">Bolsas disponíveis</span>
            <strong className="estoque__card-valor estoque__card-valor--sucesso">
              {bolsas ? resumirEstoque(bolsas).disponiveis : '—'}
            </strong>
            <span className="estoque__card-detalhe">Prontas para uso</span>
          </div>
          <div
            className="estoque__card estoque__card--alerta"
            role="group"
            aria-label="Estoques em nível crítico"
          >
            <span className="estoque__card-titulo">Estoques em nível crítico</span>
            <strong className="estoque__card-valor estoque__card-valor--alerta">
              {estoque ? estoque.filter((item) => item.critico).length : '—'}
            </strong>
            <span className="estoque__card-detalhe">Abaixo de {LIMITE_ESTOQUE_CRITICO} bolsas</span>
          </div>
          <div className="estoque__card" role="group" aria-label="Solicitações pendentes">
            <span className="estoque__card-titulo">Solicitações pendentes</span>
            <strong className="estoque__card-valor">
              {solicitacoes ? resumirSolicitacoes(solicitacoes).pendentes : '—'}
            </strong>
            <span className="estoque__card-detalhe">Aguardando ação da equipe</span>
          </div>
          <div
            className="estoque__card"
            role="group"
            aria-label={`Doações nos últimos ${DIAS_DOACOES_RECENTES} dias`}
          >
            <span className="estoque__card-titulo">
              Doações nos últimos {DIAS_DOACOES_RECENTES} dias
            </span>
            <strong className="estoque__card-valor">
              {doacoes ? contarDoacoesRecentes(doacoes) : '—'}
            </strong>
            <span className="estoque__card-detalhe">Não inclui descartadas</span>
          </div>
        </div>

        <section className="dashboard__secao" aria-labelledby="dashboard-estoque">
          <div className="dashboard__secao-topo">
            <h2 id="dashboard-estoque" className="dashboard__titulo">
              Estoque por tipo sanguíneo
            </h2>
            <Link to="/estoque" className="dashboard__link">
              Ver estoque completo
            </Link>
          </div>

          {carregando && <p className="tabela__vazia">Carregando estoque...</p>}
          {estoque && (
            <div className="dashboard__tipos">
              {estoque.map((item) => (
                <div
                  key={item.tipo}
                  className="dashboard__tipo"
                  role="group"
                  aria-label={`Estoque ${item.tipo}`}
                >
                  <div className="dashboard__tipo-topo">
                    <span className="selo-tipo">{item.tipo}</span>
                    <span
                      className={`selo-status selo-status--${item.critico ? 'inapto' : 'apto'}`}
                    >
                      {item.critico ? 'Crítico' : 'Adequado'}
                    </span>
                  </div>
                  <div className="dashboard__tipo-quantidade">
                    <strong>{item.quantidade}</strong> 
                      {pluralizar(item.quantidade, 'bolsa', 'bolsas')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="dashboard__colunas">
          <section className="tabela-card" aria-labelledby="dashboard-solicitacoes">
            <div className="dashboard__cartao-topo">
              <div>
                <h2 id="dashboard-solicitacoes" className="dashboard__titulo">
                  Solicitações que exigem ação
                </h2>
                <p className="dashboard__subtitulo">Ordenadas por prioridade e tempo de espera</p>
              </div>
              <Link to="/solicitacoes" className="dashboard__link">
                Ver fila completa
              </Link>
            </div>

            {destaques && destaques.length > 0 && (
              <table className="tabela dashboard__tabela">
                <thead>
                  <tr>
                    <th>Instituição</th>
                    <th>Tipo</th>
                    <th>Qtd.</th>
                    <th>Prioridade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {destaques.map((solicitacao) => (
                    <tr
                      key={solicitacao.id}
                      className={
                        solicitacao.prioridade === 'EMERGENCIA'
                          ? 'solicitacoes__linha--emergencia'
                          : undefined
                      }
                    >
                      <td className="doador__nome">{solicitacao.instituicao}</td>
                      <td>
                        <span className="selo-tipo">{solicitacao.tipoSanguineo}</span>
                      </td>
                      <td>{solicitacao.quantidade}</td>
                      <td>
                        <SeloPrioridade prioridade={solicitacao.prioridade} />
                      </td>
                      <td>
                        <SeloStatusSolicitacao status={solicitacao.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {destaques && destaques.length === 0 && (
              <p className="tabela__vazia">Nenhuma solicitação ativa.</p>
            )}
            {carregando && <p className="tabela__vazia">Carregando solicitações...</p>}
          </section>

          <section className="tabela-card" aria-labelledby="dashboard-alertas">
            <div className="dashboard__cartao-topo">
              <div>
                <h2 id="dashboard-alertas" className="dashboard__titulo">
                  Alertas operacionais
                </h2>
                <p className="dashboard__subtitulo">Clique em um alerta para abrir a área</p>
              </div>
            </div>

            {alertas.length > 0 && (
              <ul className="dashboard__alertas">
                {alertas.map((alerta) => (
                  <li key={alerta.titulo}>
                    <Link to={alerta.destino} className="dashboard__alerta">
                      <span
                        className={`selo-status selo-status--${alerta.nivel === 'CRITICO' ? 'inapto' : 'aguardando'}`}
                      >
                        {alerta.rotulo}
                      </span>
                      <span className="dashboard__alerta-texto">
                        <span className="dashboard__alerta-titulo">{alerta.titulo}</span>
                        <span className="dashboard__alerta-detalhe">{alerta.detalhe}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!carregando && falhas.length === 0 && alertas.length === 0 && (
              <p className="tabela__vazia">Nenhum alerta no momento.</p>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage