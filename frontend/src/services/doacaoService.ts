import api from "./api"
import type {
  DoacaoRequest,
  DoacaoResponse,
} from "../types/doacao"

export function getDoacoes() {
  return api.get<DoacaoResponse[]>("/doacoes")
}

export function getDoacaoPorId(id: number) {
  return api.get<DoacaoResponse>(`/doacoes/${id}`)
}

export function getDoacoesPorDoador(doadorId: number) {
  return api.get<DoacaoResponse[]>(`/doacoes/doador/${doadorId}`)
}

export function criarDoacao(doacao: DoacaoRequest) {
  return api.post<DoacaoResponse>("/doacoes", doacao)
}

export function concluirDoacao(id: number) {
  return api.patch<DoacaoResponse>(`/doacoes/${id}/concluir`)
}

export function descartarDoacao(id: number) {
  return api.patch<DoacaoResponse>(`/doacoes/${id}/descartar`)
}