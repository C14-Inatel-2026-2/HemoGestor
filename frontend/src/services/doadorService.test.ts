import { afterEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import { criarDoador } from "./doadorService";
import type { NovoDoador } from "../types/doador";

describe("doadorService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    };

    const postSpy = vi.spyOn(api, "post").mockResolvedValue({});

    await criarDoador(novoDoador);

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith("/doadores", novoDoador);
  });

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
    };

    const erro = new Error("Erro ao cadastrar doador");

    vi.spyOn(api, "post").mockRejectedValue(erro);

    await expect(criarDoador(novoDoador)).rejects.toThrow(
      "Erro ao cadastrar doador"
    );
  });
});