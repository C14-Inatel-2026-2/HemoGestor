export function pluralizar(
  quantidade: number,
  singular: string,
  plural: string,
): string {
  return quantidade === 1 ? singular : plural
}

export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}
