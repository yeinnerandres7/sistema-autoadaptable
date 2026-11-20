// Progreso del estudiante guardado en localStorage (no hay backend).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'aulaweb:progreso:v1'
const empty = { lessons: [], videos: [], quiz: null }

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress))
    } catch {
      /* almacenamiento no disponible: el progreso vive solo en memoria */
    }
  }, [progress])

  const toggleIn = (list, id, force) => {
    const has = list.includes(id)
    const want = force ?? !has
    if (want === has) return list
    return want ? [...list, id] : list.filter((x) => x !== id)
  }

  const setLesson = useCallback(
    (id, done) => setProgress((p) => ({ ...p, lessons: toggleIn(p.lessons, id, done) })),
    []
  )
  const setVideo = useCallback(
    (id, done) => setProgress((p) => ({ ...p, videos: toggleIn(p.videos, id, done) })),
    []
  )
  const saveQuiz = useCallback(
    ({ score, total }) =>
      setProgress((p) => {
        const attempts = (p.quiz?.attempts ?? 0) + 1
        const best = Math.max(p.quiz?.best ?? 0, score)
        return { ...p, quiz: { best, total, last: score, attempts } }
      }),
    []
  )
  const reset = useCallback(() => setProgress(empty), [])

  const value = useMemo(
    () => ({ progress, setLesson, setVideo, saveQuiz, reset }),
    [progress, setLesson, setVideo, saveQuiz, reset]
  )
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export const useProgress = () => useContext(ProgressContext)
