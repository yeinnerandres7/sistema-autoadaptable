import { useState } from 'react'
import { Link } from '../router.jsx'
import { questions } from '../data/quiz.js'
import { lessons } from '../data/lessons.js'
import { useProgress } from '../context/ProgressContext.jsx'
import { renderInline } from '../utils/text.jsx'
import ProgressBar from '../components/ProgressBar.jsx'

export default function Quiz() {
  const { progress, saveQuiz } = useProgress()
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null) // opción elegida en la pregunta actual
  const [answers, setAnswers] = useState([]) // índice elegido por pregunta
  const [finished, setFinished] = useState(false)

  const total = questions.length
  const q = questions[index]
  const answered = selected !== null

  const start = () => {
    setStarted(true)
    setIndex(0)
    setSelected(null)
    setAnswers([])
    setFinished(false)
  }

  const choose = (i) => {
    if (answered) return
    setSelected(i)
  }

  const next = () => {
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    if (index + 1 < total) {
      setIndex(index + 1)
      setSelected(null)
    } else {
      const score = newAnswers.filter((a, i) => a === questions[i].answer).length
      saveQuiz({ score, total })
      setFinished(true)
    }
  }

  // ---------- Pantalla inicial ----------
  if (!started) {
    return (
      <div className="page page--read">
        <h1 className="h1">Evaluación</h1>
        <p className="lead">
          {total} preguntas de selección múltiple sobre las cuatro lecciones. Después de
          cada respuesta verás si acertaste y por qué.
        </p>
        {progress.quiz && (
          <p className="callout" role="status">
            Tu mejor resultado: <strong>{progress.quiz.best} de {progress.quiz.total}</strong>
            {' '}en {progress.quiz.attempts} {progress.quiz.attempts === 1 ? 'intento' : 'intentos'}.
          </p>
        )}
        <button type="button" className="btn btn--primary" onClick={start}>
          {progress.quiz ? 'Intentar de nuevo' : 'Comenzar evaluación'}
        </button>
      </div>
    )
  }

  // ---------- Resultados ----------
  if (finished) {
    const score = answers.filter((a, i) => a === questions[i].answer).length
    const percent = Math.round((score / total) * 100)
    const failedLessons = [
      ...new Set(questions.filter((qq, i) => answers[i] !== qq.answer).map((qq) => qq.lesson)),
    ].map((id) => lessons.find((l) => l.id === id))

    return (
      <div className="page page--read">
        <h1 className="h1">Resultado</h1>
        <p className="score" role="status">
          <span className="score__num">{score}</span>
          <span className="score__of">de {total} respuestas correctas ({percent}%)</span>
        </p>

        {failedLessons.length > 0 ? (
          <div className="callout">
            <p>Te recomendamos repasar:</p>
            <ul className="lesson__list">
              {failedLessons.map((l) => (
                <li key={l.id}><Link to={`/material/${l.id}`}>{l.title}</Link></li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="callout">Respondiste todo correctamente.</p>
        )}

        <h2 className="h2">Revisión</h2>
        <ol className="review">
          {questions.map((qq, i) => {
            const ok = answers[i] === qq.answer
            return (
              <li key={qq.id} className={`review__item ${ok ? 'is-ok' : 'is-bad'}`}>
                <p className="review__q">{qq.text}</p>
                <p>
                  <span className="tag">{ok ? 'Correcta' : 'Incorrecta'}</span>{' '}
                  Tu respuesta: {qq.options[answers[i]]}
                </p>
                {!ok && <p>Respuesta correcta: {qq.options[qq.answer]}</p>}
                <p className="muted">{renderInline(qq.explanation)}</p>
              </li>
            )
          })}
        </ol>

        <div className="row">
          <button type="button" className="btn btn--primary" onClick={start}>Intentar de nuevo</button>
          <Link to="/material" className="btn btn--ghost">Ir al material</Link>
        </div>
      </div>
    )
  }

  // ---------- Pregunta ----------
  return (
    <div className="page page--read">
      <h1 className="h1">Evaluación</h1>
      <p className="muted" aria-live="polite">Pregunta {index + 1} de {total}</p>
      <ProgressBar value={Math.round((index / total) * 100)} label="Avance de la evaluación" />

      <fieldset className="question">
        <legend className="question__text">{q.text}</legend>
        {q.options.map((opt, i) => {
          const isSel = selected === i
          const isRight = answered && i === q.answer
          const isWrong = answered && isSel && i !== q.answer
          return (
            <label
              key={i}
              className={`option${answered ? ' is-locked' : ''}${isSel ? ' is-selected' : ''}${isRight ? ' is-right' : ''}${isWrong ? ' is-wrong' : ''}`}
            >
              <input
                type="radio"
                name={q.id}
                checked={isSel}
                onChange={() => choose(i)}
              />
              <span>{opt}</span>
              {isRight && <span className="option__flag">Correcta</span>}
              {isWrong && <span className="option__flag">Incorrecta</span>}
            </label>
          )
        })}
      </fieldset>

      {answered && (
        <div className={`feedback ${selected === q.answer ? 'is-ok' : 'is-bad'}`} role="status">
          <strong>{selected === q.answer ? 'Respuesta correcta.' : 'No es esa.'}</strong>{' '}
          {renderInline(q.explanation)}
        </div>
      )}

      <div className="row">
        <button type="button" className="btn btn--primary" onClick={next} disabled={!answered}>
          {index + 1 < total ? 'Siguiente pregunta' : 'Ver resultado'}
        </button>
      </div>
    </div>
  )
}
