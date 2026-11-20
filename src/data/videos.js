// Videos instructivos. Los archivos de /public/videos son clips de muestra:
// reemplázalos por tus videos reales manteniendo (o actualizando) las rutas.
// `sources` guarda una versión por calidad; la estrategia activa elige cuál usar.
// `transcript` sirve como alternativa en texto (accesibilidad y gama baja).
export const videos = [
  {
    id: 'v-cliente-servidor',
    title: 'Cliente y servidor paso a paso',
    duration: '0:06',
    lesson: 'cliente-servidor',
    description: 'Recorrido por lo que ocurre entre que escribes una dirección y ves la página.',
    sources: { '480p': '/videos/muestra-1-480.mp4', '1080p': '/videos/muestra-1-1080.mp4' },
    transcript: [
      'Cuando escribes una dirección en el navegador, lo primero que ocurre es una consulta DNS que convierte el nombre del sitio en una dirección IP.',
      'Con esa dirección, el navegador abre una conexión con el servidor y envía una petición HTTP. El servidor responde con un código de estado y, si todo salió bien, con el documento HTML.',
      'Al leer el HTML, el navegador descubre que necesita más recursos, como hojas de estilo, scripts e imágenes, y hace una petición por cada uno.',
    ],
  },
  {
    id: 'v-html-css-js',
    title: 'HTML, CSS y JavaScript: tres lenguajes, tres tareas',
    duration: '0:06',
    lesson: 'javascript',
    description: 'Qué aporta cada lenguaje y cómo se combinan en una misma página.',
    sources: { '480p': '/videos/muestra-2-480.mp4', '1080p': '/videos/muestra-2-1080.mp4' },
    transcript: [
      'HTML define qué hay en la página: títulos, párrafos, listas y enlaces. Es la estructura y el significado del contenido.',
      'CSS decide cómo se ve: colores, tipografía, espacios y la posición de cada elemento. Sin CSS, la página sigue funcionando, pero con el aspecto por defecto del navegador.',
      'JavaScript agrega comportamiento: reacciona a clics, valida formularios y pide datos al servidor sin recargar la página.',
    ],
  },
  {
    id: 'v-rendimiento',
    title: 'Medir el rendimiento con Lighthouse',
    duration: '0:06',
    lesson: 'rendimiento',
    description: 'Cómo leer un informe de Lighthouse e interpretar LCP, memoria y uso de CPU.',
    sources: { '480p': '/videos/muestra-3-480.mp4', '1080p': '/videos/muestra-3-1080.mp4' },
    transcript: [
      'Lighthouse analiza una página y entrega un informe con métricas de rendimiento. La más visible es el LCP, que indica cuándo aparece el contenido principal.',
      'Para comparar equipos de distinta capacidad, Chrome DevTools permite simular un procesador más lento y una red más lenta antes de ejecutar la medición.',
      'Conviene repetir cada prueba varias veces y comparar medianas, porque una sola medición puede verse afectada por factores externos.',
    ],
  },
]
