import type { Solicitacao } from '../types/solicitacao'
import { formatarCodigoBolsa } from '../utils/bolsa'
import { formatarCodigoSolicitacao, formatarDataHora, quantidadeDeBolsas, temEstoqueSuficiente } from '../utils/solicitacao'
import { pluralizar } from '../utils/texto'
import { SeloPrioridade, SeloStatusSolicitacao } from './SelosSolicitacao'
import './DoadorForm.css'
import './SolicitacaoDetalhes.css'

interface SolicitacaoDetalhesProps {
  solicitacao: Solicitacao
  processando: boolean
  erro: string | null
  onFechar: () => void
  onAtender: () => void
  onConcluir: () => void
  onCancelar: () => void
}

function SolicitacaoDetalhes({
  solicitacao,
  processando,
  erro,
  onFechar,
  onAtender,
  onConcluir,
  onCancelar,
}: SolicitacaoDetalhesProps) {
  const pendente = solicitacao.status === 'PENDENTE'
  const emAtendimento = solicitacao.status === 'EM_ATENDIMENTO'
  const suficiente = temEstoqueSuficiente(solicitacao)
  const disponiveis = solicitacao.bolsasCompativeisDisponiveis

  return (
    <div className="painel__fundo" onClick={onFechar}>
      <aside
        className="painel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="painel-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="painel__cabecalho">
          <div className="painel__codigo">{formatarCodigoSolicitacao(solicitacao.id)}</div>
          <h2 id="painel-titulo" className="painel__titulo">
            {solicitacao.instituicao}
          </h2>
          <div className="painel__selos">
            <SeloPrioridade prioridade={solicitacao.prioridade} />
            <SeloStatusSolicitacao status={solicitacao.status} />
          </div>
        </header>

        <div className="painel__corpo">
          {erro && (
            <p role="alert" className="doadores__erro">
              {erro}
            </p>
          )}

          <dl className="painel__dados">
            <div>
              <dt>Tipo sanguíneo</dt>
              <dd className="painel__destaque tabela__mono">{solicitacao.tipoSanguineo}</dd>
            </div>
            <div>
              <dt>Quantidade</dt>
              <dd className="painel__destaque">{quantidadeDeBolsas(solicitacao.quantidade)}</dd>
            </div>
            <div className="painel__dado--inteiro">
              <dt>Solicitado em</dt>
              <dd>{formatarDataHora(solicitacao.dataSolicitacao)}</dd>
            </div>
            <div className="painel__dado--inteiro">
              <dt>Setor/responsável</dt>
              <dd>{solicitacao.setor || '—'}</dd>
            </div>
            <div className="painel__dado--inteiro">
              <dt>Justificativa clínica</dt>
              <dd className="painel__texto">{solicitacao.justificativa || '—'}</dd>
            </div>
          </dl>

          {pendente && (
            <section className="painel__caixa" aria-label="Disponibilidade">
              <h3 className="painel__caixa-titulo">Disponibilidade</h3>
              <p className="painel__disponiveis">
                <strong>{disponiveis}</strong>{' '}
                  {pluralizar(disponiveis, 'bolsa compatível disponível', 'bolsas compatíveis disponíveis')}                </p>
              <p className={suficiente ? 'painel__aviso--sucesso' : 'painel__aviso--perigo'}>
                {suficiente
                  ? 'Suficiente para atender esta solicitação.'
                  : `Insuficiente: esta solicitação pede ${quantidadeDeBolsas(solicitacao.quantidade)}.`}
              </p>
            </section>
          )}

          {solicitacao.bolsasReservadas.length > 0 && (
            <section className="painel__caixa" aria-label="Bolsas separadas">
              <h3 className="painel__caixa-titulo">Bolsas separadas</h3>
              <ul className="painel__bolsas">
                {solicitacao.bolsasReservadas.map((id) => (
                  <li key={id} className="tabela__mono">
                    {formatarCodigoBolsa(id)}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <footer className="painel__rodape">
          <button type="button" className="botao botao--secundario" onClick={onFechar}>
            Fechar
          </button>
          {(pendente || emAtendimento) && (
            <button
              type="button"
              className="botao botao--secundario"
              disabled={processando}
              onClick={onCancelar}
            >
              Cancelar solicitação
            </button>
          )}
          {pendente && (
            <button
              type="button"
              className="botao botao--primario painel__principal"
              disabled={processando || !suficiente}
              onClick={onAtender}
            >
              Atender solicitação
            </button>
          )}
          {emAtendimento && (
            <button
              type="button"
              className="botao botao--primario painel__principal"
              disabled={processando}
              onClick={onConcluir}
            >
              Concluir atendimento
            </button>
          )}
        </footer>
      </aside>
    </div>
  )
}

export default SolicitacaoDetalhes