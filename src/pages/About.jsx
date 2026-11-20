import { useProgress } from '../context/ProgressContext.jsx'

export default function About() {
  const { reset } = useProgress()

  const onReset = () => {
    if (window.confirm('¿Borrar todo tu progreso en este equipo?')) reset()
  }

  return (
    <div className="page page--read">
      <h1 className="h1">Acerca del proyecto</h1>
      <p className="lead">
        Sistema web autoadaptable para la carga de recursos según las capacidades técnicas del dispositivo: diseño e
        implementación de un prototipo funcional.
      </p>

      <dl className="facts">
        <div><dt>Autores</dt><dd>Armando Molina y Yeinner Ortega</dd></div>
        <div><dt>Institución</dt><dd>Corporación Universitaria Latinoamericana</dd></div>
        <div><dt>Asignatura</dt><dd>Proyecto I</dd></div>
        <div><dt>Docente</dt><dd>Luis Cardozo</dd></div>
      </dl>

      <h2 className="h2">Problema</h2>
      <p>
        Las aplicaciones web cargan los mismos recursos (imágenes, video, animaciones y scripts) sin importar el equipo
        donde se ejecutan. En dispositivos con menos memoria o procesamiento, esto se traduce en tiempos de carga
        mayores y menor capacidad de respuesta.
      </p>

      <h2 className="h2">Objetivo general</h2>
      <p>
        Desarrollar un sistema web autoajustable capaz de identificar las capacidades de procesamiento del dispositivo del
        usuario y adaptar la carga de recursos de la aplicación, para optimizar su rendimiento en equipos con distintas
        características técnicas.
      </p>

      <h2 className="h2">Qué incluye este prototipo</h2>
      <ul className="lesson__list">
        <li>Detección de capacidades del navegador y micro-benchmark, con clasificación en perfil bajo, medio o alto.</li>
        <li>Motor de adaptación que cambia la carga de imágenes, video, animaciones y paginación según el perfil.</li>
        <li>Diagnóstico del dispositivo, con indicación de las APIs no disponibles.</li>
        <li>Comparación de rendimiento con el motor activo y desactivado, a partir de cargas medidas en el navegador.</li>
        <li>Entorno de demostración con material teórico, evaluación y videos.</li>
      </ul>

      <h2 className="h2">Límites</h2>
      <p className="muted">
        No hay backend ni autenticación: el progreso y las mediciones se guardan en este navegador. La clasificación es un
        índice aproximado, no una medición de componentes físicos. Las cifras de rendimiento solo se muestran cuando se han
        medido.
      </p>

      <h2 className="h2">Tu progreso</h2>
      <p className="muted">El avance se guarda solo en este navegador. Puedes borrarlo para empezar de cero.</p>
      <button type="button" className="btn btn--ghost" onClick={onReset}>Borrar mi progreso</button>
    </div>
  )
}
