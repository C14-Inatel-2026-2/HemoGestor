import type { Bolsa } from '../types/bolsa'
import { formatarData } from './data'
import { formatarCodigoBolsa, ROTULO_STATUS_BOLSA } from './bolsa'

function escaparCampo(valor: string): string {
  const precisaAspas =
    valor.includes(';') ||
    valor.includes('"') ||
    valor.includes('\n')

  if (!precisaAspas) return valor

  return `"${valor.replaceAll('"', '""')}"`
}

export function gerarCsvEstoque(bolsas: Bolsa[]): string {
  const cabecalho = [
    'Código',
    'Tipo sanguíneo',
    'Data da coleta',
    'Data de validade',
    'Status',
    'Origem',
  ]

  const linhas = bolsas.map((bolsa) => [
    formatarCodigoBolsa(bolsa.id),
    bolsa.tipoSanguineo,
    formatarData(bolsa.dataColeta),
    formatarData(bolsa.dataValidade),
    ROTULO_STATUS_BOLSA[bolsa.status],
    bolsa.nomeDoador,
  ])

  const conteudo = [cabecalho, ...linhas]
    .map((linha) => linha.map(escaparCampo).join(';'))
    .join('\n')

  return `\uFEFF${conteudo}`
}