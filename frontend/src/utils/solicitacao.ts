import type {
  PrioridadeSolicitacao,
  Solicitacao,
  StatusSolicitacao,
} from '../types/solicitacao'
import { formatarData } from './doador'

export const ROTULO_PRIORIDADE: Record<PrioridadeSolicitacao, string> = {
  NORMAL: 'Normal',
  URGENTE: 'Urgente',
  EMERGENCIA: 'Emergência',
}

export const ROTULO_STATUS_SOLICITACAO: Record<StatusSolicitacao, string> = {
  PENDENTE: 'Pendente',
  EM_ATENDIMENTO: 'Em atendimento',
  ATENDIDA: 'Atendida',
  CANCELADA: 'Cancelada',
}

const ORDEM_PRIORIDADE: Record<PrioridadeSolicitacao, number> = {
  EMERGENCIA: 0,
  URGENTE: 1,
  NORMAL: 2,
}

export function formatarCodigoSolicitacao(id: number): string {
  return `SOL-${String(id).padStart(3, '0')}`
}

export function formatarDataHora(dataHora: string): string {
  return `${formatarData(dataHora.slice(0, 10))} · ${dataHora.slice(11, 16)}`
}

export function quantidadeDeBolsas(quantidade: number): string {
  return quantidade === 1 ? '1 bolsa' : `${quantidade} bolsas`
}

export function estaAtiva(solicitacao: Solicitacao): boolean {
  return solicitacao.status === 'PENDENTE' || solicitacao.status === 'EM_ATENDIMENTO'
}

export function ehPrioritaria(solicitacao: Solicitacao): boolean {
  return solicitacao.prioridade !== 'NORMAL'
}

export function temEstoqueSuficiente(solicitacao: Solicitacao): boolean {
  return solicitacao.bolsasCompativeisDisponiveis >= solicitacao.quantidade
}

export interface ResumoSolicitacoes {
  pendentes: number
  emAtendimento: number
  atendidas: number
  prioritariasAtivas: number
  ativas: number
  historico: number
}

export function resumirSolicitacoes(solicitacoes: Solicitacao[]): ResumoSolicitacoes {
  const ativas = solicitacoes.filter(estaAtiva)

  return {
    pendentes: ativas.filter((solicitacao) => solicitacao.status === 'PENDENTE').length,
    emAtendimento: ativas.filter((solicitacao) => solicitacao.status === 'EM_ATENDIMENTO').length,
    atendidas: solicitacoes.filter((solicitacao) => solicitacao.status === 'ATENDIDA').length,
    prioritariasAtivas: ativas.filter(ehPrioritaria).length,
    ativas: ativas.length,
    historico: solicitacoes.length - ativas.length,
  }
}

export type AbaSolicitacoes = 'ATIVAS' | 'HISTORICO'

export interface FiltrosSolicitacoes {
  aba: AbaSolicitacoes
  status: StatusSolicitacao | ''
  prioridade: PrioridadeSolicitacao | ''
}

export const FILTROS_INICIAIS_SOLICITACOES: FiltrosSolicitacoes = {
  aba: 'ATIVAS',
  status: '',
  prioridade: '',
}

function compararAtivas(a: Solicitacao, b: Solicitacao): number {
  const diferencaDePrioridade = ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade]
  if (diferencaDePrioridade !== 0) return diferencaDePrioridade
  return a.dataSolicitacao.localeCompare(b.dataSolicitacao)
}

function compararHistorico(a: Solicitacao, b: Solicitacao): number {
  return b.dataSolicitacao.localeCompare(a.dataSolicitacao)
}

export function filtrarSolicitacoes(
  solicitacoes: Solicitacao[],
  filtros: FiltrosSolicitacoes,
): Solicitacao[] {
  return solicitacoes
    .filter((solicitacao) => (filtros.aba === 'ATIVAS' ? estaAtiva(solicitacao) : !estaAtiva(solicitacao)))
    .filter((solicitacao) => !filtros.status || solicitacao.status === filtros.status)
    .filter((solicitacao) => !filtros.prioridade || solicitacao.prioridade === filtros.prioridade)
    .sort(filtros.aba === 'ATIVAS' ? compararAtivas : compararHistorico)
}