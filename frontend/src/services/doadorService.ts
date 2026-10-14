import api from "./api";
import type { NovoDoador } from "../types/doador"

export function getDoadores() {
  return api.get("/doadores");
}
export function criarDoador(doador: NovoDoador) {
  return api.post("/doadores", doador);
}