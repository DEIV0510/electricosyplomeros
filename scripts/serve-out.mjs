// Servidor estático mínimo para probar la carpeta out/ en local: node scripts/serve-out.mjs [puerto]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = 'out';
const PORT = Number(process.argv[2] || 5471);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    path = normalize(path).replace(/^([/\])+/, '');
    let file = join(ROOT, path);
    try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); } catch { if (!extname(file)) file += '.html'; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    try { const nf = await readFile(join(ROOT, '404.html')); res.writeHead(404, { 'Content-Type': TYPES['.html'] }); res.end(nf); }
    catch { res.writeHead(404); res.end('404'); }
  }
}).listen(PORT, () => console.log(`out/ en http://localhost:${PORT}`));
