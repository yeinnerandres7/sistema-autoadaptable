import { usePath, matchPath } from './router.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Diagnostico from './pages/Diagnostico.jsx'
import Comparacion from './pages/Comparacion.jsx'
import Theory from './pages/Theory.jsx'
import Lesson from './pages/Lesson.jsx'
import Quiz from './pages/Quiz.jsx'
import Videos from './pages/Videos.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  const path = usePath()
  let page

  const lesson = matchPath('/material/:id', path)
  const video = matchPath('/videos/:id', path)

  if (path === '/') page = <Home />
  else if (path === '/diagnostico') page = <Diagnostico />
  else if (path === '/comparacion') page = <Comparacion />
  else if (path === '/material') page = <Theory />
  else if (lesson) page = <Lesson key={lesson.id} id={lesson.id} />
  else if (path === '/evaluacion') page = <Quiz />
  else if (path === '/videos') page = <Videos />
  else if (video) page = <Videos key={video.id} id={video.id} />
  else if (path === '/acerca') page = <About />
  else page = <NotFound />

  return <Layout>{page}</Layout>
}
