import { PROFILE_LABEL } from '../config/profiles.js'
import { useStrategy } from '../context/StrategyContext.jsx'

// Indicador visible del estado del motor. Distingue detección real, simulación y control.
export default function ProfileBadge() {
  const { config, detection, profile } = useStrategy()

  let title
  let detail
  if (config.mode === 'off') {
    title = 'Motor desactivado'
    detail = 'Carga completa (control)'
  } else if (config.mode === 'manual') {
    title = `Simulación: ${PROFILE_LABEL[profile]}`
    detail = 'Perfil fijado a mano'
  } else if (detection.status === 'lista') {
    title = `Perfil detectado: ${PROFILE_LABEL[profile]}`
    detail = detection.fromCache ? 'Último resultado guardado' : 'Detección automática'
  } else if (detection.status === 'detectando') {
    title = 'Detectando dispositivo…'
    detail = `Perfil provisional: ${PROFILE_LABEL[profile]}`
  } else {
    title = `Perfil provisional: ${PROFILE_LABEL[profile]}`
    detail = 'Pendiente de detección'
  }

  return (
    <div className={`badge badge--${config.mode}`} role="status" aria-live="polite">
      <span className="badge__dot" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <span className="badge__detail">{detail}</span>
      </div>
    </div>
  )
}
