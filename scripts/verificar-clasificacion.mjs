// Pruebas unitarias de la lógica de clasificación, estrategias y estadística descriptiva.
// Ejecutar con: npm test   (no requiere navegador)
import assert from 'node:assert/strict'
import { classifyByBenchmark, capFromCores, capFromMemory, classifyDevice } from '../src/detection/classify.js'
import { STRATEGIES, PAGE_SIZE_LOW, CONTROL_PROFILE } from '../src/config/profiles.js'
import { imageWidth } from '../src/utils/images.js'
import { median } from '../src/detection/benchmark.js'
import { percentChange, medianOf } from '../src/utils/stats.js'

const tests = []
const test = (name, fn) => tests.push({ name, fn })

test('benchmark: umbrales de clase en los bordes', () => {
  assert.equal(classifyByBenchmark(199.9), 'low')
  assert.equal(classifyByBenchmark(200), 'medium')
  assert.equal(classifyByBenchmark(549.9), 'medium')
  assert.equal(classifyByBenchmark(550), 'high')
})

test('topes por núcleos y memoria', () => {
  assert.equal(capFromCores(2), 'low')
  assert.equal(capFromCores(4), 'medium')
  assert.equal(capFromCores(6), 'high')
  assert.equal(capFromCores(null), null)
  assert.equal(capFromMemory(2), 'low')
  assert.equal(capFromMemory(4), 'medium')
  assert.equal(capFromMemory(8), 'high')
  assert.equal(capFromMemory(null), null)
})

test('clasificación final: las APIs de hardware solo bajan el perfil', () => {
  assert.equal(classifyDevice({ mops: 1200, cores: 8, memoryGB: 8 }).profile, 'high')
  assert.equal(classifyDevice({ mops: 1200, cores: 2, memoryGB: 8 }).profile, 'low')
  assert.equal(classifyDevice({ mops: 1200, cores: 8, memoryGB: 2 }).profile, 'low')
  assert.equal(classifyDevice({ mops: 1200, cores: 4, memoryGB: 8 }).profile, 'medium')
  assert.equal(classifyDevice({ mops: 150, cores: 8, memoryGB: 8 }).profile, 'low')
})

test('sin datos de hardware el benchmark decide; sin ningún dato se usa perfil medio', () => {
  assert.equal(classifyDevice({ mops: 800 }).profile, 'high')
  assert.equal(classifyDevice({ mops: null, cores: null, memoryGB: null }).profile, 'medium')
  const r = classifyDevice({ mops: 800, cores: null, memoryGB: null })
  assert.equal(r.reasons.cores, null)
  assert.equal(r.reasons.memory, null)
})

test('calibración: los perfiles de la Tabla 2 caen en la clase esperada', () => {
  // medianas medidas con throttling de CPU (1x, 4x, 6x) en el equipo de referencia
  assert.equal(classifyByBenchmark(1266), 'high')
  assert.equal(classifyByBenchmark(245), 'medium')
  assert.equal(classifyByBenchmark(166), 'low')
})

test('estrategias: qué se activa en cada perfil', () => {
  assert.equal(STRATEGIES.high.video, '1080p')
  assert.equal(STRATEGIES.medium.video, '480p')
  assert.equal(STRATEGIES.low.video, null)
  assert.equal(STRATEGIES.low.paginate, true)
  assert.equal(STRATEGIES.high.paginate, false)
  assert.equal(STRATEGIES.low.animations, 'none')
  assert.equal(STRATEGIES.high.lazyImages, false)
  assert.equal(STRATEGIES.medium.lazyImages, true)
  assert.equal(CONTROL_PROFILE, 'high')
  assert.equal(PAGE_SIZE_LOW, 4)
})

test('ancho de imagen según la estrategia, con mínimo de 160 px', () => {
  assert.equal(imageWidth(900, 100), 900)
  assert.equal(imageWidth(900, 60), 540)
  assert.equal(imageWidth(900, 30), 270)
  assert.equal(imageWidth(200, 30), 160)
})

test('mediana y variación relativa', () => {
  assert.equal(median([3, 1, 2]), 2)
  assert.equal(median([1, 2, 3, 4]), 2.5)
  assert.equal(percentChange(80, 100), -20)
  assert.equal(percentChange(105, 100), 5)
  assert.equal(percentChange(null, 100), null)
  assert.equal(percentChange(10, 0), null)
})

test('medianOf ignora registros sin valor numérico', () => {
  const runs = [{ lcpMs: 1000 }, { lcpMs: null }, { lcpMs: 2000 }, {}]
  assert.equal(medianOf(runs, 'lcpMs'), 1500)
  assert.equal(medianOf([], 'lcpMs'), null)
})

let failed = 0
for (const t of tests) {
  try {
    t.fn()
    console.log(`  ok   ${t.name}`)
  } catch (err) {
    failed++
    console.log(`  FAIL ${t.name}\n       ${err.message.split('\n')[0]}`)
  }
}
console.log(`\n${tests.length - failed} de ${tests.length} pruebas superadas.`)
process.exit(failed ? 1 : 0)
