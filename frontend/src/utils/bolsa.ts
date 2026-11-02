import type { StatusBolsa } from '../types/bolsa'
import { dataDeHoje } from './doacao'

// Bolsas que vencem dentro deste número de dias aparecem em destaque.
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

// Dias que faltam até a validade: 0 quando vence hoje e negativo quando já venceu.
export function diasParaVencer(dataValidade: string, hoje: string = dataDeHoje()): number {
  const diferenca = paraMilissegundosUtc(dataValidade) - paraMilissegundosUtc(hoje)
  return Math.round(diferenca / MILISSEGUNDOS_POR_DIA)
}

function quantidadeDeDias(quantidade: number): string {
  return quantidade === 1 ? '1 dia' : `${quantidade} dias`
}

// Texto exibido abaixo da data de validade na tabela do estoque.
export function descreverValidade(dataValidade: string, hoje: string = dataDeHoje()): string {
  const dias = diasParaVencer(dataValidade, hoje)
  if (dias < 0) return `vencida há ${quantidadeDeDias(-dias)}`
  if (dias === 0) return 'vence hoje'
  if (dias <= DIAS_ALERTA_VENCIMENTO) return `em ${quantidadeDeDias(dias)}`
  return `${dias} dias restantes`
}