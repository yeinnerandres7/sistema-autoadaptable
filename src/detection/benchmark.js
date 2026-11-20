// Micro-benchmark de capacidad de cálculo.
// Carga de trabajo: una cadena de dependencias sobre un arreglo tipado. Cada paso necesita el resultado del anterior,
// así que el motor no puede eliminar el cálculo. El número de pasos se duplica hasta que la medición dure al menos 50 ms.
// Resultado: índice relativo en MOPS (millones de operaciones por segundo del navegador).
// NO es una medida de GHz ni de un componente físico; sirve para comparar equipos entre sí.
const OPS_PER_STEP = 3 // multiplicación, suma y escritura, contadas como operaciones
const MIN_MS = 50
const MAX_STEPS = 1 << 28
const BUF_SIZE = 1024

let sink = 0 // evita que el motor descarte el resultado

function work(steps) {
  const buf = new Float64Array(BUF_SIZE)
  let acc = 1.0
  const t0 = performance.now()
  for (let i = 0; i < steps; i++) {
    const j = i & (BUF_SIZE - 1)
    acc = acc * 0.999999 + buf[j] + 1e-9
    buf[j] = acc
  }
  const ms = performance.now() - t0
  sink += acc + buf[7]
  return ms
}

export function runOnce() {
  let steps = 1 << 16
  let ms = work(steps)
  while (ms < MIN_MS && steps < MAX_STEPS) {
    steps *= 2
    ms = work(steps)
  }
  return (steps * OPS_PER_STEP) / (ms * 1000)
}

export function median(values) {
  const s = [...values].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// Repite la prueba y usa la mediana para reducir el efecto de procesos ajenos.
export function runBenchmark({ runs = 3 } = {}) {
  runOnce() // calentamiento: el motor compila el código; esta pasada se descarta
  const samples = Array.from({ length: runs }, () => runOnce())
  return {
    mops: Math.round(median(samples) * 10) / 10,
    samples: samples.map((s) => Math.round(s * 10) / 10),
    runs,
    minMs: MIN_MS,
  }
}
