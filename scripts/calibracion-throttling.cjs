// Calibración del micro-benchmark con throttling de CPU (Chrome DevTools Protocol).
// Requiere: npm run build && npm run preview; CHROME_PATH con el ejecutable de Chrome.
// Uso: CHROME_PATH=... node scripts/calibracion-throttling.cjs
const puppeteer = require('puppeteer-core')
;(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'], headless: true })
  const base = process.env.BASE_URL || 'http://localhost:4173/'
  for (const rate of [1, 2, 4, 6]) {
    const samples = []
    for (let rep = 0; rep < 3; rep++) {
      const p = await b.newPage()
      const cdp = await p.target().createCDPSession()
      await cdp.send('Emulation.setCPUThrottlingRate', { rate })
      await p.goto(base + '#/', { waitUntil: 'load' })
      await p.evaluate(() => localStorage.removeItem('autoadaptable:deteccion:v1'))
      await p.reload({ waitUntil: 'load' })
      const det = await p.evaluate(() => new Promise((res) => {
        const t = setInterval(() => { const d = localStorage.getItem('autoadaptable:deteccion:v1'); if (d) { clearInterval(t); res(JSON.parse(d)) } }, 200)
      }))
      samples.push(det.benchmark.mops)
      await p.close()
    }
    console.log(`${rate}x: ${JSON.stringify(samples)} MOPS`)
  }
  await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
