// Estado del motor de adaptación.
// Modos:
//   auto   -> el perfil sale de la detección real del dispositivo (predeterminado).
//   manual -> simulación: el usuario fija el perfil para ver la adaptación. Siempre se muestra como simulación.
//   off    -> motor desactivado: carga completa para cualquier equipo (condición de control).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { STRATEGIES, CONTROL_PROFILE } from '../config/profiles.js'
import { readCapabilities } from '../detection/capabilities.js'
import { runBenchmark } from '../detection/benchmark.js'
import { classifyDevice } from '../detection/classify.js'
import { startPageMeasurement, appendRun } from '../detection/measure.js'

const CONFIG_KEY = 'autoadaptable:config:v1'
const DETECT_KEY = 'autoadaptable:deteccion:v1'
const DEFAULT_CONFIG = { mode: 'auto', simProfile: 'medium', testProfile: 'medium', measure: false }
const DETECT_DELAY_MS = 800 // la detección se ejecuta después de la carga para no retrasar el primer render

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sin almacenamiento: la configuración vive solo en memoria */
  }
}

const emptyDetection = { status: 'pendiente', profile: null, reasons: null, capabilities: null, benchmark: null, at: null, fromCache: false }

const StrategyContext = createContext(null)

export function StrategyProvider({ children }) {
  const [config, setConfigState] = useState(() => load(CONFIG_KEY, DEFAULT_CONFIG))
  const [detection, setDetection] = useState(() => {
    const cached = load(DETECT_KEY, null)
    return cached ? { ...emptyDetection, ...cached, status: 'lista', fromCache: true } : emptyDetection
  })

  const setConfig = useCallback((patch) => {
    setConfigState((c) => {
      const next = { ...c, ...patch }
      save(CONFIG_KEY, next)
      return next
    })
  }, [])

  // Detección completa: capacidades del navegador + micro-benchmark + clasificación.
  const detect = useCallback(() => {
    setDetection((d) => ({ ...d, status: 'detectando' }))
    try {
      const capabilities = readCapabilities()
      const benchmark = runBenchmark()
      const { profile, reasons } = classifyDevice({
        mops: benchmark.mops,
        cores: capabilities.hardwareConcurrency.available ? capabilities.hardwareConcurrency.value : null,
        memoryGB: capabilities.deviceMemory.available ? capabilities.deviceMemory.value : null,
      })
      const at = new Date().toISOString()
      save(DETECT_KEY, { profile, reasons, capabilities, benchmark, at })
      setDetection({ status: 'lista', profile, reasons, capabilities, benchmark, at, fromCache: false })
    } catch (err) {
      setDetection((d) => ({ ...d, status: 'error', error: String(err) }))
    }
  }, [])

  // Detección automática tras la carga, solo en modo automático.
  const autoRan = useRef(false)
  useEffect(() => {
    if (autoRan.current) return
    autoRan.current = true
    const start = () => {
      if (load(CONFIG_KEY, DEFAULT_CONFIG).mode === 'auto') setTimeout(detect, DETECT_DELAY_MS)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
  }, [detect])

  // Medición real de la carga. La configuración se captura AL INICIAR la carga: así el registro
  // queda etiquetado con las condiciones con las que se cargó la página, aunque el usuario cambie
  // la configuración antes de recargar.
  useEffect(() => {
    const cfgAtStart = load(CONFIG_KEY, DEFAULT_CONFIG)
    const cachedAtStart = load(DETECT_KEY, null)
    const effectiveAtStart =
      cfgAtStart.mode === 'manual'
        ? cfgAtStart.simProfile
        : cfgAtStart.mode === 'off'
          ? CONTROL_PROFILE
          : cachedAtStart?.profile ?? 'medium'

    const meas = startPageMeasurement()
    let done = false
    const complete = () => {
      if (done) return
      done = true
      const metrics = meas.finish()
      if (!cfgAtStart.measure) return
      appendRun({
        ts: new Date().toISOString(),
        condicion: cfgAtStart.mode === 'off' ? 'inactivo' : 'activo',
        modo: cfgAtStart.mode,
        perfilPrueba: cfgAtStart.testProfile,
        perfilEfectivo: effectiveAtStart,
        ...metrics,
      })
    }
    const timer = setTimeout(complete, 5000)
    window.addEventListener('pagehide', complete)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pagehide', complete)
      meas.stop()
    }
  }, [])

  const detectedProfile = detection.profile
  const profile =
    config.mode === 'manual'
      ? config.simProfile
      : config.mode === 'off'
        ? CONTROL_PROFILE
        : detectedProfile ?? 'medium'
  const strategy = STRATEGIES[profile]

  // El CSS reacciona al perfil y al modo (p. ej. apagar animaciones).
  useEffect(() => {
    document.documentElement.dataset.profile = profile
    document.documentElement.dataset.motor = config.mode
  }, [profile, config.mode])

  const value = useMemo(
    () => ({ config, setConfig, detection, detect, profile, strategy, detectedProfile }),
    [config, setConfig, detection, detect, profile, strategy, detectedProfile]
  )
  return <StrategyContext.Provider value={value}>{children}</StrategyContext.Provider>
}

export const useStrategy = () => useContext(StrategyContext)
