import api from "./api";

export function getDoadores() {
  return api.get("/doadores");
}