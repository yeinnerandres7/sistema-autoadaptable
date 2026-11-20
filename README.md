# Sistema web autoadaptable

Prototipo de un sistema web que identifica las capacidades del dispositivo desde el que se accede, lo clasifica en un
perfil de rendimiento (bajo, medio o alto) y adapta la carga de sus recursos. El material teórico, la evaluación y los
videos son el entorno donde se demuestra el mecanismo; no son el propósito del proyecto.

Proyecto I · Corporación Universitaria Latinoamericana · Autores: Armando Molina y Yeinner Ortega · Docente: Luis Cardozo.

## Requisitos

- Node.js 18 o superior.
- Para las pruebas de navegador: Google Chrome o Microsoft Edge instalado.

## Ejecutar la aplicación (Visual Studio Code)

```bash
npm install
npm run dev          # desarrollo, normalmente en http://localhost:5173
npm run build        # genera dist/
npm run preview      # sirve dist/ en http://localhost:4173
```

Para las mediciones de rendimiento usa siempre la versión de producción (`npm run build` y `npm run preview`).

## Qué hace el sistema

1. **Detección.** Lee lo que el navegador expone: `navigator.hardwareConcurrency`, `navigator.deviceMemory`, la Network
   Information API, `performance.memory` y la preferencia de movimiento reducido. Lo que no existe se muestra como no
   disponible; nunca se estima.
2. **Micro-benchmark.** Ejecuta una carga de cálculo con dependencias (tres repeticiones, mediana) y devuelve un índice
   relativo en MOPS. No es una medida de GHz ni de un componente físico.
3. **Clasificación.** El perfil es el más bajo entre la clase del benchmark y los topes que imponen los núcleos y la
   memoria, si esos datos existen. Las APIs de hardware solo pueden bajar el perfil.
4. **Adaptación.** Cada perfil define el ancho de las imágenes, la calidad del video (o su sustitución por transcripción),
   las animaciones, la carga diferida y la paginación del material. Todo está en `src/config/profiles.js`.
5. **Medición.** Cada carga puede registrar LCP, tiempo en tareas largas (base del TBT aproximado), tiempo de carga y
   heap de JavaScript. Los registros se guardan en el navegador y se exportan a CSV.

### Modos del motor

| Modo | Qué carga | Uso |
|---|---|---|
| Automático | Perfil detectado en el equipo | Uso normal |
| Simulación manual | Perfil fijado a mano | Observar la adaptación. Se muestra como simulación, no como detección |
| Motor desactivado | Contenido completo en cualquier equipo | Condición de control de la comparación |

## Protocolo de medición

Las cifras de la página **Comparación** provienen solo de cargas medidas en el navegador.

1. Activa «Registrar cada carga de la página» y elige el perfil de prueba.
2. En Chrome DevTools (Performance o Network) aplica el throttling de CPU y de red de la Tabla 2 del documento
   (bajo: 6x y Fast 3G; medio: 4x y Fast 4G; alto: sin limitación). Desactiva la caché.
3. Condición activa: modo «Simulación manual» con el mismo perfil. Condición de control: «Motor desactivado».
4. Recarga la página 10 veces por condición y por perfil.
5. Exporta el CSV y analízalo:

```bash
pip install pandas scipy
python scripts/analisis_estadistico.py mediciones-autoadaptable.csv
```

El análisis usa la prueba de Wilcoxon de rangos con signo (muestras pareadas), con ajuste de Holm. No se usa la prueba
U de Mann-Whitney porque las mediciones están pareadas.

## Pruebas

```bash
npm test                 # 9 pruebas unitarias de clasificación, estrategias y estadística (sin navegador)
npm run build && npm run preview
CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe" npm run test:navegador
CHROME_PATH="..." npm run calibrar   # calibración de umbrales con throttling de CPU
```

Los resultados de la última ejecución están en `evidencia/`. Si cambias el código, vuelve a ejecutar las pruebas.

## Limitaciones conocidas

- **Umbrales calibrados en un único equipo.** Los umbrales de `BENCHMARK_THRESHOLDS_MOPS` salen del throttling de CPU de
  un equipo de referencia (`evidencia/calibracion-throttling.json`). No se han validado en teléfonos ni en computadores
  físicos de gama baja.
- **Memoria.** `deviceMemory` solo existe en Chromium y en contexto seguro, y su valor está redondeado. `performance.memory`
  también es exclusivo de Chromium. Firefox y Safari no reportan estos datos.
- **TTI no se usa.** Lighthouse dejó de incluirlo en su puntaje. Se sustituye por TBT (laboratorio) e INP (campo).
- **Servicio de imágenes externo.** Las imágenes vienen de picsum.photos. Sin conexión, las portadas no se muestran y la
  aplicación sigue funcionando.
- **Sin backend.** El progreso, la configuración y las mediciones se guardan en el navegador (localStorage).

## Estructura

```
src/
  config/profiles.js       perfiles, umbrales y estrategias (fuente única de verdad)
  detection/               capabilities.js, benchmark.js, classify.js, measure.js
  context/                 StrategyContext.jsx (motor y modos), ProgressContext.jsx (avance)
  components/              Layout, ProfileBadge, SmartImage, ProgressBar
  pages/                   Home, Diagnostico, Comparacion, Theory, Lesson, Quiz, Videos, About, NotFound
  data/                    lessons.js, quiz.js, videos.js (contenido del entorno de demostración)
  utils/                   images.js, stats.js, progress.js, text.jsx
  router.jsx               enrutador mínimo por hash (#/ruta)
scripts/                   verificar-clasificacion.mjs, pruebas-navegador.cjs, calibracion-throttling.cjs,
                           analisis_estadistico.py
evidencia/                 calibración, registro de pruebas de navegador y capturas
public/videos/             clips de muestra (480p y 1080p)
```
