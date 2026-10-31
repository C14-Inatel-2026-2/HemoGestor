import type { TipoSanguineo } from './doador'

export type TipoDoacao =
  | 'SANGUE_TOTAL'
  | 'PLAQUETA_POR_AFERESE'
  | 'PLASMA'

export type StatusDoacao =
  | 'EM_TRIAGEM'
  | 'CONCLUIDA'
  | 'DESCARTADA'

export interface DoacaoRequest {
  doadorId: number
  dataColeta: string
  horaColeta: string
  volume_ml: number
  tipoDoacao: TipoDoacao
  pressaoArterial: string
  hemoglobina: number
  sala: string
  responsavel: string
  intercorrencia: string
}

export interface DoacaoResponse {
  id: number
  doadorId: number
  nomeDoador: string
  tipoSanguineo: TipoSanguineo | null
  dataColeta: string
  horaColeta: string
  volume_ml: number
  tipoDoacao: TipoDoacao
  pressaoArterial: string
  hemoglobina: number
  sala: string
  responsavel: string
  intercorrencia: string
  status: StatusDoacao
}

export type Doacao = DoacaoResponse