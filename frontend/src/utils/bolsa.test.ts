import { describe, expect, it } from 'vitest'
import {
  DIAS_ALERTA_VENCIMENTO,
  FILTROS_INICIAIS,
  descreverValidade,
  diasParaVencer,
  estaNoEstoque,
  estaVencida,
  filtrarBolsas,
  formatarCodigoBolsa,
  resumirEstoque,
  venceEmBreve,
} from './bolsa'
import { dataDeHoje } from './data'
import type { Bolsa } from '../types/bolsa'

const HOJE = '2026-11-02'

function criarBolsa(dados: Partial<Bolsa> = {}): Bolsa {
  return {
    id: 1,
    doacaoId: 1,
    doadorId: 1,
    nomeDoador: 'Ana Souza',
    tipoSanguineo: 'O-',
    tipoDoacao: 'SANGUE_TOTAL',
    volume_ml: 450,
    dataColeta: '2026-10-20',
    dataValidade: '2026-12-01',
    status: 'DISPONIVEL',
    ...dados,
  }
}

describe('formatarCodigoBolsa', () => {
  it('completa o id com zeros à esquerda', () => {
    expect(formatarCodigoBolsa(4)).toBe('BOL-004')
  })

  it('não corta ids com mais de três dígitos', () => {
    expect(formatarCodigoBolsa(1234)).toBe('BOL-1234')
  })
})

describe('diasParaVencer', () => {
  it('conta os dias que faltam até a validade', () => {
    expect(diasParaVencer('2026-11-07', HOJE)).toBe(5)
  })

  it('devolve zero quando a bolsa vence hoje', () => {
    expect(diasParaVencer('2026-11-02', HOJE)).toBe(0)
  })

  it('devolve número negativo quando a bolsa já venceu', () => {
    expect(diasParaVencer('2026-10-31', HOJE)).toBe(-2)
  })

  it('conta corretamente na virada do mês', () => {
    expect(diasParaVencer('2026-11-02', '2026-10-30')).toBe(3)
  })

  it('usa a data de hoje quando nenhuma data é informada', () => {
    expect(diasParaVencer(dataDeHoje())).toBe(0)
  })
})

describe('descreverValidade', () => {
  it('informa há quantos dias a bolsa venceu', () => {
    expect(descreverValidade('2026-11-01', HOJE)).toBe('vencida há 1 dia')
    expect(descreverValidade('2026-10-30', HOJE)).toBe('vencida há 3 dias')
  })

  it('avisa quando a bolsa vence hoje', () => {
    expect(descreverValidade('2026-11-02', HOJE)).toBe('vence hoje')
  })

  it('mostra a contagem regressiva dentro do período de alerta', () => {
    expect(descreverValidade('2026-11-03', HOJE)).toBe('em 1 dia')
    expect(descreverValidade('2026-11-04', HOJE)).toBe('em 2 dias')
    expect(descreverValidade('2026-11-09', HOJE)).toBe(`em ${DIAS_ALERTA_VENCIMENTO} dias`)
  })

  it('mostra os dias restantes depois do período de alerta', () => {
    expect(descreverValidade('2026-11-10', HOJE)).toBe('8 dias restantes')
  })
})

describe('estaVencida', () => {
  it('considera vencida a bolsa cuja validade já passou', () => {
    expect(estaVencida(criarBolsa({ dataValidade: '2026-11-01' }), HOJE)).toBe(true)
  })

  it('não considera vencida a bolsa que vence hoje', () => {
    expect(estaVencida(criarBolsa({ dataValidade: HOJE }), HOJE)).toBe(false)
  })
})

describe('estaNoEstoque', () => {
  it('conta bolsas disponíveis e reservadas dentro da validade', () => {
    expect(estaNoEstoque(criarBolsa({ status: 'DISPONIVEL' }), HOJE)).toBe(true)
    expect(estaNoEstoque(criarBolsa({ status: 'RESERVADA' }), HOJE)).toBe(true)
  })

  it('não conta bolsas descartadas ou utilizadas', () => {
    expect(estaNoEstoque(criarBolsa({ status: 'DESCARTADA' }), HOJE)).toBe(false)
    expect(estaNoEstoque(criarBolsa({ status: 'UTILIZADA' }), HOJE)).toBe(false)
  })

  it('não conta bolsa disponível que já venceu', () => {
    expect(estaNoEstoque(criarBolsa({ dataValidade: '2026-11-01' }), HOJE)).toBe(false)
  })
})

