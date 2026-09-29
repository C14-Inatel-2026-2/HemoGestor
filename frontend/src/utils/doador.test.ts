import { formatarCpf, validarCpf} from './doador'

describe('formatarCpf', () => {
  it('formata um CPF com 11 dígitos no padrão 000.000.000-00', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25')
  })
})

describe('validarCpf', () => {
  it('rejeita CPF com dígito verificador incorreto', () => {
    expect(validarCpf('529.982.247-26')).toBe(false)
  })
})
