import { isAxiosError } from 'axios'

export function obterMensagemErro(erro: unknown, mensagemPadrao: string): string {
  if (!isAxiosError(erro)) return mensagemPadrao

  const corpo: unknown = erro.response?.data
  if (typeof corpo !== 'object' || corpo === null) return mensagemPadrao

  const mensagens = Object.values(corpo).filter(
    (valor): valor is string =>
      typeof valor === 'string' && valor.trim() !== '',
  )

  return mensagens.length > 0 ? mensagens.join(' ') : mensagemPadrao
}