describe('venceEmBreve', () => {
  it('destaca bolsas do estoque que vencem dentro do período de alerta', () => {
    expect(venceEmBreve(criarBolsa({ dataValidade: '2026-11-09' }), HOJE)).toBe(true)
  })

  it('não destaca bolsas que vencem depois do período de alerta', () => {
    expect(venceEmBreve(criarBolsa({ dataValidade: '2026-11-10' }), HOJE)).toBe(false)
  })

  it('não destaca bolsas vencidas ou fora do estoque', () => {
    expect(venceEmBreve(criarBolsa({ dataValidade: '2026-11-01' }), HOJE)).toBe(false)
    expect(
      venceEmBreve(criarBolsa({ status: 'DESCARTADA', dataValidade: '2026-11-03' }), HOJE),
    ).toBe(false)
  })
})

describe('resumirEstoque', () => {
  it('calcula os números dos cards a partir das bolsas', () => {
    const bolsas = [
      criarBolsa({ id: 1 }),
      criarBolsa({ id: 2, dataValidade: '2026-11-05' }),
      criarBolsa({ id: 3, status: 'RESERVADA' }),
      criarBolsa({ id: 4, status: 'RESERVADA', dataValidade: '2026-11-04' }),
      criarBolsa({ id: 5, dataValidade: '2026-11-01' }),
      criarBolsa({ id: 6, status: 'DESCARTADA' }),
      criarBolsa({ id: 7, status: 'UTILIZADA' }),
    ]

    expect(resumirEstoque(bolsas, HOJE)).toEqual({
      noEstoque: 4,
      disponiveis: 2,
      reservadas: 2,
      vencemEmBreve: 2,
      foraDoEstoque: 3,
    })
  })

  it('devolve tudo zerado quando não há bolsas', () => {
    expect(resumirEstoque([], HOJE)).toEqual({
      noEstoque: 0,
      disponiveis: 0,
      reservadas: 0,
      vencemEmBreve: 0,
      foraDoEstoque: 0,
    })
  })
})

describe('filtrarBolsas', () => {
  const bolsas = [
    criarBolsa({ id: 1, tipoSanguineo: 'O-', dataValidade: '2026-12-01' }),
    criarBolsa({ id: 2, tipoSanguineo: 'A+', status: 'RESERVADA', dataValidade: '2026-11-05' }),
    criarBolsa({ id: 3, tipoSanguineo: 'O-', dataValidade: '2026-11-20' }),
    criarBolsa({ id: 4, tipoSanguineo: 'O-', status: 'DESCARTADA' }),
    criarBolsa({ id: 5, tipoSanguineo: 'A+', dataValidade: '2026-11-01' }),
  ]

  function ids(lista: Bolsa[]): number[] {
    return lista.map((bolsa) => bolsa.id)
  }

  it('mostra no estoque atual só as bolsas válidas, das que vencem primeiro às últimas', () => {
    expect(ids(filtrarBolsas(bolsas, FILTROS_INICIAIS, HOJE))).toEqual([2, 3, 1])
  })

  it('mostra na aba fora do estoque as bolsas vencidas e descartadas', () => {
    const filtros = { ...FILTROS_INICIAIS, aba: 'FORA' as const }
    expect(ids(filtrarBolsas(bolsas, filtros, HOJE))).toEqual([5, 4])
  })

  it('filtra pelo tipo sanguíneo', () => {
    const filtros = { ...FILTROS_INICIAIS, tipoSanguineo: 'O-' as const }
    expect(ids(filtrarBolsas(bolsas, filtros, HOJE))).toEqual([3, 1])
  })

  it('filtra pelo status', () => {
    const filtros = { ...FILTROS_INICIAIS, status: 'RESERVADA' as const }
    expect(ids(filtrarBolsas(bolsas, filtros, HOJE))).toEqual([2])
  })

  it('mostra só as bolsas próximas do vencimento quando a opção está marcada', () => {
    const filtros = { ...FILTROS_INICIAIS, somenteVencendo: true }
    expect(ids(filtrarBolsas(bolsas, filtros, HOJE))).toEqual([2])
  })

  it('devolve lista vazia quando nenhuma bolsa atende a todos os filtros', () => {
    const filtros = { ...FILTROS_INICIAIS, tipoSanguineo: 'O-' as const, somenteVencendo: true }
    expect(filtrarBolsas(bolsas, filtros, HOJE)).toEqual([])
  })

  it('não altera a ordem da lista original', () => {
    filtrarBolsas(bolsas, FILTROS_INICIAIS, HOJE)
    expect(ids(bolsas)).toEqual([1, 2, 3, 4, 5])
  })
})
