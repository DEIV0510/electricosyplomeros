// Next 16 + output:'export' compilado en Windows escribe los archivos de prefetch como
// carpetas anidadas (__next.a\b\__PAGE__.txt) en lugar de nombres con puntos
// (__next.a.b.__PAGE__.txt), y el navegador recibe 404. Este paso aplana esas carpetas.
// En Linux/Vercel no hace nada.
import { readdir, rename, rm, stat, mkdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const OUT = 'out';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

async function main() {
  try {
    await stat(OUT);
  } catch {
    return;
  }
  let moved = 0;
  for (const entry of await readdir(OUT, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('__next.')) continue;
    const base = join(OUT, entry.name);
    for (const file of await walk(base)) {
      const rel = relative(OUT, file).split(sep).join('.');
      const target = join(OUT, rel);
      await mkdir(OUT, { recursive: true });
      await rename(file, target);
      moved++;
    }
    await rm(base, { recursive: true, force: true });
  }
  if (moved) console.log(`fix-export: ${moved} archivo(s) de prefetch aplanados`);
}

main();
