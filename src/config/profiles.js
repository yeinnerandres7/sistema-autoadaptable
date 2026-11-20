// Fuente única de verdad del sistema: perfiles, umbrales y estrategias de carga.
// Los valores de referencia de cada perfil coinciden con la Tabla 2 del documento.

export const PROFILE_ORDER = ['low', 'medium', 'high']
export const PROFILE_LABEL = { low: 'Bajo', medium: 'Medio', high: 'Alto' }

// Umbrales del micro-benchmark en MOPS. Calibración (ver evidencia/calibracion-throttling.json):
// se tomó el punto medio geométrico entre las medianas de los perfiles de la Tabla 2 obtenidas con
// throttling de CPU de Chrome en un único equipo de referencia: 1x ≈ 1266, 4x ≈ 245, 6x ≈ 166 MOPS.
// Es una calibración de un solo equipo y no sustituye la validación en dispositivos físicos.
export const BENCHMARK_THRESHOLDS_MOPS = { lowMax: 200, mediumMax: 550 }

// Estrategias de carga. `imgQuality` es el porcentaje del ancho base que se pide al servicio de imágenes.
// El modo "motor desactivado" usa la estrategia `high` para cualquier equipo: es la condición de control.
export const STRATEGIES = {
  high: {
    imgQuality: 100,
    video: '1080p',
    animations: 'full',
    lazyImages: false,
    paginate: false,
    simplifiedUI: false,
  },
  medium: {
    imgQuality: 60,
    video: '480p',
    animations: 'simple',
    lazyImages: true,
    paginate: false,
    simplifiedUI: false,
  },
  low: {
    imgQuality: 30,
    video: null,
    animations: 'none',
    lazyImages: true,
    paginate: true,
    simplifiedUI: true,
  },
}

export const PAGE_SIZE_LOW = 4 // bloques de contenido por página en el perfil bajo
export const CONTROL_PROFILE = 'high'
