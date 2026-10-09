// Crea app/favicon.ico (16, 32 y 48 px, PNG embebido) a partir del ícono del símbolo oficial.
// Uso: node scripts/make-favicon.mjs
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const SRC = 'public/brand/mark-512.png';
const sizes = [16, 32, 48];
// El decodificador ICO de Next exige PNG RGBA de 8 bits (no paleta): ensureAlpha + palette:false.
const pngs = await Promise.all(
  sizes.map((s) => sharp(SRC).ensureAlpha().resize(s, s).toColourspace('srgb').png({ compressionLevel: 9, palette: false }).toBuffer()),
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reservado
header.writeUInt16LE(1, 2); // tipo: ícono
header.writeUInt16LE(sizes.length, 4);

let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s >= 256 ? 0 : s, 0);
  e.writeUInt8(s >= 256 ? 0 : s, 1);
  e.writeUInt8(0, 2); // paleta
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); // planos
  e.writeUInt16LE(32, 6); // bits por píxel
  e.writeUInt32LE(pngs[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
});

await writeFile('app/favicon.ico', Buffer.concat([header, ...entries, ...pngs]));
console.log('app/favicon.ico listo', offset, 'bytes');
