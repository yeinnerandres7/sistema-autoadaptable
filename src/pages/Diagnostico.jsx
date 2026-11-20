import { useStrategy } from '../context/StrategyContext.jsx'
import { PROFILE_LABEL, PROFILE_ORDER, STRATEGIES, BENCHMARK_THRESHOLDS_MOPS as T, PAGE_SIZE_LOW } from '../config/profiles.js'
import { imageWidth } from '../utils/images.js'

const ANIMATION_LABEL = { full: 'Completas', simple: 'Simplificadas', none: 'Desactivadas' }

function capabilityRows(cap) {
  const row = (label, ok, text) => ({ label, ok, text })
  return [
    row(
      'Contexto seguro (HTTPS o localhost)',
      cap.isSecureContext,
      cap.isSecureContext ? 'Sí' : 'No. Algunas APIs no están disponibles fuera de un contexto seguro.'
    ),
    row(
      'Núcleos lógicos (navigator.hardwareConcurrency)',
      cap.hardwareConcurrency.available,
      cap.hardwareConcurrency.available ? `${cap.hardwareConcurrency.value}` : 'No disponible en este navegador'
    ),
    row(
      'Memoria aproximada (navigator.deviceMemory)',
      cap.deviceMemory.available,
      cap.deviceMemory.available
        ? `${cap.deviceMemory.value} GB, valor redondeado por el navegador`
        : 'No disponible. Solo lo expone Chromium en contexto seguro.'
    ),
    row(
      'Conexión (Network Information API)',
      cap.connection.available,
      cap.connection.available
        ? [
            cap.connection.effectiveType ?? 'tipo no informado',
            cap.connection.downlinkMbps != null ? `${cap.connection.downlinkMbps} Mb/s estimados` : null,
            cap.connection.saveData ? 'ahorro de datos activo' : null,
          ]
            .filter(Boolean)
            .join(', ')
        : 'No disponible. Solo lo expone Chromium.'
    ),
    row(
      'Memoria JavaScript (performance.memory)',
      cap.jsHeap.available,
      cap.jsHeap.available
        ? `${cap.jsHeap.usedMB} MB usados de un límite de ${cap.jsHeap.limitMB} MB`
        : 'No disponible. Es una API no estándar de Chromium.'
    ),
    row('Preferencia de movimiento reducido', true, cap.reducedMotion ? 'Activada en el sistema' : 'No activada'),
    row('Pantalla', true, `${cap.screen.width} × ${cap.screen.height} px, densidad ${cap.screen.dpr}`),
  ]
}

const label = (p) => (p ? PROFILE_LABEL[p] : 'sin dato')

function ProfileHero() {
  const { config, detection, profile, strategy } = useStrategy()
  let text
  if (config.mode === 'off') text = 'El motor está desactivado. Se carga el contenido completo en cualquier equipo.'
  else if (config.mode === 'manual') text = 'Perfil fijado a mano para observar la adaptación. No proviene de la detección de este equipo.'
  else if (detection.status === 'lista') text = 'Clasificación obtenida de la detección del navegador en este equipo.'
  else if (detection.status === 'detectando') text = 'Detectando el equipo. Mientras tanto se usa un perfil provisional.'
  else text = 'Todavía no hay detección para este equipo. Se usa un perfil provisional.'

  return (
    <section className={`hero hero--${profile}`} aria-labelledby="perfil-activo">
      <p className="hero__kicker">Perfil aplicado</p>
      <h2 id="perfil-activo" className="hero__title">{PROFILE_LABEL[profile]}</h2>
      <p>{text}</p>
      <p className="muted">Imágenes al {strategy.imgQuality} % · video {strategy.video ?? 'sustituido por transcripción'} · animaciones {ANIMATION_LABEL[strategy.animations].toLowerCase()}</p>
    </section>
  )
}

function ModeControl() {
  const { config, setConfig, detection, detect } = useStrategy()
  const modes = [
    { v: 'auto', title: 'Automático (recomendado)', text: 'Usa el resultado de la detección real del equipo.' },
    { v: 'manual', title: 'Simulación manual', text: 'Fija un perfil para observar la adaptación. No es una detección.' },
    { v: 'off', title: 'Motor desactivado', text: 'Carga completa en cualquier equipo. Es la condición de control.' },
  ]
  const choose = (mode) => {
    setConfig({ mode })
    if (mode === 'auto' && detection.status === 'pendiente') detect()
  }
  return (
    <fieldset className="modes">
      <legend className="h3">Modo del motor</legend>
      {modes.map((m) => (
        <label key={m.v} className={`mode${config.mode === m.v ? ' is-on' : ''}`}>
          <input type="radio" name="modo" value={m.v} checked={config.mode === m.v} onChange={() => choose(m.v)} />
          <span>
            <strong>{m.title}</strong>
            <span className="muted">{m.text}</span>
          </span>
        </label>
      ))}
      {config.mode === 'manual' && (
        <div className="field">
          <label htmlFor="perfil-simulado">Perfil simulado</label>
          <select
            id="perfil-simulado"
            value={config.simProfile}
            onChange={(e) => setConfig({ simProfile: e.target.value })}
          >
            {PROFILE_ORDER.map((p) => (
              <option key={p} value={p}>{PROFILE_LABEL[p]}</option>
            ))}
          </select>
        </div>
      )}
    </fieldset>
  )
}

