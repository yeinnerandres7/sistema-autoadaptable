import { lessons } from '../data/lessons.js'
import { videos } from '../data/videos.js'

// Unidades de avance: cada lección, cada video y la evaluación (1 intento = completada).
export function summarize(progress) {
  const lessonsDone = progress.lessons.filter((id) => lessons.some((l) => l.id === id)).length
  const videosDone = progress.videos.filter((id) => videos.some((v) => v.id === id)).length
  const quizDone = progress.quiz ? 1 : 0
  const total = lessons.length + videos.length + 1
  const done = lessonsDone + videosDone + quizDone
  return {
    lessonsDone,
    videosDone,
    quizDone,
    total,
    done,
    percent: Math.round((done / total) * 100),
  }
}

// Siguiente actividad recomendada para el botón «Continuar».
export function nextActivity(progress) {
  const lesson = lessons.find((l) => !progress.lessons.includes(l.id))
  if (lesson) return { to: `/material/${lesson.id}`, label: `Continuar: ${lesson.title}` }
  if (!progress.quiz) return { to: '/evaluacion', label: 'Resolver la evaluación' }
  const video = videos.find((v) => !progress.videos.includes(v.id))
  if (video) return { to: `/videos/${video.id}`, label: `Ver: ${video.title}` }
  return { to: '/material', label: 'Repasar el material' }
}
