// Servicio de imágenes por parámetros de URL (sección 9.4 del documento).
// El ancho solicitado depende de la estrategia activa (imgQuality, en %).
// Para usar tus propias imágenes, cambia solo esta función.
export function imageWidth(baseWidth, quality = 100) {
  return Math.max(160, Math.round((baseWidth * quality) / 100))
}

export function imageUrl(seed, baseWidth, quality = 100) {
  const width = imageWidth(baseWidth, quality)
  const height = Math.round((width * 9) / 16)
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
}
