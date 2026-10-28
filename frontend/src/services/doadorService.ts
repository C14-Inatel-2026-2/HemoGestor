import api from "./api"
import type {
  DoadorRequest,
  DoadorResponse,
  NovoDoador,
} from "../types/doador"

export function getDoadores() {
  return api.get<DoadorResponse[]>("/doadores")
}

export function getDoadorPorId(id: number) {
  return api.get<DoadorResponse>(`/doadores/${id}`)
}

export function criarDoador(doador: NovoDoador) {
  return api.post<DoadorResponse>("/doadores", doador)
}

export function atualizarDoador(id: number, doador: DoadorRequest) {
  return api.put<DoadorResponse>(`/doadores/${id}`, doador)
}

export function deletarDoador(id: number) {
  return api.delete(`/doadores/${id}`)
}