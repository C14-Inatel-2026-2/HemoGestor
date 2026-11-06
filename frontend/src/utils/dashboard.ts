import type { Bolsa } from '../types/bolsa'
import type { Doacao } from '../types/doacao'
import type { TipoSanguineo } from '../types/doador'
import type { Solicitacao } from '../types/solicitacao'
import {
  DIAS_ALERTA_VENCIMENTO,
  diasParaVencer,
  estaNoEstoque,
  resumirEstoque,
} from './bolsa'
import { dataDeHoje } from './doacao'
import { FILTROS_INICIAIS_SOLICITACOES, filtrarSolicitacoes } from './solicitacao'

export const LIMITE_ESTOQUE_CRITICO = 10
export const DIAS_DOACOES_RECENTES = 7
export const MAXIMO_SOLICITACOES_EM_DESTAQUE = 5

const TIPOS_SANGUINEOS: TipoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export interface EstoqueDoTipo {
  tipo: TipoSanguineo
  quantidade: number
  critico: boolean
}

export function estoquePorTipo(bolsas: Bolsa[], hoje: string = dataDeHoje()): EstoqueDoTipo[] {
  const disponiveis = bolsas.filter(
    (bolsa) => bolsa.status === 'DISPONIVEL' && estaNoEstoque(bolsa, hoje),
  )

  return TIPOS_SANGUINEOS.map((tipo) => {
    const quantidade = disponiveis.filter((bolsa) => bolsa.tipoSanguineo === tipo).length
    return { tipo, quantidade, critico: quantidade < LIMITE_ESTOQUE_CRITICO }
  })
}

export function contarDoacoesRecentes(doacoes: Doacao[], hoje: string = dataDeHoje()): number {
  return doacoes.filter((doacao) => {
    const diasDesdeAColeta = -diasParaVencer(doacao.dataColeta, hoje)
    const recente = diasDesdeAColeta >= 0 && diasDesdeAColeta < DIAS_DOACOES_RECENTES
    return recente && doacao.status !== 'DESCARTADA'
  }).length
}

export function solicitacoesEmDestaque(solicitacoes: Solicitacao[]): Solicitacao[] {
  return filtrarSolicitacoes(solicitacoes, FILTROS_INICIAIS_SOLICITACOES).slice(
    0,
    MAXIMO_SOLICITACOES_EM_DESTAQUE,
  )
}

export interface Alerta {
  rotulo: string
  nivel: 'CRITICO' | 'ATENCAO'
  titulo: string
  detalhe: string
  destino: '/estoque' | '/solicitacoes'
}

export function alertasDeSolicitacoes(solicitacoes: Solicitacao[]): Alerta[] {
  const ativas = filtrarSolicitacoes(solicitacoes, FILTROS_INICIAIS_SOLICITACOES)
  const emergencias = ativas.filter((solicitacao) => solicitacao.prioridade === 'EMERGENCIA')
  const urgentes = ativas.filter((solicitacao) => solicitacao.prioridade === 'URGENTE')
  const alertas: Alerta[] = []

  if (emergencias.length > 0) {
    const primeira = emergencias[0]
    alertas.push({
      rotulo: 'Emergência',
      nivel: 'CRITICO',
      titulo:
        emergencias.length === 1
          ? '1 solicitação de emergência'
          : `${emergencias.length} solicitações de emergência`,
      detalhe: `${primeira.instituicao} · ${primeira.tipoSanguineo}`,
      destino: '/solicitacoes',
    })
  }

  if (urgentes.length > 0) {
    alertas.push({
      rotulo: 'Urgente',
      nivel: 'ATENCAO',
      titulo:
        urgentes.length === 1 ? '1 solicitação urgente' : `${urgentes.length} solicitações urgentes`,
      detalhe: 'Ainda não concluídas',
      destino: '/solicitacoes',
    })
  }

  return alertas
}

export function alertasDeEstoque(bolsas: Bolsa[], hoje: string = dataDeHoje()): Alerta[] {
  const criticos = estoquePorTipo(bolsas, hoje).filter((estoque) => estoque.critico)
  const { vencemEmBreve } = resumirEstoque(bolsas, hoje)
  const alertas: Alerta[] = []

  if (criticos.length > 0) {
    alertas.push({
      rotulo: 'Crítico',
      nivel: 'CRITICO',
      titulo:
        criticos.length === 1
          ? '1 tipo em estoque crítico'
          : `${criticos.length} tipos em estoque crítico`,
      detalhe: criticos.map((estoque) => estoque.tipo).join(', '),
      destino: '/estoque',
    })
  }

  if (vencemEmBreve > 0) {
    alertas.push({
      rotulo: 'Atenção',
      nivel: 'ATENCAO',
      titulo:
        vencemEmBreve === 1
          ? '1 bolsa próxima do vencimento'
          : `${vencemEmBreve} bolsas próximas do vencimento`,
      detalhe: `Vencem nos próximos ${DIAS_ALERTA_VENCIMENTO} dias`,
      destino: '/estoque',
    })
  }

  return alertas
}