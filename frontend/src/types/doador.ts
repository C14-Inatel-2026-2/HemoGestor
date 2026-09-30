export type TipoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export type StatusDoador = 'APTO' | 'AGUARDANDO' | 'INAPTO'

export type Sexo = 'FEMININO' | 'MASCULINO' | 'NAO_INFORMADO'

export interface Doador {
  id: number
  nome: string
  cpf: string
  data_nascimento: string | null
  sexo: Sexo
  tipo_sanguineo: TipoSanguineo | null
  telefone: string
  email: string
  cidade: string
  bairro: string
  ultima_doacao: string | null
  status: StatusDoador
  qtd_doacoes: number
  observacoes: string
}

export type NovoDoador = Omit<Doador, 'id' | 'ultima_doacao' | 'status' | 'qtd_doacoes'>