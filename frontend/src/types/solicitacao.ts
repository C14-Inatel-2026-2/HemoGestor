import type { TipoSanguineo } from './doador'

export type PrioridadeSolicitacao = 'NORMAL' | 'URGENTE' | 'EMERGENCIA'

export type StatusSolicitacao = 'PENDENTE' | 'EM_ATENDIMENTO' | 'ATENDIDA' | 'CANCELADA'

export interface SolicitacaoRequest {
  instituicao: string
  setor: string
  tipoSanguineo: TipoSanguineo
  quantidade: number
  prioridade: PrioridadeSolicitacao
  justificativa: string
}

export interface SolicitacaoResponse {
  id: number
  instituicao: string
  setor: string
  tipoSanguineo: TipoSanguineo
  quantidade: number
  prioridade: PrioridadeSolicitacao
  justificativa: string
  dataSolicitacao: string
  status: StatusSolicitacao
  bolsasReservadas: number[]
  bolsasCompativeisDisponiveis: number
}

export type Solicitacao = SolicitacaoResponse