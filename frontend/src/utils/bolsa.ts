import type { Bolsa, StatusBolsa } from '../types/bolsa'
import type { TipoSanguineo } from '../types/doador'
import { dataDeHoje } from './data'
import { pluralizar } from './texto'

export const DIAS_ALERTA_VENCIMENTO = 7

const MILISSEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24

export const ROTULO_STATUS_BOLSA: Record<StatusBolsa, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADA: 'Reservada',
  UTILIZADA: 'Utilizada',
  DESCARTADA: 'Descartada',
}

export function formatarCodigoBolsa(id: number): string {
  return `BOL-${String(id).padStart(3, '0')}`
}

function paraMilissegundosUtc(dataIso: string): number {
  return new Date(`${dataIso}T00:00:00Z`).getTime()
}

export function diasParaVencer(dataValidade: string, hoje: string = dataDeHoje()): number {
  const diferenca = paraMilissegundosUtc(dataValidade) - paraMilissegundosUtc(hoje)
  return Math.round(diferenca / MILISSEGUNDOS_POR_DIA)
}

function quantidadeDeDias(quantidade: number): string {
  return `${quantidade} ${pluralizar(quantidade, 'dia', 'dias')}`
}

export function descreverValidade(dataValidade: string, hoje: string = dataDeHoje()): string {
  const dias = diasParaVencer(dataValidade, hoje)
  if (dias < 0) return `vencida há ${quantidadeDeDias(-dias)}`
  if (dias === 0) return 'vence hoje'
  if (dias <= DIAS_ALERTA_VENCIMENTO) return `em ${quantidadeDeDias(dias)}`
  return `${dias} dias restantes`
}

export function estaVencida(bolsa: Bolsa, hoje: string = dataDeHoje()): boolean {
  return diasParaVencer(bolsa.dataValidade, hoje) < 0
}

export function estaNoEstoque(bolsa: Bolsa, hoje: string = dataDeHoje()): boolean {
  const statusDeEstoque = bolsa.status === 'DISPONIVEL' || bolsa.status === 'RESERVADA'
  return statusDeEstoque && !estaVencida(bolsa, hoje)
}

export function venceEmBreve(bolsa: Bolsa, hoje: string = dataDeHoje()): boolean {
  return (
    estaNoEstoque(bolsa, hoje) &&
    diasParaVencer(bolsa.dataValidade, hoje) <= DIAS_ALERTA_VENCIMENTO
  )
}

export interface ResumoEstoque {
  noEstoque: number
  disponiveis: number
  reservadas: number
  vencemEmBreve: number
  foraDoEstoque: number
}

export function resumirEstoque(bolsas: Bolsa[], hoje: string = dataDeHoje()): ResumoEstoque {
  const emEstoque = bolsas.filter((bolsa) => estaNoEstoque(bolsa, hoje))

  return {
    noEstoque: emEstoque.length,
    disponiveis: emEstoque.filter((bolsa) => bolsa.status === 'DISPONIVEL').length,
    reservadas: emEstoque.filter((bolsa) => bolsa.status === 'RESERVADA').length,
    vencemEmBreve: emEstoque.filter((bolsa) => venceEmBreve(bolsa, hoje)).length,
    foraDoEstoque: bolsas.length - emEstoque.length,
  }
}

export type AbaEstoque = 'ATUAL' | 'FORA'

export interface FiltrosEstoque {
  aba: AbaEstoque
  tipoSanguineo: TipoSanguineo | ''
  status: StatusBolsa | ''
  somenteVencendo: boolean
}

export const FILTROS_INICIAIS: FiltrosEstoque = {
  aba: 'ATUAL',
  tipoSanguineo: '',
  status: '',
  somenteVencendo: false,
}

export function filtrarBolsas(
  bolsas: Bolsa[],
  filtros: FiltrosEstoque,
  hoje: string = dataDeHoje(),
): Bolsa[] {
  return bolsas
    .filter((bolsa) => {
      const noEstoque = estaNoEstoque(bolsa, hoje)
      return filtros.aba === 'ATUAL' ? noEstoque : !noEstoque
    })
    .filter((bolsa) => !filtros.tipoSanguineo || bolsa.tipoSanguineo === filtros.tipoSanguineo)
    .filter((bolsa) => !filtros.status || bolsa.status === filtros.status)
    .filter((bolsa) => !filtros.somenteVencendo || venceEmBreve(bolsa, hoje))
    .sort((a, b) => a.dataValidade.localeCompare(b.dataValidade))
}