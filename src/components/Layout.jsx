import { useEffect, useRef } from 'react'
import { NavLink, usePath } from '../router.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { useStrategy } from '../context/StrategyContext.jsx'
import { summarize } from '../utils/progress.js'
import ProgressBar from './ProgressBar.jsx'
import ProfileBadge from './ProfileBadge.jsx'

const nav = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/diagnostico', label: 'Diagnóstico del dispositivo' },
  { to: '/comparacion', label: 'Comparación de rendimiento' },
  { to: '/material', label: 'Material teórico' },
  { to: '/evaluacion', label: 'Evaluación' },
  { to: '/videos', label: 'Videos' },
  { to: '/acerca', label: 'Acerca del proyecto' },
]

export default function Layout({ children }) {
  const path = usePath()
  const mainRef = useRef(null)
  const { progress } = useProgress()
  const { strategy } = useStrategy()
  const { percent } = summarize(progress)

  // Al cambiar de página, el foco pasa al contenido (teclado y lectores de pantalla).
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true })
  }, [path])

  return (
    <div className="shell">
      <a className="skip" href="#contenido" onClick={(e) => { e.preventDefault(); mainRef.current?.focus() }}>
        Saltar al contenido
      </a>

      <aside className="side">
        <div className="brand">
          <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#f4c430" />
            <path d="M8 22V10l8 5 8-5v12" fill="none" stroke="#12384d" strokeWidth="3" strokeLinejoin="round" />
          </svg>
          <span className="brand__name">Sistema autoadaptable</span>
        </div>

        <ProfileBadge />

        <nav aria-label="Principal" className="nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav__link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        {!strategy.simplifiedUI && (
          <div className="side__progress">
            <div className="side__progress-text">
              <span>Avance en el entorno de demostración</span>
              <strong>{percent}%</strong>
            </div>
            <ProgressBar value={percent} label="Avance en el entorno de demostración" />
          </div>
        )}
      </aside>

      <main id="contenido" className="main" ref={mainRef} tabIndex={-1}>
        {children}
        <footer className="foot">
          Prototipo académico · Corporación Universitaria Latinoamericana
        </footer>
      </main>
    </div>
  )
}
