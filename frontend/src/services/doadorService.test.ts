import { afterEach, describe, expect, it, vi } from "vitest"
import api from "./api"
import {
  atualizarDoador,
  criarDoador,
  deletarDoador,
  getDoadorPorId,
  getDoadores,
} from "./doadorService"
import type {
  DoadorRequest,
  NovoDoador,
} from "../types/doador"

describe("doadorService", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("busca todos os doadores", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({})

    await getDoadores()

    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(getSpy).toHaveBeenCalledWith("/doadores")
  })

  it("busca um doador pelo id", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({})

    await getDoadorPorId(1)

    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(getSpy).toHaveBeenCalledWith("/doadores/1")
  })

  it("envia um novo doador para a API", async () => {
    const novoDoador: NovoDoador = {
      nome: "Ana Souza",
      cpf: "52998224725",
      data_nascimento: "1995-04-12",
      sexo: "FEMININO",
      tipo_sanguineo: "O-",
      telefone: "(35) 99999-1111",
      email: "ana.souza@email.com",
      cidade: "Pouso Alegre",
      bairro: "Centro",
      observacoes: "",
    }

    const postSpy = vi.spyOn(api, "post").mockResolvedValue({})

    await criarDoador(novoDoador)

    expect(postSpy).toHaveBeenCalledTimes(1)
    expect(postSpy).toHaveBeenCalledWith("/doadores", novoDoador)
  })

  it("atualiza um doador existente", async () => {
    const doadorAtualizado: DoadorRequest = {
      nome: "Ana Souza",
      cpf: "52998224725",
      data_nascimento: "1995-04-12",
      sexo: "FEMININO",
      tipo_sanguineo: "O-",
      email: "ana.souza@email.com",
      telefone: "(35) 99999-1111",
      cidade: "Pouso Alegre",
      bairro: "Centro",
      ultima_doacao: null,
      qtd_doacoes: 0,
      observacoes: "Cadastro atualizado",
    }

    const putSpy = vi.spyOn(api, "put").mockResolvedValue({})

    await atualizarDoador(1, doadorAtualizado)

    expect(putSpy).toHaveBeenCalledTimes(1)
    expect(putSpy).toHaveBeenCalledWith("/doadores/1", doadorAtualizado)
  })

  it("remove um doador pelo id", async () => {
    const deleteSpy = vi.spyOn(api, "delete").mockResolvedValue({})

    await deletarDoador(1)

    expect(deleteSpy).toHaveBeenCalledTimes(1)
    expect(deleteSpy).toHaveBeenCalledWith("/doadores/1")
  })

  it("propaga erro quando a API falha ao criar doador", async () => {
    const novoDoador: NovoDoador = {
      nome: "Ana Souza",
      cpf: "52998224725",
      data_nascimento: "1995-04-12",
      sexo: "FEMININO",
      tipo_sanguineo: "O-",
      telefone: "(35) 99999-1111",
      email: "ana.souza@email.com",
      cidade: "Pouso Alegre",
      bairro: "Centro",
      observacoes: "",
    }

    const erro = new Error("Erro ao cadastrar doador")

    vi.spyOn(api, "post").mockRejectedValue(erro)

    await expect(criarDoador(novoDoador)).rejects.toThrow(
      "Erro ao cadastrar doador"
    )
  })
})