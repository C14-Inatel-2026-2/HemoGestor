import { normalizarTexto, pluralizar } from './texto'

describe('normalizarTexto', () => {
  it('remove acentos, espaços nas pontas e letras maiúsculas', () => {
    expect(normalizarTexto('  JOÃO Conceição ')).toBe('joao conceicao')
  })
})

describe('pluralizar', () => {
  it('usa o singular quando a quantidade é 1', () => {
    expect(pluralizar(1, 'doador', 'doadores')).toBe('doador')
  })

  it('usa o plural quando a quantidade é diferente de 1', () => {
    expect(pluralizar(0, 'doador', 'doadores')).toBe('doadores')
    expect(pluralizar(2, 'doador', 'doadores')).toBe('doadores')
  })
})