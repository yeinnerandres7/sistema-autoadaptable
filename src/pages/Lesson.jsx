import { useState } from 'react'
import { Link } from '../router.jsx'
import { lessons } from '../data/lessons.js'
import { useProgress } from '../context/ProgressContext.jsx'
import { useStrategy } from '../context/StrategyContext.jsx'
import { renderInline } from '../utils/text.jsx'
import { PAGE_SIZE_LOW } from '../config/profiles.js'
import SmartImage from '../components/SmartImage.jsx'
import NotFound from './NotFound.jsx'

function Block({ b }) {
  switch (b.t) {
    case 'h':
      return <h2 className="h2 lesson__h">{b.text}</h2>
    case 'p':
      return <p>{renderInline(b.text)}</p>
    case 'list':
      return (
        <ul className="lesson__list">
          {b.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}
        </ul>
      )
    case 'steps':
      return (
        <ol className="lesson__steps">
          {b.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}
        </ol>
      )
    case 'code':
      return (
        <figure className="code">
          <figcaption>{b.lang}</figcaption>
          <pre tabIndex={0}><code>{b.text}</code></pre>
        </figure>
      )
    case 'note':
      return <aside className="note"><p>{renderInline(b.text)}</p></aside>
    default:
      return null
  }
}

export default function Lesson({ id }) {
  const { progress, setLesson } = useProgress()
  const { strategy } = useStrategy()
  const [pages, setPages] = useState(1)

  const index = lessons.findIndex((l) => l.id === id)
  if (index === -1) return <NotFound />

  const lesson = lessons[index]
  const prev = lessons[index - 1]
  const next = lessons[index + 1]
  const done = progress.lessons.includes(lesson.id)
  const headings = lesson.blocks.filter((b) => b.t === 'h')

  // Perfil bajo: el contenido se entrega por páginas de bloques para reducir el trabajo inicial del navegador.
  const total = lesson.blocks.length
  const visibleCount = strategy.paginate ? Math.min(total, pages * PAGE_SIZE_LOW) : total
  const visible = lesson.blocks.slice(0, visibleCount)
  const remaining = total - visibleCount

  return (
    <article className="page page--read">
      <p className="crumbs">
        <Link to="/material">Material teórico</Link>
        <span aria-hidden="true"> / </span>
        <span>Lección {index + 1} de {lessons.length}</span>
      </p>
      <h1 className="h1">{lesson.title}</h1>
      <p className="lead">{lesson.summary}</p>

      <SmartImage seed={lesson.cover} width={900} alt="" className="lesson__cover" eager />

      {headings.length > 1 && (
        <nav className="toc" aria-label="En esta lección">
          <p className="toc__title">En esta lección</p>
          <ul>
            {headings.map((h) => <li key={h.text}>{h.text}</li>)}
          </ul>
        </nav>
      )}

      <div className="lesson__body">
        {visible.map((b, i) => <Block key={i} b={b} />)}
      </div>

      {remaining > 0 && (
        <div className="row">
          <button type="button" className="btn btn--ghost" onClick={() => setPages(pages + 1)}>
            Mostrar más contenido (quedan {remaining} bloques)
          </button>
        </div>
      )}

      <div className="lesson__done">
        <button
          type="button"
          className={`btn ${done ? 'btn--ghost' : 'btn--primary'}`}
          onClick={() => setLesson(lesson.id, !done)}
          aria-pressed={done}
        >
          {done ? 'Marcada como leída' : 'Marcar como leída'}
        </button>
      </div>

      <nav className="pager" aria-label="Navegación entre lecciones">
        {prev ? (
          <Link to={`/material/${prev.id}`} className="pager__link">
            <span className="muted">Anterior</span>
            <strong>{prev.title}</strong>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={`/material/${next.id}`} className="pager__link pager__link--next">
            <span className="muted">Siguiente</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <Link to="/evaluacion" className="pager__link pager__link--next">
            <span className="muted">Siguiente</span>
            <strong>Resolver la evaluación</strong>
          </Link>
        )}
      </nav>
    </article>
  )
}
