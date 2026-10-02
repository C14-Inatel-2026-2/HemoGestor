import api from "./api";

describe("api", () => {
  it("usa VITE_API_URL como baseURL", () => {
    expect(api.defaults.baseURL).toBe(import.meta.env.VITE_API_URL);
  });

  it("monta corretamente a URL do endpoint de doadores", () => {
    const url = api.getUri({
      url: "/doadores",
    });

    expect(url).toBe(`${import.meta.env.VITE_API_URL}/doadores`);
  });
});