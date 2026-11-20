// Lee las capacidades que el navegador expone. Nunca inventa valores:
// si una API no existe, el campo queda con `available: false`.
const MB = 1024 * 1024
const round1 = (n) => Math.round(n * 10) / 10

const field = (value) =>
  typeof value === 'number' ? { available: true, value } : { available: false, value: null }

export function readCapabilities() {
  const nav = typeof navigator !== 'undefined' ? navigator : {}
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection || null
  const heap = typeof performance !== 'undefined' ? performance.memory : undefined
  const reducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  return {
    isSecureContext: typeof window !== 'undefined' && window.isSecureContext === true,
    hardwareConcurrency: field(nav.hardwareConcurrency),
    deviceMemory: field(nav.deviceMemory),
    connection: conn
      ? {
          available: true,
          effectiveType: conn.effectiveType ?? null,
          downlinkMbps: typeof conn.downlink === 'number' ? conn.downlink : null,
          rttMs: typeof conn.rtt === 'number' ? conn.rtt : null,
          saveData: conn.saveData === true,
        }
      : { available: false },
    jsHeap: heap
      ? { available: true, usedMB: round1(heap.usedJSHeapSize / MB), limitMB: round1(heap.jsHeapSizeLimit / MB) }
      : { available: false },
    reducedMotion,
    screen: {
      width: typeof window !== 'undefined' ? window.innerWidth : null,
      height: typeof window !== 'undefined' ? window.innerHeight : null,
      dpr: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    },
  }
}
