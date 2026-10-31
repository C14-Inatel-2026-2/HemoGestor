import { describe, expect, it } from 'vitest'
import {
  dataDeHoje,
  dataLiberadaParaDoar,
  formatarHora,
  montarRequisicaoDeDoacao,
  validarDoacao,
  verificarElegibilidade,
} from './doacao'
import type { DadosDoacaoFormulario } from './doacao'
import type { Doacao, StatusDoacao } from '../types/doacao'
import type { Doador } from '../types/doador'

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

const doadora: Doador = {
  id: 1,
  nome: 'Ana Souza',
  cpf: '52998224725',
  data_nascimento: '1995-04-12',
  sexo: 'FEMININO',
  tipo_sanguineo: 'O-',
  telefone: '',
  email: '',
  cidade: '',
  bairro: '',
  ultima_doacao: null,
  status: 'APTO',
  qtd_doacoes: 0,
  observacoes: '',
}

const doador: Doador = { ...doadora, id: 2, nome: 'Bruno Lima', sexo: 'MASCULINO' }

function doacaoEm(
  dataColeta: string,
  doadorId = 1,
  status: StatusDoacao = 'CONCLUIDA',
): Doacao {
  return {
    id: Math.floor(Math.random() * 100000),
    doadorId,
    nomeDoador: 'Doador',
    tipoSanguineo: 'O-',
    dataColeta,
    horaColeta: '10:30:00',
    volume_ml: 450,
    tipoDoacao: 'SANGUE_TOTAL',
    pressaoArterial: '',
    hemoglobina: 14,
    sala: '',
    responsavel: 'Enf. Carla',
    intercorrencia: '',
    status,
  }
}

describe('dataLiberadaParaDoar', () => {
  it('devolve null quando o doador nunca doou', () => {
    expect(dataLiberadaParaDoar(doadora, [])).toBeNull()
  })

  it('soma 90 dias para mulheres e 60 dias para homens', () => {
    expect(dataLiberadaParaDoar(doadora, [doacaoEm('2026-08-01')])).toBe('2026-10-30')
    expect(dataLiberadaParaDoar(doador, [doacaoEm('2026-09-01', 2)])).toBe('2026-10-31')
  })

  it('considera a última doação registrada no cadastro do doador', () => {
    const comHistorico = { ...doadora, ultima_doacao: '2026-08-01' }

    expect(dataLiberadaParaDoar(comHistorico, [])).toBe('2026-10-30')
  })

  it('conta doações em triagem, mas ignora as descartadas e as de outros doadores', () => {
    const doacoes = [
      doacaoEm('2026-09-10', 1, 'EM_TRIAGEM'),
      doacaoEm('2026-10-01', 1, 'DESCARTADA'),
      doacaoEm('2026-10-15', 2),
    ]

    expect(dataLiberadaParaDoar(doadora, doacoes)).toBe('2026-12-09')
  })
})

describe('verificarElegibilidade', () => {
  it('permite a primeira doação', () => {
    expect(verificarElegibilidade(doadora, [], '2026-10-30')).toBeNull()
  })

  it('bloqueia doação antes do fim do intervalo e informa a data liberada', () => {
    const mensagem = verificarElegibilidade(doadora, [doacaoEm('2026-08-01')], '2026-10-29')

    expect(mensagem).toBe(
      'Ana Souza só poderá doar novamente a partir de 30/10/2026 (intervalo mínimo de 90 dias).',
    )
  })

  it('permite doação exatamente no dia em que o intervalo termina', () => {
    expect(verificarElegibilidade(doadora, [doacaoEm('2026-08-01')], '2026-10-30')).toBeNull()
  })

  it('bloqueia duas doações seguidas do mesmo doador', () => {
    const mensagem = verificarElegibilidade(
      doador,
      [doacaoEm('2026-10-30', 2, 'EM_TRIAGEM')],
      '2026-10-30',
    )

    expect(mensagem).toContain('só poderá doar novamente a partir de 29/12/2026')
  })

  it('bloqueia quando o doador já atingiu o limite de doações no ano', () => {
    const tresDoacoes = [doacaoEm('2026-01-01'), doacaoEm('2026-04-02'), doacaoEm('2026-07-02')]

    expect(verificarElegibilidade(doadora, tresDoacoes, '2026-10-01')).toBe(
      'Ana Souza já atingiu o limite de 3 doações nos últimos 12 meses.',
    )
  })

  it('permite doar quando as doações antigas já saíram da janela de 12 meses', () => {
    const doacoesAntigas = [doacaoEm('2025-08-01'), doacaoEm('2025-11-01'), doacaoEm('2026-02-01')]

    expect(verificarElegibilidade(doadora, doacoesAntigas, '2026-10-30')).toBeNull()
  })
})

describe('dataDeHoje', () => {
  it('devolve a data atual no formato AAAA-MM-DD', () => {
    expect(dataDeHoje()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})