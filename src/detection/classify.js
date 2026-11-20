// Clasificación del dispositivo. Regla:
//   perfil final = el más bajo entre (a) la clase del micro-benchmark y
//                  (b) los topes que imponen núcleos y memoria, si existen.
// Las APIs de hardware solo pueden BAJAR el perfil, nunca subirlo.
import { BENCHMARK_THRESHOLDS_MOPS as T, PROFILE_ORDER } from '../config/profiles.js'

const rank = (p) => PROFILE_ORDER.indexOf(p)
const lower = (a, b) => (rank(a) <= rank(b) ? a : b)

export function classifyByBenchmark(mops) {
  if (mops < T.lowMax) return 'low'
  if (mops < T.mediumMax) return 'medium'
  return 'high'
}

export function capFromCores(cores) {
  if (cores == null) return null
  if (cores <= 2) return 'low'
  if (cores <= 5) return 'medium'
  return 'high'
}

export function capFromMemory(gb) {
  if (gb == null) return null
  if (gb <= 2) return 'low'
  if (gb <= 4) return 'medium'
  return 'high'
}

export function classifyDevice({ mops = null, cores = null, memoryGB = null }) {
  const benchmark = mops == null ? null : classifyByBenchmark(mops)
  const cores_ = capFromCores(cores)
  const memory_ = capFromMemory(memoryGB)
  const parts = [benchmark, cores_, memory_].filter(Boolean)
  // Sin ningún dato disponible se usa el perfil medio como valor neutral, sin suponer hardware.
  const profile = parts.length ? parts.reduce(lower) : 'medium'
  return { profile, reasons: { benchmark, cores: cores_, memory: memory_ } }
}
