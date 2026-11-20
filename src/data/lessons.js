// Material teórico. Cada lección es una lista de bloques:
//  { t: 'h', text }            subtítulo
//  { t: 'p', text }            párrafo (admite `código` y **negrita**)
//  { t: 'list', items }        lista con viñetas
//  { t: 'steps', items }       lista numerada (secuencia real)
//  { t: 'code', lang, text }   bloque de código
//  { t: 'note', text }         recuadro destacado
export const lessons = [
  {
    id: 'cliente-servidor',
    title: '¿Cómo funciona la web?',
    summary: 'El modelo cliente-servidor, las peticiones HTTP y qué ocurre cuando abres una página.',
    minutes: 8,
    cover: 'red-global',
    blocks: [
      { t: 'p', text: 'La web funciona con un modelo **cliente-servidor**. El navegador es el cliente: pide recursos. Un servidor los guarda y responde a cada petición.' },
      { t: 'h', text: 'Qué pasa cuando escribes una dirección' },
      { t: 'steps', items: [
        'El navegador consulta el sistema de nombres de dominio (DNS) para convertir el nombre en una dirección IP.',
        'Abre una conexión con el servidor (con cifrado TLS si la dirección empieza por `https`).',
        'Envía una petición HTTP pidiendo el recurso.',
        'El servidor responde con un código de estado y el contenido, normalmente un documento HTML.',
        'El navegador lee el HTML y pide por separado los demás recursos: estilos, scripts, imágenes y videos.',
      ] },
      { t: 'h', text: 'Una petición HTTP' },
      { t: 'code', lang: 'http', text: 'GET /cursos/fundamentos HTTP/1.1\nHost: ejemplo.edu.co\nAccept: text/html' },
      { t: 'p', text: 'La primera línea indica el método (`GET` pide un recurso), la ruta y la versión del protocolo. Las líneas siguientes son encabezados con información adicional.' },
      { t: 'h', text: 'Códigos de estado más comunes' },
      { t: 'list', items: [
        '`200`: la petición salió bien y el contenido va en la respuesta.',
        '`301`: el recurso cambió de dirección de forma permanente.',
        '`404`: el servidor no encontró el recurso solicitado.',
        '`500`: el servidor tuvo un error interno al procesar la petición.',
      ] },
      { t: 'note', text: 'Cada recurso adicional es otra petición. Una página con muchas imágenes y scripts necesita más tiempo para cargar, sobre todo en conexiones lentas.' },
    ],
  },
  {
    id: 'html-css',
    title: 'HTML y CSS: estructura y estilo',
    summary: 'Cómo se describe el contenido de una página y cómo se le da forma.',
    minutes: 10,
    cover: 'cuaderno-diseno',
    blocks: [
      { t: 'p', text: '**HTML** describe la estructura y el significado del contenido: títulos, párrafos, listas, enlaces. **CSS** define su presentación: colores, tamaños, espacios y posición.' },
      { t: 'h', text: 'Etiquetas semánticas' },
      { t: 'p', text: 'Las etiquetas semánticas indican para qué sirve cada parte de la página. Ayudan a los lectores de pantalla, a los buscadores y a quien mantiene el código.' },
      { t: 'code', lang: 'html', text: '<header>…</header>\n<nav>…</nav>\n<main>\n  <article>\n    <h1>Título de la lección</h1>\n    <p>Contenido…</p>\n  </article>\n</main>\n<footer>…</footer>' },
      { t: 'h', text: 'El modelo de caja' },
      { t: 'p', text: 'Cada elemento es una caja formada por cuatro capas, de adentro hacia afuera: contenido, `padding` (espacio interno), `border` (borde) y `margin` (espacio externo). Con `box-sizing: border-box` el ancho declarado incluye el padding y el borde, lo que facilita calcular tamaños.' },
      { t: 'h', text: 'Diseño adaptable' },
      { t: 'code', lang: 'css', text: '.tarjetas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n\n@media (max-width: 600px) {\n  .tarjetas { flex-direction: column; }\n}' },
      { t: 'note', text: 'Un diseño responsivo adapta la presentación al tamaño de la pantalla. No cambia por sí solo la cantidad de recursos que el dispositivo debe descargar y procesar.' },
    ],
  },
  {
    id: 'javascript',
    title: 'JavaScript en el navegador',
    summary: 'El DOM, los eventos y la asincronía: cómo una página responde al usuario.',
    minutes: 10,
    cover: 'codigo-pantalla',
    blocks: [
      { t: 'p', text: '**JavaScript** añade comportamiento a la página. El navegador representa el documento como un árbol de objetos llamado **DOM**, y JavaScript puede leerlo y modificarlo.' },
      { t: 'h', text: 'Seleccionar elementos y reaccionar a eventos' },
      { t: 'code', lang: 'js', text: "const boton = document.querySelector('#comprobar')\n\nboton.addEventListener('click', () => {\n  boton.textContent = 'Respuesta enviada'\n})" },
      { t: 'h', text: 'Asincronía' },
      { t: 'p', text: 'Pedir datos a un servidor toma tiempo. Con `async` y `await` el código espera la respuesta sin bloquear el resto de la página.' },
      { t: 'code', lang: 'js', text: "async function cargarLecciones() {\n  const respuesta = await fetch('/api/lecciones')\n  if (!respuesta.ok) throw new Error('No se pudo cargar')\n  return respuesta.json()\n}" },
      { t: 'h', text: 'El hilo principal' },
      { t: 'p', text: 'El código JavaScript se ejecuta en el **hilo principal**, el mismo que pinta la pantalla y atiende los clics. Mientras una tarea larga se ejecuta, la página no puede responder.' },
      { t: 'note', text: 'En un equipo potente, una tarea de 50 ms pasa desapercibida. En un equipo lento, la misma tarea puede tardar varias veces más y la página parece congelada.' },
    ],
  },
  {
    id: 'rendimiento',
    title: 'Rendimiento web',
    summary: 'Métricas como LCP, TBT e INP, y las técnicas más usadas para que una página cargue rápido.',
    minutes: 12,
    cover: 'velocimetro',
    blocks: [
      { t: 'p', text: 'El rendimiento web describe qué tan rápido se ve y se puede usar una página. Se mide con métricas objetivas, no con la impresión de quien la prueba.' },
      { t: 'h', text: 'Métricas principales' },
      { t: 'list', items: [
        '**LCP (Largest Contentful Paint):** tiempo hasta que se muestra el elemento de contenido más grande. Google lo considera bueno cuando es de 2,5 segundos o menos.',
        '**TBT (Total Blocking Time):** suma del tiempo en que el hilo principal queda bloqueado por tareas largas. Lighthouse lo usa como medida de laboratorio de la capacidad de respuesta. TTI dejó de formar parte del puntaje de Lighthouse desde la versión 10.',
        '**INP (Interaction to Next Paint):** tiempo entre una interacción real del usuario y el siguiente repintado. Es la métrica de capacidad de respuesta de Core Web Vitals desde marzo de 2024; se mide con usuarios reales, no en laboratorio.',
        '**Memoria y CPU:** tamaño del heap de JavaScript y tiempo de actividad del hilo principal durante la carga.',
      ] },
      { t: 'h', text: 'Técnicas habituales' },
      { t: 'list', items: [
        '**Carga diferida (lazy loading):** no descargar lo que aún no se ve.',
        '**Imágenes ajustadas:** servir el tamaño que el dispositivo necesita y comprimirlas.',
        '**División de código:** enviar primero solo el JavaScript necesario.',
        '**Caché:** reutilizar recursos ya descargados.',
      ] },
      { t: 'code', lang: 'html', text: '<img src="figura.jpg" width="800" height="450"\n     loading="lazy" alt="Diagrama del flujo de una petición">' },
      { t: 'h', text: 'Cómo medir' },
      { t: 'p', text: '**Lighthouse** genera un informe con LCP y otras métricas. El panel **Performance** de Chrome DevTools permite grabar la carga y simular un procesador más lento (throttling) y una red más lenta.' },
      { t: 'note', text: 'Las mismas mediciones pueden variar mucho entre un equipo potente y uno limitado. Por eso las pruebas se repiten varias veces y se simulan distintos perfiles de hardware.' },
    ],
  },
]
