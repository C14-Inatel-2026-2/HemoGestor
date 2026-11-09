import { pluralizar } from './texto'

describe('pluralizar', () => {
  it('usa o singular quando a quantidade é 1', () => {
    expect(pluralizar(1, 'doador', 'doadores')).toBe('doador')
  })

  it('usa o plural quando a quantidade é diferente de 1', () => {
    expect(pluralizar(0, 'doador', 'doadores')).toBe('doadores')
    expect(pluralizar(2, 'doador', 'doadores')).toBe('doadores')
  })
})