import { Link } from '../router.jsx'

export default function NotFound() {
  return (
    <div className="page page--read">
      <h1 className="h1">No encontramos esta página</h1>
      <p className="lead">La dirección no existe o el contenido cambió de lugar.</p>
      <Link to="/" className="btn btn--primary">Volver al inicio</Link>
    </div>
  )
}
