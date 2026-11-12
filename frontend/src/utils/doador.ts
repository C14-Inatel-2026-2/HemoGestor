import type { Doador, DoadorRequest, NovoDoador, StatusDoador, TipoSanguineo } from '../types/doador'
import { normalizarTexto } from './texto'

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

export interface FiltrosDoadores {
  busca: string
  tipoSanguineo: TipoSanguineo | ''
  status: StatusDoador | ''
}

export const FILTROS_INICIAIS_DOADORES: FiltrosDoadores = {
  busca: '',
  tipoSanguineo: '',
  status: '',
}

export function filtrarDoadores(doadores: Doador[], filtros: FiltrosDoadores): Doador[] {
  const busca = normalizarTexto(filtros.busca)
  const buscaCpf = somenteDigitos(filtros.busca)

  return doadores
    .filter((doador) => {
      const encontrouNome = normalizarTexto(doador.nome).includes(busca)
      const encontrouCpf = buscaCpf !== '' && somenteDigitos(doador.cpf).includes(buscaCpf)
      return encontrouNome || encontrouCpf
    })
    .filter((doador) => !filtros.tipoSanguineo || doador.tipo_sanguineo === filtros.tipoSanguineo)
    .filter((doador) => !filtros.status || doador.status === filtros.status)
}

export function formatarCpf(cpf: string): string {
  const digitos = somenteDigitos(cpf)
  if (digitos.length !== 11) return cpf
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatarTelefone(telefone: string): string {
  const digitos = somenteDigitos(telefone)
  if (digitos.length === 11) return digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (digitos.length === 10) return digitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return telefone
}

export function validarTelefone(telefone: string): boolean {
  const digitos = somenteDigitos(telefone)
  return digitos.length === 0 || digitos.length === 10 || digitos.length === 11
}

function calcularDigito(base: string, pesoInicial: number): number {
  const soma = base
    .split('')
    .reduce((total, digito, i) => total + Number(digito) * (pesoInicial - i), 0)
  const resto = (soma * 10) % 11
  return resto === 10 ? 0 : resto
}

export function validarCpf(cpf: string): boolean {
  const digitos = somenteDigitos(cpf)
  if (digitos.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digitos)) return false

  const primeiro = calcularDigito(digitos.slice(0, 9), 10)
  const segundo = calcularDigito(digitos.slice(0, 10), 11)
  return primeiro === Number(digitos[9]) && segundo === Number(digitos[10])
}

export function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

export function paraDadosDoFormulario(doador: Doador): NovoDoador {
  return {
    nome: doador.nome,
    cpf: doador.cpf,
    data_nascimento: doador.data_nascimento,
    sexo: doador.sexo,
    tipo_sanguineo: doador.tipo_sanguineo,
    telefone: formatarTelefone(doador.telefone ?? ''),
    email: doador.email ?? '',
    cidade: doador.cidade ?? '',
    bairro: doador.bairro ?? '',
    observacoes: doador.observacoes ?? '',
  }
}

export function montarRequisicaoDeEdicao(doador: Doador, dados: NovoDoador): DoadorRequest {
  return {
    ...dados,
    ultima_doacao: doador.ultima_doacao,
    qtd_doacoes: doador.qtd_doacoes,
  }
}