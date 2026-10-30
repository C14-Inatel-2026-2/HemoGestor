import { describe, expect, it } from 'vitest'
import {
  formatarHora,
  montarRequisicaoDeDoacao,
  validarDoacao,
} from './doacao'
import type { DadosDoacaoFormulario } from './doacao'

const dadosValidos: DadosDoacaoFormulario = {
  doadorId: '1',
  dataColeta: '2026-10-28',
  horaColeta: '10:30',
  volume_ml: '450',
  tipoDoacao: 'SANGUE_TOTAL',
  pressaoArterial: '120/80',
  hemoglobina: '14.2',
  sala: 'Sala 1',
  responsavel: 'Enf. Carla',
  intercorrencia: '',
}

describe('validarDoacao', () => {
  it('não aponta erros quando os dados são válidos', () => {
    expect(validarDoacao(dadosValidos)).toEqual({})
  })

  it('exige doador, data, hora e responsável', () => {
    const erros = validarDoacao({
      ...dadosValidos,
      doadorId: '',
      dataColeta: '',
      horaColeta: '',
      responsavel: '   ',
    })

    expect(erros.doadorId).toBe('Selecione o doador.')
    expect(erros.dataColeta).toBe('Informe a data da coleta.')
    expect(erros.horaColeta).toBe('Informe a hora da coleta.')
    expect(erros.responsavel).toBe('Informe o responsável pela coleta.')
  })

  it('rejeita volume zerado, negativo ou fracionado', () => {
    expect(validarDoacao({ ...dadosValidos, volume_ml: '0' }).volume_ml).toBeDefined()
    expect(validarDoacao({ ...dadosValidos, volume_ml: '-10' }).volume_ml).toBeDefined()
    expect(validarDoacao({ ...dadosValidos, volume_ml: '450.5' }).volume_ml).toBeDefined()
    expect(validarDoacao({ ...dadosValidos, volume_ml: '' }).volume_ml).toBeDefined()
  })

  it('aceita hemoglobina com vírgula e rejeita valores inválidos', () => {
    expect(validarDoacao({ ...dadosValidos, hemoglobina: '14,2' }).hemoglobina).toBeUndefined()
    expect(validarDoacao({ ...dadosValidos, hemoglobina: '0' }).hemoglobina).toBeDefined()
    expect(validarDoacao({ ...dadosValidos, hemoglobina: 'abc' }).hemoglobina).toBeDefined()
    expect(validarDoacao({ ...dadosValidos, hemoglobina: '' }).hemoglobina).toBeDefined()
  })
})

describe('montarRequisicaoDeDoacao', () => {
  it('converte os campos de texto para o formato esperado pela API', () => {
    const requisicao = montarRequisicaoDeDoacao({
      ...dadosValidos,
      hemoglobina: '14,2',
      sala: '  Sala 1 ',
      responsavel: ' Enf. Carla ',
    })

    expect(requisicao).toEqual({
      doadorId: 1,
      dataColeta: '2026-10-28',
      horaColeta: '10:30',
      volume_ml: 450,
      tipoDoacao: 'SANGUE_TOTAL',
      pressaoArterial: '120/80',
      hemoglobina: 14.2,
      sala: 'Sala 1',
      responsavel: 'Enf. Carla',
      intercorrencia: '',
    })
  })
})

describe('formatarHora', () => {
  it('remove os segundos devolvidos pela API', () => {
    expect(formatarHora('10:30:00')).toBe('10:30')
  })

  it('mantém horas que já estão sem segundos', () => {
    expect(formatarHora('10:30')).toBe('10:30')
  })
})