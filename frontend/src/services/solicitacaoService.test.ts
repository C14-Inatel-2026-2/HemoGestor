import { afterEach, describe, expect, it, vi } from "vitest"
import api from "./api"
import {
  atenderSolicitacao,
  cancelarSolicitacao,
  concluirSolicitacao,
  criarSolicitacao,
  getSolicitacoes,
} from "./solicitacaoService"
import type { SolicitacaoRequest } from "../types/solicitacao"

describe("solicitacaoService", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("busca todas as solicitações", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({})

    await getSolicitacoes()

    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(getSpy).toHaveBeenCalledWith("/solicitacoes")
  })

  it("envia uma nova solicitação para a API", async () => {
    const novaSolicitacao: SolicitacaoRequest = {
      instituicao: "Hospital Santa Casa",
      setor: "UTI",
      tipoSanguineo: "A+",
      quantidade: 2,
      prioridade: "URGENTE",
      justificativa: "Paciente em procedimento cirúrgico.",
    }

    const postSpy = vi.spyOn(api, "post").mockResolvedValue({})

    await criarSolicitacao(novaSolicitacao)

    expect(postSpy).toHaveBeenCalledTimes(1)
    expect(postSpy).toHaveBeenCalledWith("/solicitacoes", novaSolicitacao)
  })

  it("atende uma solicitação pelo id", async () => {
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({})

    await atenderSolicitacao(4)

    expect(patchSpy).toHaveBeenCalledTimes(1)
    expect(patchSpy).toHaveBeenCalledWith("/solicitacoes/4/atender")
  })

  it("conclui uma solicitação pelo id", async () => {
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({})

    await concluirSolicitacao(4)

    expect(patchSpy).toHaveBeenCalledTimes(1)
    expect(patchSpy).toHaveBeenCalledWith("/solicitacoes/4/concluir")
  })

  it("cancela uma solicitação pelo id", async () => {
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({})

    await cancelarSolicitacao(4)

    expect(patchSpy).toHaveBeenCalledTimes(1)
    expect(patchSpy).toHaveBeenCalledWith("/solicitacoes/4/cancelar")
  })
})