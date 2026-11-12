import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'

export function respostaCom<T>(dados: T) {
  return { data: dados } as AxiosResponse<T>
}

export function falhaDaApi(status: number, corpo: unknown) {
  return new AxiosError('Erro', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data: corpo,
  } as AxiosResponse)
}