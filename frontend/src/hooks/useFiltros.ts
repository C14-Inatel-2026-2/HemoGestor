import { useState } from 'react'

export function useFiltros<T extends object>(filtrosIniciais: T) {
  const [filtros, setFiltros] = useState<T>(filtrosIniciais)

  function atualizarFiltro<K extends keyof T>(campo: K, valor: T[K]) {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }))
  }

  return { filtros, setFiltros, atualizarFiltro }
}