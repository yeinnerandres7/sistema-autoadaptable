import { Link } from '../router.jsx'
import { lessons } from '../data/lessons.js'
import { useProgress } from '../context/ProgressContext.jsx'
import SmartImage from '../components/SmartImage.jsx'

export default function Theory() {
  const { progress } = useProgress()

  return (
    <div className="page">
      <h1 className="h1">Material teórico</h1>
      <p className="lead">Lee las lecciones en orden o salta a la que necesites.</p>

      <ul className="lessons">
        {lessons.map((l, i) => {
          const done = progress.lessons.includes(l.id)
          return (
            <li key={l.id} className="lesson-card">
              <SmartImage seed={l.cover} width={480} alt="" className="lesson-card__img" eager={i === 0} />
              <div className="lesson-card__body">
                <h2 className="h3">
                  <Link to={`/material/${l.id}`} className="card-link">{l.title}</Link>
                </h2>
                <p>{l.summary}</p>
                <p className="muted">
                  {l.minutes} min de lectura
                  {done && <span className="tag tag--done">Leída</span>}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
