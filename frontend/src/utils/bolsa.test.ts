import { describe, expect, it } from 'vitest'
import {
  DIAS_ALERTA_VENCIMENTO,
  descreverValidade,
  diasParaVencer,
  formatarCodigoBolsa,
} from './bolsa'
import { dataDeHoje } from './doacao'

const HOJE = '2026-11-02'

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