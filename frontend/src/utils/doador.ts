import { isAxiosError } from 'axios'
import type { Doador, DoadorRequest, NovoDoador } from '../types/doador'

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function formatarCpf(cpf: string): string {
  const digitos = somenteDigitos(cpf)
  if (digitos.length !== 11) return cpf
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
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

export function formatarData(dataIso: string | null): string {
  if (!dataIso) return '—'
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function obterMensagemErro(erro: unknown, mensagemPadrao: string): string {
  if (!isAxiosError(erro)) return mensagemPadrao
  const corpo: unknown = erro.response?.data
  if (typeof corpo !== 'object' || corpo === null) return mensagemPadrao
  const mensagens = Object.values(corpo).filter((valor): valor is string => typeof valor === 'string' && valor.trim() !== '',)
  return mensagens.length > 0 ? mensagens.join(' ') : mensagemPadrao
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
    telefone: doador.telefone ?? '',
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