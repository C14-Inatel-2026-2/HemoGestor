import type { DoacaoRequest, StatusDoacao, TipoDoacao } from '../types/doacao'

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