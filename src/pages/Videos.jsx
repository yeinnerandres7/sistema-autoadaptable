import { Link } from '../router.jsx'
import { videos } from '../data/videos.js'
import { useProgress } from '../context/ProgressContext.jsx'
import { useStrategy } from '../context/StrategyContext.jsx'
import NotFound from './NotFound.jsx'

export default function Videos({ id }) {
  const { progress, setVideo } = useProgress()
  const { strategy } = useStrategy()

  const current = id ? videos.find((v) => v.id === id) : videos[0]
  if (!current) return <NotFound />

  const seen = progress.videos.includes(current.id)
  // La estrategia activa decide la calidad; `false` = sin video, solo texto.
  const src = strategy.video ? current.sources[strategy.video] : null

  return (
    <div className="page">
      <h1 className="h1">Videos instructivos</h1>

      <div className="videos">
        <section className="videos__main" aria-labelledby="video-title">
          <h2 id="video-title" className="h2">{current.title}</h2>
          <p className="muted">{current.description}</p>

          {src ? (
            <video
              key={current.id}
              className="player"
              controls
              preload="metadata"
              onEnded={() => setVideo(current.id, true)}
            >
              <source src={src} type="video/mp4" />
              Tu navegador no puede reproducir este video. Lee la transcripción.
            </video>
          ) : (
            <p className="callout">Este video se muestra como texto. Lee la transcripción.</p>
          )}

          <div className="row">
            <button
              type="button"
              className={`btn ${seen ? 'btn--ghost' : 'btn--primary'}`}
              onClick={() => setVideo(current.id, !seen)}
              aria-pressed={seen}
            >
              {seen ? 'Marcado como visto' : 'Marcar como visto'}
            </button>
            <Link to={`/material/${current.lesson}`} className="btn btn--ghost">
              Leer la lección relacionada
            </Link>
          </div>

          <details className="transcript" open={!src}>
            <summary>Transcripción</summary>
            {current.transcript.map((p, i) => <p key={i}>{p}</p>)}
          </details>
        </section>

        <nav className="videos__list" aria-label="Lista de videos">
          <h2 className="h3">Todos los videos</h2>
          <ul>
            {videos.map((v) => {
              const active = v.id === current.id
              return (
                <li key={v.id}>
                  <Link
                    to={`/videos/${v.id}`}
                    className={`vitem${active ? ' is-active' : ''}`}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span className="vitem__title">{v.title}</span>
                    <span className="muted">
                      {v.duration}
                      {progress.videos.includes(v.id) && <span className="tag tag--done">Visto</span>}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
