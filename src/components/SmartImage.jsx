import { useState } from 'react'
import { useStrategy } from '../context/StrategyContext.jsx'
import { imageUrl } from '../utils/images.js'

// Imagen cuyo ancho solicitado depende de la estrategia activa.
// La carga diferida se aplica solo si la estrategia la activa; si no, la imagen se pide de inmediato.
export default function SmartImage({ seed, width = 800, alt = '', className = '', eager = false }) {
  const { strategy } = useStrategy()
  const [failed, setFailed] = useState(false)
  const height = Math.round((width * 9) / 16)
  const loading = eager || !strategy.lazyImages ? 'eager' : 'lazy'

  return (
    <div className={`smartimg ${className}`} style={{ aspectRatio: '16 / 9' }}>
      {!failed && (
        <img
          src={imageUrl(seed, width, strategy.imgQuality)}
          width={width}
          height={height}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
