// Captura y chequeo rápido con el Chrome instalado (playwright-core, sin descargar navegadores).
//
// Ejemplos:
//   node scripts/qa/shot.mjs --url http://localhost:5470/ --w 1440 --h 900 --out C:/tmp/hero.png
//   node scripts/qa/shot.mjs --w 390 --h 844 --mobile --selector "#diagnostico" --out C:/tmp/dx.png
//   node scripts/qa/shot.mjs --w 390 --h 844 --mobile --full --out C:/tmp/full.png
//   node scripts/qa/shot.mjs --selector "#diagnostico" --click "[data-service=plomeria]" --wait 800 --out ...
//   node scripts/qa/shot.mjs --reduced ...      (prefers-reduced-motion: reduce)
//   node scripts/qa/shot.mjs --boot ...         (muestra la pantalla de carga; por defecto se salta)
//   node scripts/qa/shot.mjs --eval "document.title"  (imprime el resultado)
//   node scripts/qa/shot.mjs --hover 900,400 ...  (mueve el mouse antes de capturar)
//
// Imprime un JSON con: errores de consola, errores de página, desbordes horizontales y
// el resultado de --eval. Las secciones se capturan con clip (no espera "estabilidad",
// así que funciona con animaciones infinitas).
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};

const url = opt('url', 'http://localhost:5470/');
const w = Number(opt('w', 1440));
const h = Number(opt('h', 900));
const mobile = !!opt('mobile', false);
const out = opt('out', null);
const selector = opt('selector', null);
const full = !!opt('full', false);
const wait = Number(opt('wait', 900));
const reduced = !!opt('reduced', false);
const boot = !!opt('boot', false);
const click = opt('click', null);
const evalExpr = opt('eval', null);
const hover = opt('hover', null);
const noReveal = !!opt('no-reveal', false);
const bootShots = opt('boot-shots', null); // "100,400,800,1200" ms: capturas durante la carga

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: w, height: h },
  deviceScaleFactor: mobile ? 2 : 1,
  isMobile: mobile,
  hasTouch: mobile,
  reducedMotion: reduced ? 'reduce' : 'no-preference',
  locale: 'es-CO',
});
if (!boot) await context.addInitScript(() => { try { sessionStorage.setItem('ep-boot', '1'); } catch {} });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoleErrors.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.on('requestfailed', (r) => consoleErrors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
page.on('response', (r) => { if (r.status() >= 400) consoleErrors.push(`HTTP ${r.status()}: ${r.url()}`); });

if (bootShots && out) {
  const times = String(bootShots).split(',').map(Number);
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'commit' });
  for (const t of times) {
    const dt = t - (Date.now() - t0);
    if (dt > 0) await page.waitForTimeout(dt);
    await page.screenshot({ path: out.replace(/\.png$/, `-${t}ms.png`) });
  }
} else {
  await page.goto(url, { waitUntil: 'load' });
}
await page.waitForTimeout(300);
if (!noReveal) await page.evaluate(() => document.documentElement.classList.add('reveal-fallback'));

if (selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
}
if (click) {
  for (const c of String(click).split('||')) {
    await page.locator(c).first().click();
    await page.waitForTimeout(450);
  }
}
if (hover) {
  const [x, y] = String(hover).split(',').map(Number);
  await page.mouse.move(x - 120, y - 60);
  await page.mouse.move(x, y, { steps: 8 });
}
await page.waitForTimeout(wait);

let evalResult;
if (evalExpr) evalResult = await page.evaluate((e) => { try { return eval(e); } catch (err) { return 'EVAL ERROR: ' + err; } }, evalExpr);

const overflow = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      let p = el.parentElement, clipped = false;
      while (p && p !== document.body) {
        const cs = getComputedStyle(p);
        if (/(hidden|clip|auto|scroll)/.test(cs.overflowX) || /(hidden|clip)/.test(cs.overflow)) { clipped = true; break; }
        p = p.parentElement;
      }
      if (!clipped) offenders.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.className?.baseVal ?? el.className).slice(0, 60)} [${Math.round(r.left)}→${Math.round(r.right)}]`);
    }
  }
  return { scrollWidth: document.documentElement.scrollWidth, clientWidth: vw, offenders: offenders.slice(0, 15) };
});

if (out && !bootShots) {
  if (selector && !full) {
    const box = await page.locator(selector).first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
    });
    await page.screenshot({ path: out, fullPage: true, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(box.width, w), height: Math.min(box.height, 6000) } });
  } else {
    await page.screenshot({ path: out, fullPage: full });
  }
}

console.log(JSON.stringify({ url, viewport: `${w}x${h}${mobile ? ' mobile' : ''}${reduced ? ' reduced' : ''}`, out, consoleErrors, pageErrors, overflow, evalResult }, null, 2));
await browser.close();
