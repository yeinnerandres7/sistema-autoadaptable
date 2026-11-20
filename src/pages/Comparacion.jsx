import { useState } from 'react'
import { useStrategy } from '../context/StrategyContext.jsx'
import { PROFILE_LABEL, PROFILE_ORDER } from '../config/profiles.js'
import { readRuns, clearRuns } from '../detection/measure.js'
import { medianOf, percentChange, N_MIN } from '../utils/stats.js'

const METRICS = [
  { key: 'lcpMs', label: 'LCP (ms)' },
  { key: 'tbtMs', label: 'Bloqueo del hilo principal, TBT aproximado (ms)' },
  { key: 'longTaskMs', label: 'Tiempo en tareas largas (ms)' },
  { key: 'heapMB', label: 'Heap de JavaScript (MB)' },
]

const fmt = (v) => (v == null ? 'Sin datos' : String(v))
const pct = (v) => (v == null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(1)} %`)

// Criterio del documento: para bajo y medio, LCP y TBT deben bajar al menos 20 % y memoria y CPU no subir.
// Para alto, el motor no debe degradar: variación menor a 5 %.
function evaluate(profile, active, control) {
  const nA = active.length
  const nC = control.length
  if (nA < N_MIN || nC < N_MIN) {
    return { status: 'pendiente', text: `Pendiente: ${Math.min(nA, nC)} de ${N_MIN} repeticiones por condición.` }
  }
  const d = (k) => percentChange(medianOf(active, k), medianOf(control, k))
  const lcp = d('lcpMs')
  const tbt = d('tbtMs')
  const heap = d('heapMB')
  const cpu = d('longTaskMs')

  if (profile === 'high') {
    const ok = [lcp, tbt].every((v) => v !== null && Math.abs(v) < 5)
    return {
      status: ok ? 'cumple' : 'no-cumple',
      text: ok ? 'Sin degradación: la variación de LCP y TBT es menor al 5 %.' : 'Criterio no cumplido: la variación de LCP o TBT es de 5 % o más.',
    }
  }
  const improved = [lcp, tbt].every((v) => v !== null && v <= -20)
  const noIncrease = [heap, cpu].every((v) => v !== null && v <= 0)
  const ok = improved && noIncrease
  return {
    status: ok ? 'cumple' : 'no-cumple',
    text: ok
      ? 'Cumple el criterio descriptivo. La significancia estadística se verifica aparte (ver el análisis en scripts/).'
      : 'No cumple el criterio: se requiere reducción de al menos 20 % en LCP y TBT, sin aumento de memoria ni CPU.',
  }
}

function toCsv(runs) {
  const header = ['timestamp', 'condicion', 'modo', 'perfil_prueba', 'perfil_efectivo', 'lcp_ms', 'tbt_ms', 'tareas_largas_ms', 'load_ms', 'heap_mb', 'repeticion']
  const seq = {}
  const rows = [...runs]
    .sort((a, b) => a.ts.localeCompare(b.ts))
    .map((r) => {
      const k = `${r.condicion}|${r.perfilPrueba}`
      seq[k] = (seq[k] ?? 0) + 1
      return [r.ts, r.condicion, r.modo, r.perfilPrueba, r.perfilEfectivo, r.lcpMs, r.tbtMs, r.longTaskMs, r.loadMs, r.heapMB, seq[k]]
        .map((v) => (v == null ? '' : v))
        .join(',')
    })
  return [header.join(','), ...rows].join('\n')
}

function ProfileTable({ profile, active, control }) {
  const verdict = evaluate(profile, active, control)
  return (
    <section className="panel" aria-labelledby={`t-${profile}`}>
      <h2 id={`t-${profile}`} className="h2">Perfil de prueba: {PROFILE_LABEL[profile]}</h2>
      <p className="muted">Repeticiones registradas: motor activo {active.length}, motor desactivado {control.length}.</p>
      <div className="table-wrap">
        <table className="cmp">
          <thead>
            <tr>
              <th scope="col">Métrica (mediana)</th>
              <th scope="col">Motor activo</th>
              <th scope="col">Motor desactivado</th>
              <th scope="col">Variación</th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => {
              const a = medianOf(active, m.key)
              const c = medianOf(control, m.key)
              return (
                <tr key={m.key}>
                  <th scope="row">{m.label}</th>
                  <td>{fmt(a)}</td>
                  <td>{fmt(c)}</td>
                  <td>{pct(percentChange(a, c))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className={`verdict verdict--${verdict.status}`} role="status">{verdict.text}</p>
    </section>
  )
}

export default function Comparacion() {
  const { config, setConfig } = useStrategy()
  const [runs, setRuns] = useState(readRuns)

  const group = (p, cond) => runs.filter((r) => r.perfilPrueba === p && r.condicion === cond)

  const exportCsv = () => {
    const blob = new Blob([toCsv(runs)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mediciones-autoadaptable.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const clear = () => {
    if (window.confirm('¿Borrar todas las mediciones registradas en este navegador?')) {
      clearRuns()
      setRuns([])
    }
  }

  return (
    <div className="page">
      <h1 className="h1">Comparación de rendimiento</h1>
      <p className="lead">
        Compara la carga con el motor activo y desactivado. Solo aparecen cifras de cargas medidas en este navegador. Si
        todavía no hay repeticiones suficientes, la tabla lo indica.
      </p>

      <section className="panel" aria-labelledby="proto-title">
        <h2 id="proto-title" className="h2">Protocolo de medición</h2>
        <ol className="lesson__steps">
          <li>Activa el registro de cargas y elige el perfil de prueba que vas a aplicar.</li>
          <li>En Chrome DevTools, pestaña Performance o Network, aplica el mismo throttling de CPU y de red de la Tabla 2 del documento. Desactiva la caché.</li>
          <li>Condición activa: en Diagnóstico, usa «Simulación manual» con el mismo perfil. Condición de control: usa «Motor desactivado».</li>
          <li>Recarga la página {N_MIN} veces por condición y por perfil. Cada recarga queda registrada automáticamente.</li>
        </ol>
        <label className="check">
          <input type="checkbox" checked={config.measure} onChange={(e) => setConfig({ measure: e.target.checked })} />
          Registrar cada carga de la página
        </label>
        <div className="field">
          <label htmlFor="perfil-prueba">Perfil de prueba que estás aplicando</label>
          <select id="perfil-prueba" value={config.testProfile} onChange={(e) => setConfig({ testProfile: e.target.value })}>
            {PROFILE_ORDER.map((p) => (
              <option key={p} value={p}>{PROFILE_LABEL[p]}</option>
            ))}
          </select>
        </div>
        <div className="row">
          <span className="muted" role="status">Registros guardados: {runs.length}</span>
          <button type="button" className="btn btn--ghost" onClick={() => setRuns(readRuns())}>Actualizar</button>
          <button type="button" className="btn btn--ghost" onClick={exportCsv} disabled={!runs.length}>Exportar CSV</button>
          <button type="button" className="btn btn--ghost" onClick={clear} disabled={!runs.length}>Borrar mediciones</button>
        </div>
      </section>

      {PROFILE_ORDER.map((p) => (
        <ProfileTable key={p} profile={p} active={group(p, 'activo')} control={group(p, 'inactivo')} />
      ))}

      <p className="muted">
        La prueba de significancia (Wilcoxon de muestras pareadas) no se calcula en el navegador. Se ejecuta sobre el CSV
        exportado con <code>scripts/analisis_estadistico.py</code>.
      </p>
    </div>
  )
}
