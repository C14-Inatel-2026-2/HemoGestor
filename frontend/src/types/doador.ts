export type TipoSanguineo =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'

export type StatusDoador =
  | 'APTO'
  | 'AGUARDANDO'
  | 'INAPTO'

export type Sexo =
  | 'FEMININO'
  | 'MASCULINO'
  | 'NAO_INFORMADO'

export interface DoadorRequest {
  nome: string
  cpf: string
  data_nascimento: string | null
  sexo: Sexo
  tipo_sanguineo: TipoSanguineo | null
  email: string
  telefone: string
  cidade: string
  bairro: string
  ultima_doacao: string | null
  qtd_doacoes: number
  observacoes: string
}

export interface DoadorResponse {
  id: number
  nome: string
  cpf: string
  data_nascimento: string | null
  sexo: Sexo
  tipo_sanguineo: TipoSanguineo | null
  email: string
  telefone: string
  cidade: string
  bairro: string
  ultima_doacao: string | null
  status: StatusDoador
  qtd_doacoes: number
  observacoes: string
}

export type Doador = DoadorResponse

export type NovoDoador = Omit<
  DoadorRequest,
  'ultima_doacao' | 'qtd_doacoes'
>