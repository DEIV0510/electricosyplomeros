// Imagen para compartir (Open Graph 1200×630) con la tipografía real de la marca
// (Archivo expandido + JetBrains Mono) y el logo OFICIAL sin alterar.
// Uso: node scripts/build-og.mjs   (necesita Chrome instalado e internet para Google Fonts)
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const logo = (await readFile('public/brand/logo-960.png')).toString('base64');

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px}
  body{position:relative;overflow:hidden;background:#f6f5f9;color:#14101f;font-family:Archivo,sans-serif;
    background-image:linear-gradient(rgb(58 0 128/.07) 1px,transparent 1px),linear-gradient(90deg,rgb(58 0 128/.07) 1px,transparent 1px);
    background-size:40px 40px;background-position:-1px -1px}
  .logo{position:absolute;left:80px;top:58px;width:440px;height:auto}
  .tag{position:absolute;left:80px;top:268px;display:flex;align-items:center;gap:14px;font:500 17px 'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#655e78}
  .tag i{width:10px;height:10px;background:#3a0080;transform:rotate(45deg);display:block}
  h1{position:absolute;left:80px;top:308px;font-weight:800;font-stretch:118%;text-transform:uppercase;font-size:66px;line-height:.98;letter-spacing:-.01em}
  h1 .s{position:relative;color:#3a0080}
  h1 .s::after{content:"";position:absolute;left:0;right:0;bottom:-7px;height:7px;background:#00c000}
  .lead{position:absolute;left:80px;top:470px;font-size:25px;font-weight:500;color:#3f3a4d}
  .row{position:absolute;left:80px;right:80px;bottom:44px;display:flex;justify-content:space-between;align-items:center;font:500 19px 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#14101f}
  .row b{display:inline-block;width:8px;height:8px;margin:0 14px 2px;background:#3a0080;transform:rotate(45deg)}
  .wa{font-family:Archivo,sans-serif;font-weight:750;font-stretch:108%;letter-spacing:.02em;text-transform:none;font-size:22px}
  .bar{position:absolute;left:0;right:0;bottom:0;height:12px;background:#3a0080}
  .bar::before{content:"";position:absolute;left:0;top:0;bottom:0;width:360px;background:#00c000}
</style></head><body>
  <img class="logo" src="data:image/png;base64,${logo}" alt="">
  <p class="tag"><i></i>Electricidad · Plomería · Gas · Hogar</p>
  <h1>Tranquilo.<br>Tenemos la <span class="s">solución</span>.</h1>
  <p class="lead">Electricidad, plomería, gas y asistencia para tu hogar.</p>
  <div class="row"><span>Medellín<b></b>Montería</span><span class="wa">WhatsApp 313 894 8186</span></div>
  <div class="bar"></div>
</body></html>`;

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const fams = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
if (!fams.some((f) => f.includes('Archivo'))) throw new Error('Archivo no cargó: ' + fams.join(','));
const png = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(png).png({ palette: true, compressionLevel: 9, quality: 100 }).toFile('app/opengraph-image.png');
console.log('app/opengraph-image.png listo; fuentes:', [...new Set(fams)].join(', '));
