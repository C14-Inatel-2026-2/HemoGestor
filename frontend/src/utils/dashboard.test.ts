import { describe, expect, it } from 'vitest'
import {
  LIMITE_ESTOQUE_CRITICO,
  MAXIMO_SOLICITACOES_EM_DESTAQUE,
  alertasDeEstoque,
  alertasDeSolicitacoes,
  contarDoacoesRecentes,
  estoquePorTipo,
  solicitacoesEmDestaque,
} from './dashboard'
import type { Bolsa } from '../types/bolsa'
import type { Doacao } from '../types/doacao'
import type { Solicitacao } from '../types/solicitacao'

const HOJE = '2026-11-05'

function criarBolsa(dados: Partial<Bolsa> = {}): Bolsa {
  return {
    id: 1,
    doacaoId: 1,
    doadorId: 1,
    nomeDoador: 'Ana Souza',
    tipoSanguineo: 'O-',
    tipoDoacao: 'SANGUE_TOTAL',
    volume_ml: 450,
    dataColeta: '2026-10-20',
    dataValidade: '2026-12-01',
    status: 'DISPONIVEL',
    ...dados,
  }
}

function criarDoacao(dados: Partial<Doacao> = {}): Doacao {
  return {
    id: 1,
    doadorId: 1,
    nomeDoador: 'Ana Souza',
    tipoSanguineo: 'O-',
    dataColeta: '2026-11-05',
    horaColeta: '10:30:00',
    volume_ml: 450,
    tipoDoacao: 'SANGUE_TOTAL',
    pressaoArterial: '',
    hemoglobina: 14.2,
    sala: '',
    responsavel: 'Enf. Carla',
    intercorrencia: '',
    status: 'CONCLUIDA',
    ...dados,
  }
}

function criarSolicitacao(dados: Partial<Solicitacao> = {}): Solicitacao {
  return {
    id: 1,
    instituicao: 'Hospital São Lucas',
    setor: 'UTI adulto',
    tipoSanguineo: 'O-',
    quantidade: 2,
    prioridade: 'NORMAL',
    justificativa: '',
    dataSolicitacao: '2026-11-01T08:00:00',
    status: 'PENDENTE',
    bolsasReservadas: [],
    bolsasCompativeisDisponiveis: 4,
    ...dados,
  }
}

function bolsasDoTipo(quantidade: number, dados: Partial<Bolsa> = {}): Bolsa[] {
  return Array.from({ length: quantidade }, (_, indice) => criarBolsa({ id: indice + 1, ...dados }))
}

function quantidadeDoTipo(bolsas: Bolsa[], tipo: string): number | undefined {
  return estoquePorTipo(bolsas, HOJE).find((estoque) => estoque.tipo === tipo)?.quantidade
}

describe('estoquePorTipo', () => {
  it('devolve os oito tipos, mesmo sem bolsas', () => {
    const estoque = estoquePorTipo([], HOJE)

    expect(estoque).toHaveLength(8)
    expect(estoque.every((item) => item.quantidade === 0 && item.critico)).toBe(true)
  })

  it('conta só as bolsas disponíveis e dentro da validade', () => {
    const bolsas = [
      criarBolsa({ id: 1 }),
      criarBolsa({ id: 2, status: 'RESERVADA' }),
      criarBolsa({ id: 3, status: 'UTILIZADA' }),
      criarBolsa({ id: 4, status: 'DESCARTADA' }),
      criarBolsa({ id: 5, dataValidade: '2026-11-04' }),
      criarBolsa({ id: 6, tipoSanguineo: 'A+' }),
    ]

    expect(quantidadeDoTipo(bolsas, 'O-')).toBe(1)
    expect(quantidadeDoTipo(bolsas, 'A+')).toBe(1)
  })

  it('considera crítico o tipo abaixo do limite', () => {
    const bolsas = bolsasDoTipo(LIMITE_ESTOQUE_CRITICO - 1)

    expect(estoquePorTipo(bolsas, HOJE).find((item) => item.tipo === 'O-')?.critico).toBe(true)
  })

  it('não considera crítico o tipo que atinge o limite', () => {
    const bolsas = bolsasDoTipo(LIMITE_ESTOQUE_CRITICO)

    expect(estoquePorTipo(bolsas, HOJE).find((item) => item.tipo === 'O-')?.critico).toBe(false)
  })
})

describe('contarDoacoesRecentes', () => {
  it('conta as doações de hoje e dos seis dias anteriores', () => {
    const doacoes = [
      criarDoacao({ id: 1, dataColeta: '2026-11-05' }),
      criarDoacao({ id: 2, dataColeta: '2026-10-30' }),
    ]

    expect(contarDoacoesRecentes(doacoes, HOJE)).toBe(2)
  })

  it('não conta a doação de sete dias atrás', () => {
    expect(contarDoacoesRecentes([criarDoacao({ dataColeta: '2026-10-29' })], HOJE)).toBe(0)
  })

  it('não conta doação com data futura', () => {
    expect(contarDoacoesRecentes([criarDoacao({ dataColeta: '2026-11-06' })], HOJE)).toBe(0)
  })

  it('não conta doações descartadas, mas conta as que estão em triagem', () => {
    const doacoes = [
      criarDoacao({ id: 1, status: 'DESCARTADA' }),
      criarDoacao({ id: 2, status: 'EM_TRIAGEM' }),
    ]

    expect(contarDoacoesRecentes(doacoes, HOJE)).toBe(1)
  })
})

