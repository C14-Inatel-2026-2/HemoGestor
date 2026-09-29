import { formatarCpf} from './doador'

describe('formatarCpf', () => {
  it('formata um CPF com 11 dígitos no padrão 000.000.000-00', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25')
  })
})