function BenchmarkCard() {
  const { detection, detect } = useStrategy()
  const b = detection.benchmark
  const r = detection.reasons
  const busy = detection.status === 'detectando'

  return (
    <section className="panel" aria-labelledby="bench-title">
      <h2 id="bench-title" className="h2">Micro-benchmark y clasificación</h2>
      <p className="muted">
        El benchmark ejecuta un bucle aritmético de 100 ms tres veces y usa la mediana. Su resultado es un índice relativo
        del navegador, no una medida de GHz ni de un componente físico.
      </p>
      <button type="button" className="btn btn--primary" onClick={detect} disabled={busy}>
        {busy ? 'Detectando…' : 'Repetir detección'}
      </button>

      {b ? (
        <dl className="facts facts--wide">
          <div><dt>Mediana del benchmark</dt><dd>{b.mops} MOPS (muestras: {b.samples.join(', ')})</dd></div>
          <div><dt>Clase por benchmark</dt><dd>{label(r.benchmark)} (umbrales provisionales: bajo &lt; {T.lowMax}, medio &lt; {T.mediumMax})</dd></div>
          <div><dt>Tope por núcleos lógicos</dt><dd>{label(r.cores)}</dd></div>
          <div><dt>Tope por memoria</dt><dd>{label(r.memory)}</dd></div>
          <div><dt>Perfil final</dt><dd><strong>{label(detection.profile)}</strong>, el más bajo de los valores anteriores</dd></div>
        </dl>
      ) : (
        <p className="callout">Aún no hay resultados de benchmark en este equipo.</p>
      )}
    </section>
  )
}

export default function Diagnostico() {
  const { detection, profile, config } = useStrategy()
  const rows = detection.capabilities ? capabilityRows(detection.capabilities) : []
  const cols = PROFILE_ORDER.slice().reverse() // alto, medio, bajo

  const resource = (s) => ({
    images: `${imageWidth(900, s.imgQuality)} px (${s.lazyImages ? 'carga diferida' : 'carga inmediata'})`,
    video: s.video ? `Calidad ${s.video}` : 'Sustituido por transcripción',
    animations: ANIMATION_LABEL[s.animations],
    lessons: s.paginate ? `Por páginas de ${PAGE_SIZE_LOW} bloques` : 'Completas',
    ui: s.simplifiedUI ? 'Simplificada (sin panel de avance)' : 'Completa',
  })

  const tableRows = [
    ['Ancho de imágenes (portada base de 900 px)', 'images'],
    ['Video instructivo', 'video'],
    ['Animaciones', 'animations'],
    ['Material teórico', 'lessons'],
    ['Interfaz', 'ui'],
  ]

  const activeLabel = config.mode === 'off' ? 'Carga completa (control)' : PROFILE_LABEL[profile]

  return (
    <div className="page">
      <h1 className="h1">Diagnóstico del dispositivo</h1>
      <p className="lead">
        Muestra lo que el sistema detecta en tu navegador, cómo lo clasifica y qué recursos adapta. Lo que el navegador no
        expone aparece como no disponible; no se estima.
      </p>

      <ProfileHero />

      <section className="panel" aria-labelledby="caps-title">
        <h2 id="caps-title" className="h2">Capacidades detectadas</h2>
        {rows.length ? (
          <ul className="caps">
            {rows.map((r) => (
              <li key={r.label} className={`caps__item${r.ok ? '' : ' is-missing'}`}>
                <span className="caps__label">{r.label}</span>
                <span className="caps__value">{r.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Sin datos todavía. Pulsa «Repetir detección» abajo.</p>
        )}
      </section>

      <BenchmarkCard />
      <ModeControl />

      <section className="panel" aria-labelledby="strat-title">
        <h2 id="strat-title" className="h2">Demostración de la adaptación</h2>
        <p className="muted">
          Compara qué se carga en cada perfil. La columna resaltada es la que se aplica ahora: <strong>{activeLabel}</strong>.
        </p>
        <div className="table-wrap">
          <table className="cmp">
            <thead>
              <tr>
                <th scope="col">Recurso</th>
                {cols.map((p) => (
                  <th scope="col" key={p} className={p === profile && config.mode !== 'off' ? 'is-current' : ''}>
                    {PROFILE_LABEL[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map(([name, key]) => (
                <tr key={key}>
                  <th scope="row">{name}</th>
                  {cols.map((p) => (
                    <td key={p} className={p === profile && config.mode !== 'off' ? 'is-current' : ''}>
                      {resource(STRATEGIES[p])[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">
          Motor desactivado: se usa la columna de carga completa para cualquier equipo. Esta condición es la de control en la
          página de comparación.
        </p>
      </section>
    </div>
  )
}
