import type { TipoDoacao } from './doacao'
import type { TipoSanguineo } from './doador'

export type StatusBolsa =
  | 'DISPONIVEL'
  | 'RESERVADA'
  | 'UTILIZADA'
  | 'DESCARTADA'

export interface BolsaResponse {
  id: number
  doacaoId: number
  doadorId: number
  nomeDoador: string
  tipoSanguineo: TipoSanguineo
  tipoDoacao: TipoDoacao
  volume_ml: number
  dataColeta: string
  dataValidade: string
  status: StatusBolsa
}

export type Bolsa = BolsaResponse