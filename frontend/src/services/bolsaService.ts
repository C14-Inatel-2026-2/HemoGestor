import api from "./api"
import type { BolsaResponse } from "../types/bolsa"

export function getBolsas() {
  return api.get<BolsaResponse[]>("/bolsas")
}

export function descartarBolsa(id: number) {
  return api.patch<BolsaResponse>(`/bolsas/${id}/descartar`)
}