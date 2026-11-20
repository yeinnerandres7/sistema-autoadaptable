// Router mínimo basado en hash (#/ruta). Evita dependencias extra y funciona
// sin configurar el servidor, útil para el prototipo y para las pruebas.
import { createContext, useContext, useEffect, useState } from 'react'

const RouterContext = createContext('/')

function currentPath() {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  return hash.startsWith('/') ? hash : '/' + hash
}

export function Router({ children }) {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => {
      setPath(currentPath())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return <RouterContext.Provider value={path}>{children}</RouterContext.Provider>
}

export const usePath = () => useContext(RouterContext)

export function navigate(to) {
  window.location.hash = to
}

export function Link({ to, children, ...rest }) {
  return (
    <a href={'#' + to} {...rest}>
      {children}
    </a>
  )
}

export function NavLink({ to, end = false, className = '', children, ...rest }) {
  const path = usePath()
  const active = end ? path === to : path === to || path.startsWith(to + '/')
  return (
    <a
      href={'#' + to}
      className={className + (active ? ' is-active' : '')}
      aria-current={active ? 'page' : undefined}
      {...rest}
    >
      {children}
    </a>
  )
}

// Compara '/material/:id' con '/material/web-1' -> { id: 'web-1' } (o null)
export function matchPath(pattern, path) {
  const a = pattern.split('/').filter(Boolean)
  const b = path.split('/').filter(Boolean)
  if (a.length !== b.length) return null
  const params = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i])
    else if (a[i] !== b[i]) return null
  }
  return params
}
