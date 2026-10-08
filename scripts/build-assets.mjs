// Genera los recursos web a partir del logo OFICIAL (_material-marca/logotipo-original.png).
// El logo no se redibuja ni se deforma: solo se recorta el aire transparente, se escala
// proporcionalmente y se exporta en formatos livianos (AVIF / WebP / PNG).
// Uso: node scripts/build-assets.mjs
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const SRC = '_material-marca/logotipo-original.png';
const OUT = 'public/brand';
await mkdir(OUT, { recursive: true });

// 1) Logo completo: recorte del margen transparente (no toca un solo píxel del dibujo).
const trimmed = await sharp(SRC).trim({ threshold: 1 }).png().toBuffer();
const meta = await sharp(trimmed).metadata();
console.log('logo recortado', meta.width, 'x', meta.height, 'ratio', (meta.width / meta.height).toFixed(4));

for (const w of [320, 640, 960, 1440]) {
  const base = sharp(trimmed).resize({ width: w, kernel: 'lanczos3' });
  await base.clone().webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(`${OUT}/logo-${w}.webp`);
  await base.clone().avif({ quality: 70, effort: 6 }).toFile(`${OUT}/logo-${w}.avif`);
  if (w === 640 || w === 960) await base.clone().png({ compressionLevel: 9, palette: true, quality: 100 }).toFile(`${OUT}/logo-${w}.png`);
}

// 2) Símbolo (solo para favicon / ícono de app): el mismo dibujo del logo sin el texto negro.
//    Se toma la zona del símbolo y se vuelven transparentes únicamente los píxeles negros del
//    wordmark que invaden esa zona. Morado y verde quedan intactos.
const { data, info } = await sharp(SRC).extract({ left: 60, top: 0, width: 690, height: 791 }).raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const isBlack = r < 90 && g < 90 && b < 90 && !(b > 60 && b > r + 25); // excluye el morado oscuro
  if (isBlack) data[i + 3] = 0;
}
const mark = await sharp(data, { raw: info }).trim({ threshold: 1 }).png().toBuffer();
const markMeta = await sharp(mark).metadata();
console.log('símbolo', markMeta.width, 'x', markMeta.height);

async function tile(size, pad, bg) {
  const inner = Math.round(size * (1 - pad * 2));
  const sym = await sharp(mark).resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: sym, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}
const white = { r: 255, g: 255, b: 255, alpha: 1 };
await writeFile('app/icon.png', await tile(512, 0.1, white));
await writeFile('app/apple-icon.png', await tile(180, 0.1, white));
await writeFile(`${OUT}/mark-192.png`, await tile(192, 0.1, white));
await writeFile(`${OUT}/mark-512.png`, await tile(512, 0.1, white));

// 3) Imagen para compartir (Open Graph 1200x630): papel técnico + logo real + mensaje.
const W = 1200, H = 630;
const grid = [];
for (let x = 0; x <= W; x += 40) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#3A0080" stroke-opacity="0.06" stroke-width="1"/>`);
for (let y = 0; y <= H; y += 40) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#3A0080" stroke-opacity="0.06" stroke-width="1"/>`);
const ogSvg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#F6F5F9"/>
  ${grid.join('')}
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="#3A0080"/>
  <rect x="0" y="${H - 14}" width="360" height="14" fill="#00C000"/>
  <text x="80" y="388" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="58" fill="#14101F" letter-spacing="1">TRANQUILO.</text>
  <text x="80" y="456" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="58" fill="#3A0080" letter-spacing="1">TENEMOS LA SOLUCIÓN.</text>
  <text x="80" y="512" font-family="Arial, sans-serif" font-weight="700" font-size="26" fill="#3F3A4D">Electricidad · Plomería · Gas · Asistencia para el hogar</text>
  <text x="80" y="562" font-family="Arial, sans-serif" font-weight="700" font-size="24" fill="#14101F" letter-spacing="3">MEDELLÍN · MONTERÍA</text>
  <text x="${W - 80}" y="562" text-anchor="end" font-family="Arial, sans-serif" font-weight="700" font-size="24" fill="#14101F">WhatsApp 313 894 8186</text>
</svg>`;
const logoForOg = await sharp(trimmed).resize({ width: 560 }).png().toBuffer();
await sharp(Buffer.from(ogSvg))
  .composite([{ input: logoForOg, left: 80, top: 56 }])
  .png({ compressionLevel: 9 })
  .toFile('app/opengraph-image.png');
await writeFile('app/opengraph-image.alt.txt', 'Eléctricos y Plomeros, Soluciones Eficientes: electricidad, plomería, gas y asistencia para el hogar en Medellín y Montería.');

console.log('listo');
