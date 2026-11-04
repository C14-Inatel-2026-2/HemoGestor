import { describe, expect, it } from 'vitest'
import {
  FILTROS_INICIAIS_SOLICITACOES,
  ehPrioritaria,
  estaAtiva,
  filtrarSolicitacoes,
  formatarCodigoSolicitacao,
  formatarDataHora,
  montarRequisicaoDeSolicitacao,
  quantidadeDeBolsas,
  resumirSolicitacoes,
  temEstoqueSuficiente,
  validarSolicitacao,
} from './solicitacao'
import type { DadosSolicitacaoFormulario } from './solicitacao'
import type { Solicitacao } from '../types/solicitacao'

function criarSolicitacao(dados: Partial<Solicitacao> = {}): Solicitacao {
  return {
    id: 1,
    instituicao: 'Hospital São Lucas',
    setor: 'UTI adulto',
    tipoSanguineo: 'O-',
    quantidade: 2,
    prioridade: 'NORMAL',
    justificativa: 'Cirurgia eletiva',
    dataSolicitacao: '2026-11-01T08:00:00',
    status: 'PENDENTE',
    bolsasReservadas: [],
    bolsasCompativeisDisponiveis: 4,
    ...dados,
  }
}

const solicitacoes: Solicitacao[] = [
  criarSolicitacao({ id: 1 }),
  criarSolicitacao({ id: 2, prioridade: 'EMERGENCIA', dataSolicitacao: '2026-11-02T09:00:00' }),
  criarSolicitacao({
    id: 3,
    prioridade: 'URGENTE',
    status: 'EM_ATENDIMENTO',
    dataSolicitacao: '2026-11-01T10:00:00',
  }),
  criarSolicitacao({ id: 4, prioridade: 'URGENTE', dataSolicitacao: '2026-10-31T07:00:00' }),
  criarSolicitacao({
    id: 5,
    prioridade: 'EMERGENCIA',
    status: 'ATENDIDA',
    dataSolicitacao: '2026-10-30T12:00:00',
  }),
  criarSolicitacao({ id: 6, status: 'CANCELADA', dataSolicitacao: '2026-10-31T15:00:00' }),
  criarSolicitacao({ id: 7, status: 'ATENDIDA', dataSolicitacao: '2026-10-29T08:00:00' }),
]

function ids(lista: Solicitacao[]): number[] {
  return lista.map((solicitacao) => solicitacao.id)
}

describe('formatarCodigoSolicitacao', () => {
  it('completa o id com zeros à esquerda', () => {
    expect(formatarCodigoSolicitacao(5)).toBe('SOL-005')
  })

  it('não corta ids com mais de três dígitos', () => {
    expect(formatarCodigoSolicitacao(1234)).toBe('SOL-1234')
  })
})

describe('formatarDataHora', () => {
  it('mostra a data no formato brasileiro e a hora sem os segundos', () => {
    expect(formatarDataHora('2026-09-01T06:20:45')).toBe('01/09/2026 · 06:20')
  })
})

describe('quantidadeDeBolsas', () => {
  it('usa o singular para uma bolsa', () => {
    expect(quantidadeDeBolsas(1)).toBe('1 bolsa')
  })

  it('usa o plural para as demais quantidades', () => {
    expect(quantidadeDeBolsas(0)).toBe('0 bolsas')
    expect(quantidadeDeBolsas(3)).toBe('3 bolsas')
  })
})

describe('estaAtiva', () => {
  it('considera ativas as solicitações pendentes e em atendimento', () => {
    expect(estaAtiva(criarSolicitacao({ status: 'PENDENTE' }))).toBe(true)
    expect(estaAtiva(criarSolicitacao({ status: 'EM_ATENDIMENTO' }))).toBe(true)
  })

  it('não considera ativas as solicitações atendidas ou canceladas', () => {
    expect(estaAtiva(criarSolicitacao({ status: 'ATENDIDA' }))).toBe(false)
    expect(estaAtiva(criarSolicitacao({ status: 'CANCELADA' }))).toBe(false)
  })
})

describe('ehPrioritaria', () => {
  it('considera prioritárias as solicitações urgentes e de emergência', () => {
    expect(ehPrioritaria(criarSolicitacao({ prioridade: 'URGENTE' }))).toBe(true)
    expect(ehPrioritaria(criarSolicitacao({ prioridade: 'EMERGENCIA' }))).toBe(true)
  })

  it('não considera prioritária a solicitação normal', () => {
    expect(ehPrioritaria(criarSolicitacao({ prioridade: 'NORMAL' }))).toBe(false)
  })
})

describe('temEstoqueSuficiente', () => {
  it('é suficiente quando há exatamente a quantidade pedida', () => {
    expect(temEstoqueSuficiente(criarSolicitacao({ quantidade: 4, bolsasCompativeisDisponiveis: 4 }))).toBe(true)
  })

  it('não é suficiente quando faltam bolsas', () => {
    expect(temEstoqueSuficiente(criarSolicitacao({ quantidade: 3, bolsasCompativeisDisponiveis: 2 }))).toBe(false)
  })
})

