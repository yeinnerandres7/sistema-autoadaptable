// Estadística descriptiva mínima para la página de comparación.
// La prueba de significancia (Wilcoxon de muestras pareadas) se calcula fuera de la app:
// ver scripts/analisis_estadistico.py.
import { median } from '../detection/benchmark.js'

export const N_MIN = 10 // repeticiones por condición y perfil definidas en el diseño experimental

export function medianOf(runs, key) {
  const values = runs.map((r) => r[key]).filter((v) => typeof v === 'number')
  return values.length ? Math.round(median(values) * 10) / 10 : null
}

// Variación relativa de `active` frente a `control`, en porcentaje. Negativo = reducción.
export function percentChange(active, control) {
  if (active == null || control == null || control === 0) return null
  return Math.round(((active - control) / control) * 1000) / 10
}
