export function pluralizar(
  quantidade: number,
  singular: string,
  plural: string,
): string {
  return quantidade === 1 ? singular : plural
}