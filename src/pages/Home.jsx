import { Link } from '../router.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { useStrategy } from '../context/StrategyContext.jsx'
import { lessons } from '../data/lessons.js'
import { videos } from '../data/videos.js'
import { questions } from '../data/quiz.js'
import { summarize, nextActivity } from '../utils/progress.js'
import ProgressBar from '../components/ProgressBar.jsx'
import { PROFILE_LABEL } from '../config/profiles.js'

export default function Home() {
  const { progress } = useProgress()
  const { profile, config } = useStrategy()
  const s = summarize(progress)
  const next = nextActivity(progress)
  const started = s.done > 0

  const modules = [
    {
      to: '/material',
      title: 'Material teórico',
      text: 'Cuatro lecciones con texto, ejemplos de código e imágenes.',
      value: Math.round((s.lessonsDone / lessons.length) * 100),
      status: `${s.lessonsDone} de ${lessons.length} lecciones leídas`,
    },
    {
      to: '/evaluacion',
      title: 'Evaluación',
      text: `Quiz de ${questions.length} preguntas con explicación de cada respuesta.`,
      value: progress.quiz ? Math.round((progress.quiz.best / progress.quiz.total) * 100) : 0,
      status: progress.quiz ? `Mejor resultado: ${progress.quiz.best} de ${progress.quiz.total}` : 'Aún sin intentos',
    },
    {
      to: '/videos',
      title: 'Videos instructivos',
      text: 'Tres videos cortos con transcripción en texto.',
      value: Math.round((s.videosDone / videos.length) * 100),
      status: `${s.videosDone} de ${videos.length} videos vistos`,
    },
  ]

  return (
    <div className="page">
      <header className="home-head">
        <p className="kicker">Prototipo de ingeniería de software</p>
        <h1 className="display">Sistema web autoadaptable</h1>
        <p className="lead">
          La aplicación identifica las capacidades del dispositivo desde el que se accede, lo clasifica en un perfil de
          rendimiento y ajusta la carga de sus recursos. El material teórico, la evaluación y los videos son el entorno
          donde se demuestra ese mecanismo.
        </p>
        <div className="home-head__actions">
          <Link to="/diagnostico" className="btn btn--primary">Ver el diagnóstico de mi dispositivo</Link>
          <Link to="/comparacion" className="btn btn--ghost">Comparar el rendimiento</Link>
        </div>
        <p className="muted" role="status">
          Perfil actual: <strong>{PROFILE_LABEL[profile]}</strong>
          {config.mode === 'off' && ' (motor desactivado, carga completa)'}
          {config.mode === 'manual' && ' (simulación manual)'}
        </p>
      </header>

      <section aria-labelledby="como" className="how">
        <h2 id="como" className="h2">Cómo funciona</h2>
        <ol className="how__steps">
          <li><strong>Detecta.</strong> Lee las capacidades que el navegador expone y ejecuta un micro-benchmark.</li>
          <li><strong>Clasifica.</strong> Asigna un perfil bajo, medio o alto. Las APIs de hardware solo pueden bajar el perfil.</li>
          <li><strong>Adapta.</strong> Cambia el tamaño de las imágenes, la calidad del video, las animaciones y la paginación.</li>
          <li><strong>Mide.</strong> Registra LCP, bloqueo del hilo principal y memoria con y sin el motor, para comparar.</li>
        </ol>
      </section>

      {!started && (
        <p className="callout">
          Empieza por el <Link to="/diagnostico">diagnóstico</Link> para ver qué detecta el sistema en tu equipo.
        </p>
      )}

      <section aria-labelledby="ruta">
        <h2 id="ruta" className="h2">Entorno de demostración</h2>
        <ol className="route">
          {modules.map((m) => {
            const state = m.value >= 100 ? 'done' : m.value > 0 ? 'part' : 'none'
            return (
              <li key={m.to} className={`route__item route__item--${state}`}>
                <span className="route__dot" aria-hidden="true" />
                <div className="route__body">
                  <h3 className="h3">
                    <Link to={m.to} className="route__link">{m.title}</Link>
                  </h3>
                  <p>{m.text}</p>
                  <div className="route__meta">
                    <span className="muted">{m.status}</span>
                    <ProgressBar value={m.value} label={`Avance en ${m.title}`} />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
        <p className="muted">Siguiente actividad sugerida: <Link to={next.to}>{next.label}</Link></p>
      </section>
    </div>
  )
}
