import { dataDeHoje, formatarData } from './data'

describe('formatarData', () => {
  it('converte a data do formato AAAA-MM-DD para DD/MM/AAAA', () => {
    expect(formatarData('2026-11-05')).toBe('05/11/2026')
  })

  it('mostra um travessão quando não há data', () => {
    expect(formatarData(null)).toBe('—')
    expect(formatarData('')).toBe('—')
  })
})

describe('dataDeHoje', () => {
  it('devolve a data atual no formato AAAA-MM-DD', () => {
    expect(dataDeHoje()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})