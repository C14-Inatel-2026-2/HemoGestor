import { gerarCsvEstoque } from './csvEstoque'
import type { Bolsa } from '../types/bolsa'

const bolsas: Bolsa[] = [
  {
    id: 1,
    doacaoId: 1,
    doadorId: 1,
    nomeDoador: 'João da Silva',
    tipoSanguineo: 'A+',
    tipoDoacao: 'SANGUE_TOTAL',
    volume_ml: 450,
    dataColeta: '2026-11-01',
    dataValidade: '2026-12-01',
    status: 'DISPONIVEL',
  },
]

describe('gerarCsvEstoque', () => {
  it('gera o CSV com cabeçalho e dados das bolsas', () => {
    const csv = gerarCsvEstoque(bolsas)

    expect(csv).toContain(
      'Código;Tipo sanguíneo;Data da coleta;Data de validade;Status;Origem',
    )
    expect(csv).toContain('BOL-001')
    expect(csv).toContain('A+')
    expect(csv).toContain('João da Silva')
  })

  it('adiciona BOM UTF-8 para preservar acentos no Excel', () => {
    const csv = gerarCsvEstoque(bolsas)

    expect(csv.startsWith('\uFEFF')).toBe(true)
  })

  it('escapa campos com ponto e vírgula', () => {
    const csv = gerarCsvEstoque([
      {
        ...bolsas[0],
        nomeDoador: 'Hospital São José; Unidade 2',
      },
    ])

    expect(csv).toContain('"Hospital São José; Unidade 2"')
  })
})