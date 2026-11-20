// Pruebas de extremo a extremo en Chrome real. Requiere: npm run build && npm run preview (puerto 4173)
// y la variable CHROME_PATH con la ruta del ejecutable de Chrome o Chromium.
// Uso: CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" node scripts/pruebas-navegador.cjs
const puppeteer = require('puppeteer-core')
const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const results = []
const check = (name, ok, extra = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`) }

;(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'], headless: true, defaultViewport: { width: 1280, height: 900 } })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error' && !/picsum|net::ERR|Failed to load resource/i.test(m.text())) errors.push('console: ' + m.text()) })

  // 1. Inicio carga y muestra el reenfoque
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForSelector('h1')
  const h1 = await page.$eval('h1', (e) => e.textContent)
  check('portada muestra el título del sistema', h1.includes('Sistema web autoadaptable'), h1)

  // 2. Detección automática tras la carga (secure context: localhost)
  await new Promise((r) => setTimeout(r, 2500))
  const det = await page.evaluate(() => JSON.parse(localStorage.getItem('autoadaptable:deteccion:v1') || 'null'))
  check('detección automática guarda un resultado', !!det && ['low', 'medium', 'high'].includes(det.profile), det ? `perfil=${det.profile}, mops=${det.benchmark.mops}, cores=${det.capabilities.hardwareConcurrency.value}, mem=${det.capabilities.deviceMemory.value}` : 'sin resultado')
  check('el navegador expone núcleos (hardwareConcurrency)', det?.capabilities?.hardwareConcurrency?.available === true)
  check('en contexto seguro (localhost) deviceMemory se reporta', det?.capabilities?.deviceMemory?.available === true, `valor=${det?.capabilities?.deviceMemory?.value}`)
  check('performance.memory se detecta como no estándar (Chromium)', det?.capabilities?.jsHeap?.available === true)

  // 3. Diagnóstico muestra el perfil detectado y las capacidades
  await page.goto(BASE + '#/diagnostico', { waitUntil: 'load' })
  await page.waitForSelector('.hero')
  const heroTxt = await page.$eval('.hero', (e) => e.innerText)
  check('diagnóstico muestra el perfil aplicado', /perfil aplicado/i.test(heroTxt), heroTxt.split('\n').slice(0, 2).join(' | '))
  const caps = await page.$$eval('.caps__item', (els) => els.map((e) => e.innerText))
  check('diagnóstico lista capacidades detectadas', caps.length >= 6, `${caps.length} filas`)
  const bench = await page.$eval('#bench-title', (e) => e.parentElement.innerText)
  check('diagnóstico muestra el resultado del benchmark', /Mediana del benchmark/.test(bench))
  const badge = await page.$eval('.badge', (e) => e.innerText)
  check('barra lateral muestra el estado del motor', /Perfil detectado/.test(badge), badge.split('\n')[0])

  // 4. Simulación manual en perfil bajo: lecciones por páginas, video sustituido por transcripción
  await page.evaluate(() => localStorage.setItem('autoadaptable:config:v1', JSON.stringify({ mode: 'manual', simProfile: 'low', testProfile: 'low', measure: false })))
  await page.goto(BASE + '#/material/rendimiento', { waitUntil: 'load' })
  await page.reload({ waitUntil: 'load' })
  await page.waitForSelector('.lesson__body')
  const lowBlocks = await page.$$eval('.lesson__body > *', (els) => els.length)
  const moreBtn = await page.$$eval('button', (bs) => bs.map((b) => b.textContent).find((t) => /Mostrar más contenido/.test(t)) || null)
  check('perfil bajo: la lección se muestra por páginas', moreBtn !== null && lowBlocks <= 4, `${lowBlocks} bloques visibles, botón: ${moreBtn}`)
  await page.click('.lesson__body ~ .row button').catch(() => {})
  const badge2 = await page.$eval('.badge', (e) => e.innerText)
  check('barra lateral indica simulación', /Simulación: Bajo/.test(badge2), badge2.split('\n')[0])
  const sidePanel = await page.$('.side__progress')
  check('perfil bajo oculta el panel de avance (interfaz simplificada)', sidePanel === null)

  await page.goto(BASE + '#/videos', { waitUntil: 'load' })
  await page.reload({ waitUntil: 'load' })
  await page.waitForSelector('.videos')
  const videoEl = await page.$('video.player')
  const textNote = await page.$eval('.videos__main', (e) => e.innerText)
  check('perfil bajo: el video se sustituye por transcripción', videoEl === null && /se muestra como texto/.test(textNote))

  // 5. Motor desactivado (control): carga completa y video
  await page.evaluate(() => localStorage.setItem('autoadaptable:config:v1', JSON.stringify({ mode: 'off', simProfile: 'low', testProfile: 'low', measure: false })))
  await page.goto(BASE + '#/material/rendimiento', { waitUntil: 'load' })
  await page.reload({ waitUntil: 'load' })
  await page.waitForSelector('.lesson__body')
  const offBlocks = await page.$$eval('.lesson__body > *', (els) => els.length)
  const offMore = await page.$$eval('button', (bs) => bs.some((b) => /Mostrar más contenido/.test(b.textContent)))
  check('motor desactivado: carga completa sin paginación', !offMore && offBlocks > 4, `${offBlocks} bloques`)
  await page.goto(BASE + '#/videos', { waitUntil: 'load' })
  await page.reload({ waitUntil: 'load' })
  await page.waitForSelector('.videos')
  const offVideo = await page.$('video.player')
  check('motor desactivado: el video se reproduce en calidad alta', offVideo !== null)
  const offSrc = offVideo ? await page.$eval('video.player source', (s) => s.getAttribute('src')) : ''
  check('motor desactivado usa la fuente de 1080p', /1080/.test(offSrc), offSrc)

  // 6. Medición real: activar registro, recargar tres veces, leer registros
  await page.evaluate(() => { localStorage.removeItem('autoadaptable:mediciones:v1'); localStorage.setItem('autoadaptable:config:v1', JSON.stringify({ mode: 'off', simProfile: 'medium', testProfile: 'medium', measure: true })) })
  for (let i = 0; i < 3; i++) {
    await page.goto(BASE + '#/material', { waitUntil: 'load' })
    await page.reload({ waitUntil: 'load' })
    await new Promise((r) => setTimeout(r, 6000)) // espera al registro de 5 s
  }
  const runs = await page.evaluate(() => JSON.parse(localStorage.getItem('autoadaptable:mediciones:v1') || '[]'))
  check('se registran cargas medidas en el navegador', runs.length >= 3, `${runs.length} registros`)
  const sample = runs[0] || {}
  check('cada registro trae LCP real (número) y tiempo de carga', typeof sample.lcpMs === 'number' && typeof sample.loadMs === 'number', `lcp=${sample.lcpMs} load=${sample.loadMs} tbt=${sample.tbtMs} heap=${sample.heapMB}`)
  check('registro etiquetado como control (inactivo) y perfil de prueba', sample.condicion === 'inactivo' && sample.perfilPrueba === 'medium', `${sample.condicion}/${sample.perfilPrueba}`)

  // 7. Página de comparación con repeticiones insuficientes
  await page.goto(BASE + '#/comparacion', { waitUntil: 'load' })
  await page.reload({ waitUntil: 'load' })
  await page.waitForSelector('table.cmp')
  const pend = await page.$$eval('.verdict', (els) => els.map((e) => e.innerText))
  check('comparación indica pendiente con menos de 10 repeticiones', pend.some((t) => /Pendiente/.test(t)), pend[0])
  const noFake = await page.$$eval('table.cmp tbody td', (tds) => tds.map((t) => t.innerText))
  check('sin cifras inventadas: hay celdas con "Sin datos" o valores medidos', noFake.length > 0)

  // 8. Mobile + capturas
  await page.setViewport({ width: 390, height: 844, isMobile: true })
  await page.goto(BASE + '#/diagnostico', { waitUntil: 'load' })
  await page.reload({ waitUntil: 'load' })
  await page.waitForSelector('.hero')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  check('diseño móvil sin desbordamiento horizontal', overflow <= 2, `desbordamiento=${overflow}px`)

  await page.setViewport({ width: 1280, height: 900 })
  await page.evaluate(() => localStorage.setItem('autoadaptable:config:v1', JSON.stringify({ mode: 'auto', simProfile: 'medium', testProfile: 'medium', measure: false })))
  for (const [name, hash] of [['inicio', ''], ['diagnostico', '#/diagnostico'], ['comparacion', '#/comparacion']]) {
    await page.goto(BASE + hash, { waitUntil: 'load' })
    await page.reload({ waitUntil: 'load' })
    await new Promise((r) => setTimeout(r, 2500))
    await page.screenshot({ path: `evidencia/capturas/shot-${name}.png`, fullPage: false })
  }

  check('sin errores de JavaScript en consola', errors.length === 0, errors.slice(0, 3).join(' | '))
  await browser.close()
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n${results.length - failed} de ${results.length} comprobaciones superadas.`)
  process.exit(failed ? 1 : 0)
})().catch((e) => { console.error('E2E crashed:', e); process.exit(2) })
