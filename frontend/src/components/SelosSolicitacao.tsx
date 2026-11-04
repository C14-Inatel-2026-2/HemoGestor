import type { PrioridadeSolicitacao, StatusSolicitacao } from '../types/solicitacao'
import { ROTULO_PRIORIDADE, ROTULO_STATUS_SOLICITACAO } from '../utils/solicitacao'

const CLASSE_STATUS: Record<StatusSolicitacao, string> = {
  PENDENTE: 'aguardando',
  EM_ATENDIMENTO: 'reservada',
  ATENDIDA: 'apto',
  CANCELADA: 'neutro',
}

export function SeloPrioridade({ prioridade }: { prioridade: PrioridadeSolicitacao }) {
  return (
    <span className={`selo-status selo-prioridade--${prioridade.toLowerCase()}`}>
      {ROTULO_PRIORIDADE[prioridade]}
    </span>
  )
}

export function SeloStatusSolicitacao({ status }: { status: StatusSolicitacao }) {
  return (
    <span className={`selo-status selo-status--${CLASSE_STATUS[status]}`}>
      {ROTULO_STATUS_SOLICITACAO[status]}
    </span>
  )
}