describe('solicitacoesEmDestaque', () => {
  it('mostra só as ativas, com as mais prioritárias primeiro', () => {
    const solicitacoes = [
      criarSolicitacao({ id: 1 }),
      criarSolicitacao({ id: 2, prioridade: 'EMERGENCIA' }),
      criarSolicitacao({ id: 3, status: 'ATENDIDA' }),
    ]

    expect(solicitacoesEmDestaque(solicitacoes).map((item) => item.id)).toEqual([2, 1])
  })

  it('limita a quantidade de solicitações', () => {
    const solicitacoes = Array.from({ length: 7 }, (_, indice) =>
      criarSolicitacao({ id: indice + 1 }),
    )

    expect(solicitacoesEmDestaque(solicitacoes)).toHaveLength(MAXIMO_SOLICITACOES_EM_DESTAQUE)
  })
})

describe('alertasDeSolicitacoes', () => {
  it('não gera alertas quando só há solicitações normais', () => {
    expect(alertasDeSolicitacoes([criarSolicitacao()])).toEqual([])
  })

  it('avisa sobre uma emergência e informa quem pediu', () => {
    const [alerta] = alertasDeSolicitacoes([
      criarSolicitacao({ prioridade: 'EMERGENCIA', instituicao: 'Santa Casa' }),
    ])

    expect(alerta).toEqual({
      rotulo: 'Emergência',
      nivel: 'CRITICO',
      titulo: '1 solicitação de emergência',
      detalhe: 'Santa Casa · O-',
      destino: '/solicitacoes',
    })
  })

  it('usa o plural e mostra as emergências antes das urgências', () => {
    const alertas = alertasDeSolicitacoes([
      criarSolicitacao({ id: 1, prioridade: 'URGENTE' }),
      criarSolicitacao({ id: 2, prioridade: 'URGENTE' }),
      criarSolicitacao({ id: 3, prioridade: 'EMERGENCIA' }),
      criarSolicitacao({ id: 4, prioridade: 'EMERGENCIA' }),
    ])

    expect(alertas.map((alerta) => alerta.titulo)).toEqual([
      '2 solicitações de emergência',
      '2 solicitações urgentes',
    ])
  })

  it('usa o singular para uma solicitação urgente', () => {
    const [alerta] = alertasDeSolicitacoes([criarSolicitacao({ prioridade: 'URGENTE' })])

    expect(alerta.titulo).toBe('1 solicitação urgente')
  })

  it('ignora as solicitações que não estão ativas', () => {
    const solicitacoes = [
      criarSolicitacao({ prioridade: 'EMERGENCIA', status: 'ATENDIDA' }),
      criarSolicitacao({ prioridade: 'URGENTE', status: 'CANCELADA' }),
    ]

    expect(alertasDeSolicitacoes(solicitacoes)).toEqual([])
  })
})

describe('alertasDeEstoque', () => {
  it('junta os tipos críticos em um único alerta', () => {
    const [alerta] = alertasDeEstoque([], HOJE)

    expect(alerta.titulo).toBe('8 tipos em estoque crítico')
    expect(alerta.detalhe).toBe('A+, A-, B+, B-, AB+, AB-, O+, O-')
    expect(alerta.destino).toBe('/estoque')
  })

  it('usa o singular quando só um tipo está crítico', () => {
    const tipos = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+'] as const
    const bolsas = tipos.flatMap((tipoSanguineo) =>
      bolsasDoTipo(LIMITE_ESTOQUE_CRITICO, { tipoSanguineo }),
    )

    const [alerta] = alertasDeEstoque(bolsas, HOJE)

    expect(alerta.titulo).toBe('1 tipo em estoque crítico')
    expect(alerta.detalhe).toBe('O-')
  })

  it('não gera alerta de estoque crítico quando todos os tipos estão bem', () => {
    const tipos = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
    const bolsas = tipos.flatMap((tipoSanguineo) =>
      bolsasDoTipo(LIMITE_ESTOQUE_CRITICO, { tipoSanguineo }),
    )

    expect(alertasDeEstoque(bolsas, HOJE)).toEqual([])
  })

  it('avisa sobre as bolsas próximas do vencimento', () => {
    const bolsas = [
      criarBolsa({ id: 1, dataValidade: '2026-11-08' }),
      criarBolsa({ id: 2, dataValidade: '2026-11-09' }),
    ]

    const alertas = alertasDeEstoque(bolsas, HOJE)

    expect(alertas[1].titulo).toBe('2 bolsas próximas do vencimento')
    expect(alertas[1].detalhe).toBe('Vencem nos próximos 7 dias')
  })

  it('usa o singular para uma bolsa próxima do vencimento', () => {
    const alertas = alertasDeEstoque([criarBolsa({ dataValidade: '2026-11-08' })], HOJE)

    expect(alertas[1].titulo).toBe('1 bolsa próxima do vencimento')
  })
})