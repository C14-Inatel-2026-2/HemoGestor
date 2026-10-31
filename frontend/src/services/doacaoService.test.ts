import { afterEach, describe, expect, it, vi } from "vitest"
import api from "./api"
import {
  concluirDoacao,
  criarDoacao,
  descartarDoacao,
  getDoacoes,
} from "./doacaoService"
import type { DoacaoRequest } from "../types/doacao"

describe("doacaoService", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("busca todas as doações", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({})

    await getDoacoes()

    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(getSpy).toHaveBeenCalledWith("/doacoes")
  })

  it("envia uma nova doação para a API", async () => {
    const novaDoacao: DoacaoRequest = {
      doadorId: 1,
      dataColeta: "2026-10-28",
      horaColeta: "10:30",
      volume_ml: 450,
      tipoDoacao: "SANGUE_TOTAL",
      pressaoArterial: "120/80",
      hemoglobina: 14.2,
      sala: "Sala 1",
      responsavel: "Enf. Carla",
      intercorrencia: "",
    }

    const postSpy = vi.spyOn(api, "post").mockResolvedValue({})

    await criarDoacao(novaDoacao)

    expect(postSpy).toHaveBeenCalledTimes(1)
    expect(postSpy).toHaveBeenCalledWith("/doacoes", novaDoacao)
  })

  it("conclui uma doação pelo id", async () => {
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({})

    await concluirDoacao(7)

    expect(patchSpy).toHaveBeenCalledTimes(1)
    expect(patchSpy).toHaveBeenCalledWith("/doacoes/7/concluir")
  })

  it("descarta uma doação pelo id", async () => {
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({})

    await descartarDoacao(7)

    expect(patchSpy).toHaveBeenCalledTimes(1)
    expect(patchSpy).toHaveBeenCalledWith("/doacoes/7/descartar")
  })

  it("propaga erro quando a API falha ao registrar a doação", async () => {
    const novaDoacao: DoacaoRequest = {
      doadorId: 1,
      dataColeta: "2026-10-28",
      horaColeta: "10:30",
      volume_ml: 450,
      tipoDoacao: "SANGUE_TOTAL",
      pressaoArterial: "120/80",
      hemoglobina: 14.2,
      sala: "Sala 1",
      responsavel: "Enf. Carla",
      intercorrencia: "",
    }

    vi.spyOn(api, "post").mockRejectedValue(new Error("Erro ao registrar doação"))

    await expect(criarDoacao(novaDoacao)).rejects.toThrow("Erro ao registrar doação")
  })
})