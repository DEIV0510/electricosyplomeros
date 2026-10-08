// Servidor estático mínimo para probar la carpeta out/ en local, con compresión Brotli/gzip
// como en producción (Vercel). Uso: node scripts/serve-out.mjs [puerto]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const ROOT = 'out';
const PORT = Number(process.argv[2] || 5471);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.txt', '.svg', '.xml', '.webmanifest']);
const cache = new Map();

function encode(file, body, accept) {
  if (!COMPRESSIBLE.has(extname(file))) return { body };
  if (/\bbr\b/.test(accept)) {
    const key = `br:${file}`;
    if (!cache.has(key)) cache.set(key, brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }));
    return { body: cache.get(key), encoding: 'br' };
  }
  if (/\bgzip\b/.test(accept)) {
    const key = `gz:${file}`;
    if (!cache.has(key)) cache.set(key, gzipSync(body, { level: 9 }));
    return { body: cache.get(key), encoding: 'gzip' };
  }
  return { body };
}

createServer(async (req, res) => {
  const accept = String(req.headers['accept-encoding'] || '');
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    path = normalize(path).replace(/^[/\\]+/, '').replace(/\.\.[/\\]/g, '');
    let file = join(ROOT, path);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    } catch {
      if (!extname(file)) file += '.html';
    }
    const raw = await readFile(file);
    const { body, encoding } = encode(file, raw, accept);
    const immutable = path.startsWith('_next/static/');
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file)] || 'application/octet-stream',
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      ...(encoding ? { 'Content-Encoding': encoding, Vary: 'Accept-Encoding' } : {}),
    });
    res.end(body);
  } catch {
    try {
      const nf = await readFile(join(ROOT, '404.html'));
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      res.end(nf);
    } catch {
      res.writeHead(404);
      res.end('404');
    }
  }
}).listen(PORT, () => console.log(`out/ en http://localhost:${PORT}`));
