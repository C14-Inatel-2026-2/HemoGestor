import type { Doacao, DoacaoRequest, StatusDoacao, TipoDoacao } from '../types/doacao'
import type { Doador, Sexo } from '../types/doador'
import { formatarData } from './doador'

export const ROTULO_TIPO_DOACAO: Record<TipoDoacao, string> = {
  SANGUE_TOTAL: 'Sangue total',
  PLAQUETA_POR_AFERESE: 'Plaqueta por aférese',
  PLASMA: 'Plasma',
}

export const ROTULO_STATUS_DOACAO: Record<StatusDoacao, string> = {
  EM_TRIAGEM: 'Em triagem',
  CONCLUIDA: 'Concluída',
  DESCARTADA: 'Descartada',
}

export interface DadosDoacaoFormulario {
  doadorId: string
  dataColeta: string
  horaColeta: string
  volume_ml: string
  tipoDoacao: TipoDoacao
  pressaoArterial: string
  hemoglobina: string
  sala: string
  responsavel: string
  intercorrencia: string
}

export type ErrosDoacao = Partial<
  Record<'doadorId' | 'dataColeta' | 'horaColeta' | 'volume_ml' | 'hemoglobina' | 'responsavel', string>
>

function paraNumero(valor: string): number {
  return Number(valor.trim().replace(',', '.'))
}

export function validarDoacao(dados: DadosDoacaoFormulario): ErrosDoacao {
  const erros: ErrosDoacao = {}
  const volume = paraNumero(dados.volume_ml)
  const hemoglobina = paraNumero(dados.hemoglobina)

  if (!dados.doadorId) erros.doadorId = 'Selecione o doador.'
  if (!dados.dataColeta) erros.dataColeta = 'Informe a data da coleta.'
  if (!dados.horaColeta) erros.horaColeta = 'Informe a hora da coleta.'
  if (!dados.volume_ml.trim() || !Number.isInteger(volume) || volume <= 0) {
    erros.volume_ml = 'Informe um volume maior que zero.'
  }
  if (!dados.hemoglobina.trim() || !Number.isFinite(hemoglobina) || hemoglobina <= 0) {
    erros.hemoglobina = 'Informe uma hemoglobina maior que zero.'
  }
  if (!dados.responsavel.trim()) erros.responsavel = 'Informe o responsável pela coleta.'

  return erros
}

export function montarRequisicaoDeDoacao(dados: DadosDoacaoFormulario): DoacaoRequest {
  return {
    doadorId: Number(dados.doadorId),
    dataColeta: dados.dataColeta,
    horaColeta: dados.horaColeta,
    volume_ml: paraNumero(dados.volume_ml),
    tipoDoacao: dados.tipoDoacao,
    pressaoArterial: dados.pressaoArterial.trim(),
    hemoglobina: paraNumero(dados.hemoglobina),
    sala: dados.sala.trim(),
    responsavel: dados.responsavel.trim(),
    intercorrencia: dados.intercorrencia.trim(),
  }
}

export function formatarHora(hora: string): string {
  return hora.slice(0, 5)
}

function somarDias(dataIso: string, dias: number): string {
  const data = new Date(`${dataIso}T00:00:00Z`)
  data.setUTCDate(data.getUTCDate() + dias)
  return data.toISOString().slice(0, 10)
}

export function dataDeHoje(): string {
  const agora = new Date()
  const doisDigitos = (valor: number) => String(valor).padStart(2, '0')
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`
}

export function intervaloMinimoEmDias(sexo: Sexo): number {
  return sexo === 'MASCULINO' ? 60 : 90
}

export function limiteDeDoacoesPorAno(sexo: Sexo): number {
  return sexo === 'MASCULINO' ? 4 : 3
}

// Datas das doações do doador que ainda valem (as descartadas não contam), em ordem crescente.
export function datasDeDoacao(doador: Doador, doacoes: Doacao[]): string[] {
  const datas = doacoes
    .filter((doacao) => doacao.doadorId === doador.id && doacao.status !== 'DESCARTADA')
    .map((doacao) => doacao.dataColeta)
  if (doador.ultima_doacao) datas.push(doador.ultima_doacao)
  return [...new Set(datas)].sort()
}

// Primeira data em que o doador pode voltar a doar, ou null se nunca doou.
export function dataLiberadaParaDoar(doador: Doador, doacoes: Doacao[]): string | null {
  const datas = datasDeDoacao(doador, doacoes)
  const ultima = datas[datas.length - 1]
  return ultima ? somarDias(ultima, intervaloMinimoEmDias(doador.sexo)) : null
}

// Devolve o motivo pelo qual o doador não pode doar na data informada, ou null se pode.
export function verificarElegibilidade(
  doador: Doador,
  doacoes: Doacao[],
  dataColeta: string,
): string | null {
  const liberada = dataLiberadaParaDoar(doador, doacoes)
  if (liberada && dataColeta < liberada) {
    return `${doador.nome} só poderá doar novamente a partir de ${formatarData(liberada)} (intervalo mínimo de ${intervaloMinimoEmDias(doador.sexo)} dias).`
  }

  const limite = limiteDeDoacoesPorAno(doador.sexo)
  const inicioDaJanela = somarDias(dataColeta, -365)
  const noUltimoAno = datasDeDoacao(doador, doacoes).filter(
    (data) => data > inicioDaJanela && data <= dataColeta,
  )
  if (noUltimoAno.length >= limite) {
    return `${doador.nome} já atingiu o limite de ${limite} doações nos últimos 12 meses.`
  }

  return null
}