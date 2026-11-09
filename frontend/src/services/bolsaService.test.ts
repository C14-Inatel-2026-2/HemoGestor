import { afterEach, describe, expect, it, vi } from "vitest"
import api from "./api"
import {
  descartarBolsa,
  getBolsas,
} from "./bolsaService"

describe("bolsaService", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("busca todas as bolsas", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({})

    await getBolsas()

    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(getSpy).toHaveBeenCalledWith("/bolsas")
  })

  it("descarta uma bolsa pelo id", async () => {
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({})

    await descartarBolsa(5)

    expect(patchSpy).toHaveBeenCalledTimes(1)
    expect(patchSpy).toHaveBeenCalledWith("/bolsas/5/descartar")
  })
})