describe('resumirSolicitacoes', () => {
  it('conta as solicitações de cada card e de cada aba', () => {
    expect(resumirSolicitacoes(solicitacoes)).toEqual({
      pendentes: 3,
      emAtendimento: 1,
      atendidas: 2,
      prioritariasAtivas: 3,
      ativas: 4,
      historico: 3,
    })
  })

  it('não conta como prioritária ativa uma emergência já atendida', () => {
    const resumo = resumirSolicitacoes([
      criarSolicitacao({ prioridade: 'EMERGENCIA', status: 'ATENDIDA' }),
    ])

    expect(resumo.prioritariasAtivas).toBe(0)
  })

  it('devolve tudo zerado quando não há solicitações', () => {
    expect(resumirSolicitacoes([])).toEqual({
      pendentes: 0,
      emAtendimento: 0,
      atendidas: 0,
      prioritariasAtivas: 0,
      ativas: 0,
      historico: 0,
    })
  })
})

describe('filtrarSolicitacoes', () => {
  it('ordena as ativas por prioridade e, na mesma prioridade, das mais antigas para as mais novas', () => {
    expect(ids(filtrarSolicitacoes(solicitacoes, FILTROS_INICIAIS_SOLICITACOES))).toEqual([2, 4, 3, 1])
  })

  it('mostra no histórico as atendidas e canceladas, das mais novas para as mais antigas', () => {
    const filtros = { ...FILTROS_INICIAIS_SOLICITACOES, aba: 'HISTORICO' as const }

    expect(ids(filtrarSolicitacoes(solicitacoes, filtros))).toEqual([6, 5, 7])
  })

  it('filtra pelo status', () => {
    const filtros = { ...FILTROS_INICIAIS_SOLICITACOES, status: 'PENDENTE' as const }

    expect(ids(filtrarSolicitacoes(solicitacoes, filtros))).toEqual([2, 4, 1])
  })

  it('filtra pela prioridade', () => {
    const filtros = { ...FILTROS_INICIAIS_SOLICITACOES, prioridade: 'URGENTE' as const }

    expect(ids(filtrarSolicitacoes(solicitacoes, filtros))).toEqual([4, 3])
  })

  it('combina a aba com o filtro de status', () => {
    const filtros = {
      ...FILTROS_INICIAIS_SOLICITACOES,
      aba: 'HISTORICO' as const,
      status: 'CANCELADA' as const,
    }

    expect(ids(filtrarSolicitacoes(solicitacoes, filtros))).toEqual([6])
  })

  it('devolve lista vazia quando nada corresponde aos filtros', () => {
    const filtros = { ...FILTROS_INICIAIS_SOLICITACOES, prioridade: 'NORMAL' as const, status: 'EM_ATENDIMENTO' as const }

    expect(filtrarSolicitacoes(solicitacoes, filtros)).toEqual([])
  })

  it('não altera a lista original', () => {
    const copia = [...solicitacoes]

    filtrarSolicitacoes(solicitacoes, FILTROS_INICIAIS_SOLICITACOES)

    expect(solicitacoes).toEqual(copia)
  })
})

function criarDadosFormulario(
  dados: Partial<DadosSolicitacaoFormulario> = {},
): DadosSolicitacaoFormulario {
  return {
    instituicao: 'Hospital São Lucas',
    setor: 'UTI adulto',
    tipoSanguineo: 'O-',
    quantidade: '2',
    prioridade: 'URGENTE',
    justificativa: 'Cirurgia de emergência',
    ...dados,
  }
}

describe('validarSolicitacao', () => {
  it('não devolve erros quando os dados estão corretos', () => {
    expect(validarSolicitacao(criarDadosFormulario())).toEqual({})
  })

  it('aceita setor e justificativa em branco', () => {
    expect(validarSolicitacao(criarDadosFormulario({ setor: '', justificativa: '' }))).toEqual({})
  })

  it('exige a instituição, mesmo que só tenha espaços', () => {
    expect(validarSolicitacao(criarDadosFormulario({ instituicao: '   ' })).instituicao).toBe(
      'Informe a instituição solicitante.',
    )
  })

  it('exige o tipo sanguíneo', () => {
    expect(validarSolicitacao(criarDadosFormulario({ tipoSanguineo: '' })).tipoSanguineo).toBe(
      'Selecione o tipo sanguíneo.',
    )
  })

  it.each(['', '0', '-1', '1.5', 'abc'])('recusa a quantidade "%s"', (quantidade) => {
    expect(validarSolicitacao(criarDadosFormulario({ quantidade })).quantidade).toBe(
      'Informe uma quantidade maior que zero.',
    )
  })
})

describe('montarRequisicaoDeSolicitacao', () => {
  it('remove os espaços das pontas e converte a quantidade para número', () => {
    const dados = criarDadosFormulario({
      instituicao: '  Hospital São Lucas ',
      setor: ' UTI adulto ',
      quantidade: ' 3 ',
      justificativa: ' Cirurgia de emergência ',
    })

    expect(montarRequisicaoDeSolicitacao(dados)).toEqual({
      instituicao: 'Hospital São Lucas',
      setor: 'UTI adulto',
      tipoSanguineo: 'O-',
      quantidade: 3,
      prioridade: 'URGENTE',
      justificativa: 'Cirurgia de emergência',
    })
  })
})