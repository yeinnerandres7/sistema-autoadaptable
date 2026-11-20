// Medición real de cada carga de página con APIs del navegador.
// LCP: PerformanceObserver (largest-contentful-paint).
// Bloqueo del hilo principal: tareas largas (longtask). TBT aproximado = suma de (duración − 50 ms).
// Heap JS: performance.memory (solo Chromium, valor no estándar).
const KEY = 'autoadaptable:mediciones:v1'
const MAX_RUNS = 500
const MB = 1024 * 1024
const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

export function readRuns() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function appendRun(run) {
  try {
    const all = readRuns()
    all.push(run)
    localStorage.setItem(KEY, JSON.stringify(all.slice(-MAX_RUNS)))
  } catch {
    /* almacenamiento no disponible: la medición se descarta */
  }
}

export function clearRuns() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* sin acción */
  }
}

// Empieza a observar la carga actual. Devuelve { finish, stop }:
// finish() entrega las métricas observadas hasta ese momento; stop() desconecta sin entregar nada.
export function startPageMeasurement() {
  const state = { lcp: null, longTaskMs: 0, tbtMs: 0 }
  const observers = []

  try {
    const lcpObs = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      state.lcp = entries[entries.length - 1].startTime
    })
    lcpObs.observe({ type: 'largest-contentful-paint', buffered: true })
    observers.push(lcpObs)
  } catch {
    /* el navegador no soporta LCP */
  }

  try {
    const ltObs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        state.longTaskMs += e.duration
        state.tbtMs += Math.max(0, e.duration - 50)
      }
    })
    ltObs.observe({ type: 'longtask', buffered: true })
    observers.push(ltObs)
  } catch {
    /* el navegador no soporta Long Tasks */
  }

  const disconnect = () => observers.forEach((o) => o.disconnect())

  return {
    stop: disconnect,
    finish() {
      disconnect()
      const nav = performance.getEntriesByType('navigation')[0]
      const heap = performance.memory
      return {
        lcpMs: round1(state.lcp),
        tbtMs: round1(state.tbtMs),
        longTaskMs: round1(state.longTaskMs),
        loadMs: nav ? round1(nav.loadEventEnd) : null,
        heapMB: heap ? round1(heap.usedJSHeapSize / MB) : null,
      }
    },
  }
}
