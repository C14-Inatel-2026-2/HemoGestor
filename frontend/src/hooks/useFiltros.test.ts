import { act, renderHook } from '@testing-library/react'
import { useFiltros } from './useFiltros'

const FILTROS_INICIAIS = { busca: '', status: '' }

describe('useFiltros', () => {
  it('começa com os filtros iniciais', () => {
    const { result } = renderHook(() => useFiltros(FILTROS_INICIAIS))

    expect(result.current.filtros).toEqual({ busca: '', status: '' })
  })

  it('atualiza só o campo informado e mantém os outros', () => {
    const { result } = renderHook(() => useFiltros(FILTROS_INICIAIS))

    act(() => result.current.atualizarFiltro('busca', 'ana'))
    act(() => result.current.atualizarFiltro('status', 'APTO'))

    expect(result.current.filtros).toEqual({ busca: 'ana', status: 'APTO' })
  })

  it('permite trocar vários campos de uma vez', () => {
    const { result } = renderHook(() => useFiltros(FILTROS_INICIAIS))

    act(() => result.current.atualizarFiltro('busca', 'ana'))
    act(() => result.current.setFiltros((anteriores) => ({ ...anteriores, status: 'APTO' })))

    expect(result.current.filtros).toEqual({ busca: 'ana', status: 'APTO' })
  })
})