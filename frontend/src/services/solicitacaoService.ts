import api from "./api"
import type {
  SolicitacaoRequest,
  SolicitacaoResponse,
} from "../types/solicitacao"

export function getSolicitacoes() {
  return api.get<SolicitacaoResponse[]>("/solicitacoes")
}

export function criarSolicitacao(solicitacao: SolicitacaoRequest) {
  return api.post<SolicitacaoResponse>("/solicitacoes", solicitacao)
}

export function atenderSolicitacao(id: number) {
  return api.patch<SolicitacaoResponse>(`/solicitacoes/${id}/atender`)
}

export function concluirSolicitacao(id: number) {
  return api.patch<SolicitacaoResponse>(`/solicitacoes/${id}/concluir`)
}

export function cancelarSolicitacao(id: number) {
  return api.patch<SolicitacaoResponse>(`/solicitacoes/${id}/cancelar`)
}