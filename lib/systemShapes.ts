/**
 * Geometría de la línea de "Un hogar. Cuatro sistemas." (dueño: agente systems).
 *
 * Cuatro formas con EXACTAMENTE el mismo número de puntos, en coordenadas de píxel
 * del escenario (w × h), para poder interpolar punto a punto:
 *   0 ENERGÍA  → traza eléctrica en escalones (chaflanes a 45°) con una chispa en zigzag
 *   1 AGUA     → tubería ondulada (se dibuja con doble línea)
 *   2 GAS      → flujo largo y suave con una válvula
 *   3 SOPORTE  → la línea del suelo se levanta y forma el contorno de una casa
 *                (techo a 45°, la mitad superior del rombo del logo)
 *
 * Solo aritmética y raíz cuadrada en lo que se pinta en el servidor (forma 0 y accesorios),
 * para que el marcado sea idéntico en servidor y cliente.
 */

export const SHAPE_POINTS = 96;
export const DEFAULT_W = 1240;
export const DEFAULT_H = 300;

type Pt = [number, number];

export type PartKey =
  | 'e-vias'
  | 'w-joints'
  | 'g-valve'
  | 'g-stem'
  | 'g-meter'
  | 'g-dial'
  | 'h-s0'
  | 'h-s1'
  | 'h-s2'
  | 'h-s3'
  | 'h-s4'
  | 'h-door';

export type ShapeSet = {
  w: number;
  h: number;
  /** Una forma por sistema, [x0, y0, x1, y1, …] con SHAPE_POINTS puntos. */
  pts: Float32Array[];
  /** Accesorios por sistema (trazos absolutos). */
  parts: Record<PartKey, string>;
  /** Punta de la chispa eléctrica. */
  spark: Pt;
};

type Geo = {
  w: number;
  h: number;
  compact: boolean;
  /** Banda vertical donde vive la línea. */
  top: number;
  bottom: number;
  mid: number;
  /** Media altura de la banda. */
  a: number;
};

function geo(w: number, h: number, hasRuler: boolean): Geo {
  const compact = w < 640;
  const top = compact ? 62 : 104;
  const bottom = h - (hasRuler ? 58 : compact ? 24 : 34);
  return { w, h, compact, top, bottom, mid: (top + bottom) / 2, a: (bottom - top) / 2 };
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/* ------------------------------------------------------------------ */
/*  Remuestreo                                                         */
/* ------------------------------------------------------------------ */

/** Conserva cada vértice (esquinas nítidas) y reparte el resto por longitud. */
function resampleCorners(v: Pt[], n: number): Float32Array {
  const segs = v.length - 1;
  const len: number[] = [];
  let total = 0;
  for (let i = 0; i < segs; i++) {
    const l = Math.sqrt((v[i + 1][0] - v[i][0]) ** 2 + (v[i + 1][1] - v[i][1]) ** 2);
    len.push(l);
    total += l;
  }
  const budget = n - 1;
  const exact = len.map((l) => (l / total) * budget);
  const k = exact.map((e) => Math.max(1, Math.floor(e)));
  let sum = k.reduce((s, x) => s + x, 0);
  // Ajuste por mayor resto (o quitar a los más largos si sobran).
  const order = exact.map((e, i) => [e - Math.floor(e), i] as [number, number]).sort((p, q) => q[0] - p[0] || p[1] - q[1]);
  let oi = 0;
  while (sum < budget) {
    k[order[oi % order.length][1]]++;
    sum++;
    oi++;
  }
  const byLen = len.map((l, i) => [l, i] as [number, number]).sort((p, q) => q[0] - p[0] || p[1] - q[1]);
  let bi = 0;
  while (sum > budget) {
    const idx = byLen[bi % byLen.length][1];
    if (k[idx] > 1) {
      k[idx]--;
      sum--;
    }
    bi++;
  }
  const out = new Float32Array(n * 2);
  out[0] = v[0][0];
  out[1] = v[0][1];
  let o = 2;
  for (let i = 0; i < segs; i++) {
    const [x0, y0] = v[i];
    const [x1, y1] = v[i + 1];
    for (let j = 1; j <= k[i]; j++) {
      const t = j / k[i];
      out[o++] = x0 + (x1 - x0) * t;
      out[o++] = y0 + (y1 - y0) * t;
    }
  }
  return out;
}

/** Remuestreo uniforme por longitud de arco (curvas suaves). */
function resampleUniform(v: Pt[], n: number): Float32Array {
  const cum = [0];
  for (let i = 1; i < v.length; i++) {
    cum.push(cum[i - 1] + Math.sqrt((v[i][0] - v[i - 1][0]) ** 2 + (v[i][1] - v[i - 1][1]) ** 2));
  }
  const total = cum[cum.length - 1];
  const out = new Float32Array(n * 2);
  let seg = 1;
  for (let i = 0; i < n; i++) {
    const s = (i / (n - 1)) * total;
    while (seg < v.length - 1 && cum[seg] < s) seg++;
    const s0 = cum[seg - 1];
    const s1 = cum[seg];
    const t = s1 > s0 ? (s - s0) / (s1 - s0) : 0;
    out[i * 2] = v[seg - 1][0] + (v[seg][0] - v[seg - 1][0]) * t;
    out[i * 2 + 1] = v[seg - 1][1] + (v[seg][1] - v[seg - 1][1]) * t;
  }
  return out;
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ */
/*  Formas                                                             */
/* ------------------------------------------------------------------ */

const BLEED = 18;

type Electric = { v: Pt[]; spark: Pt; vias: Pt[] };

function electric(g: Geo): Electric {
  const { w, mid: y0, a, compact } = g;
  const X = (f: number) => f * w;
  const lo = y0 + a * 0.5;
  const hi = y0 - a * 0.5;
  const d1 = lo - y0; // chaflán de media banda
  const d2 = lo - hi; // chaflán de banda completa

  if (compact) {
    const zx = X(0.47);
    const step = Math.max(9, w * 0.034);
    const tip: Pt = [zx + step * 2, y0 - a * 1.0];
    const v: Pt[] = [
      [-BLEED, y0],
      [X(0.05), y0],
      [X(0.05) + d1, lo],
      [X(0.2), lo],
      [X(0.2) + d2, hi],
      [X(0.33), hi],
      [X(0.33) + d1, y0],
      [zx, y0],
      [zx + step, y0 + a * 0.62],
      tip,
      [zx + step * 3, y0 + a * 0.5],
      [zx + step * 4, y0],
      [X(0.74), y0],
      [X(0.74), hi],
      [X(0.86), hi],
      [X(0.86), y0],
      [w + BLEED, y0],
    ];
    return { v, spark: tip, vias: [[X(0.2), lo], [X(0.86), y0]] };
  }

  const zx = X(0.445);
  const step = Math.max(14, w * 0.0165);
  const tip: Pt = [zx + step * 3, y0 - a * 1.32];
  const v: Pt[] = [
    [-BLEED, y0],
    [X(0.045), y0],
    [X(0.045) + d1, lo],
    [X(0.16), lo],
    [X(0.16) + d2, hi],
    [X(0.3), hi],
    [X(0.3) + d1, y0],
    [zx, y0],
    [zx + step, y0 - a * 0.62],
    [zx + step * 2, y0 + a * 0.74],
    tip,
    [zx + step * 4, y0 + a * 0.58],
    [zx + step * 5, y0 - a * 0.3],
    [zx + step * 6, y0],
    [X(0.64), y0],
    [X(0.64), hi],
    [X(0.72), hi],
    [X(0.72), lo],
    [X(0.83), lo],
    [X(0.83) + d1, y0],
    [w + BLEED, y0],
  ];
  return { v, spark: tip, vias: [[X(0.16), lo], [X(0.72), hi], [X(0.83), lo]] };
}

type Water = { v: Pt[]; joints: number[] };

function water(g: Geo): Water {
  const { w, mid: y0, a, compact } = g;
  const xs = w * (compact ? 0.12 : 0.13);
  const xe = w * (compact ? 0.9 : 0.87);
  const lambda = compact ? (xe - xs) / 1.5 : (xe - xs) / 2.25;
  const A = a * (compact ? 0.7 : 0.78);
  const ramp = lambda * 0.4;
  const v: Pt[] = [];
  const samples = 520;
  const x0 = -BLEED;
  const x1 = w + BLEED;
  for (let i = 0; i <= samples; i++) {
    const x = x0 + ((x1 - x0) * i) / samples;
    const env = smooth(xs, xs + ramp, x) * (1 - smooth(xe - ramp, xe, x));
    v.push([x, y0 + A * env * Math.sin((2 * Math.PI * (x - xs)) / lambda)]);
  }
  return { v, joints: [w * (compact ? 0.05 : 0.055), w * (compact ? 0.955 : 0.95)] };
}

type Gas = { v: Pt[]; valve: Pt; meter: Pt };

function gas(g: Geo): Gas {
  const { w, mid: y0, a, compact } = g;
  const yL = y0 - a * (compact ? 0.5 : 0.55);
  const yR = y0 + a * (compact ? 0.42 : 0.5);
  const s0 = w * (compact ? 0.16 : 0.2);
  const s1 = w * (compact ? 0.6 : 0.62);
  const v: Pt[] = [];
  const samples = 520;
  for (let i = 0; i <= samples; i++) {
    const x = -BLEED + ((w + 2 * BLEED) * i) / samples;
    const u = Math.min(1, Math.max(0, (x - s0) / (s1 - s0)));
    // Ondulación muy leve sobre el tramo largo (solo dentro de la curva).
    const ripple = Math.sin(Math.PI * u) * Math.sin(2 * Math.PI * u * 1.5) * a * 0.08;
    v.push([x, yL + (yR - yL) * (0.5 - 0.5 * Math.cos(Math.PI * u)) + ripple]);
  }
  // La válvula va en el tramo recto final (y constante, sin trigonometría).
  return { v, valve: [w * (compact ? 0.79 : 0.78), yR], meter: [w * (compact ? 0.08 : 0.09), yL] };
}

type Home = { v: Pt[]; stripes: string[]; door: string };

function home(g: Geo): Home {
  const { w, compact, bottom } = g;
  const ground = compact ? bottom + 4 : bottom + 6;
  // En móvil el rótulo y los rombos ocupan toda la fila superior: la casa vive debajo.
  const roofTop = compact ? 50 : 30;
  const total = ground - roofTop;
  // Proporción: alero + techo a 45° (rise = semiancho del techo) + muros.
  const halfW = Math.min(compact ? w * 0.16 : w * 0.085, total * 0.5);
  const eave = Math.max(8, halfW * 0.14);
  const rise = halfW + eave;
  const wallTop = roofTop + rise;
  const cx = w * 0.6;
  const apex = wallTop - rise;
  const v: Pt[] = [
    [-BLEED, ground],
    [cx - halfW, ground],
    [cx - halfW, wallTop],
    [cx - halfW - eave, wallTop],
    [cx, apex],
    [cx + halfW + eave, wallTop],
    [cx + halfW, wallTop],
    [cx + halfW, ground],
    [w + BLEED, ground],
  ];
  // Franjas horizontales dentro del techo (eco del rombo del logo).
  const n = compact ? 4 : 5;
  const inset = compact ? 5 : 7;
  const stripes: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const y = apex + ((wallTop - apex) * i) / (n + 1);
    const half = y - apex - inset * 1.42;
    stripes.push(i > n || half <= 2 ? '' : `M${r1(cx - half)} ${r1(y)}H${r1(cx + half)}`);
  }
  const dw = Math.max(10, halfW * 0.3);
  const dh = Math.min(ground - wallTop - 8, dw * 1.7);
  const door = `M${r1(cx - dw / 2)} ${r1(ground)}V${r1(ground - dh)}H${r1(cx + dw / 2)}V${r1(ground)}`;
  return { v, stripes, door };
}

/* ------------------------------------------------------------------ */
/*  Accesorios                                                         */
/* ------------------------------------------------------------------ */

function ring([x, y]: Pt, rr: number): string {
  return `M${r1(x - rr)} ${r1(y)}a${rr} ${rr} 0 1 0 ${rr * 2} 0a${rr} ${rr} 0 1 0 ${-rr * 2} 0`;
}

/** `ruler`: el escenario reserva abajo el espacio de la regla (escritorio ≥1024). */
export function buildShapes(w: number, h: number, ruler = true): ShapeSet {
  const g = geo(w, h, ruler && w >= 640);
  const e = electric(g);
  const wa = water(g);
  const ga = gas(g);
  const ho = home(g);

  const viaR = g.compact ? 3.5 : 4.5;
  const jointH = g.compact ? 9 : 11;
  const jw = g.compact ? 4 : 5;
  const joints = wa.joints
    .map((x) => `M${r1(x - jw / 2)} ${r1(g.mid - jointH)}h${jw}v${jointH * 2}h${-jw}Z`)
    .join('');

  const [vx, vy] = ga.valve;
  const vs = g.compact ? 6 : 8; // semiancho de la válvula (corbatín)
  const valve = `M${r1(vx - vs)} ${r1(vy - vs * 0.7)}L${r1(vx + vs)} ${r1(vy + vs * 0.7)}V${r1(vy - vs * 0.7)}L${r1(vx - vs)} ${r1(vy + vs * 0.7)}Z`;
  // Medidor: caja sobre la línea, con un dial y su aguja.
  const [mx, my] = ga.meter;
  const mw = g.compact ? 11 : 15;
  const mh = g.compact ? 9 : 12;
  const meter = `M${r1(mx - mw)} ${r1(my - mh)}H${r1(mx + mw)}V${r1(my + mh)}H${r1(mx - mw)}Z`;
  const dr = g.compact ? 4 : 5.5;
  const dial = ring([mx, my], dr) + `M${r1(mx)} ${r1(my)}L${r1(mx + dr * 0.6)} ${r1(my - dr * 0.6)}`;
  const stem = `M${r1(vx)} ${r1(vy)}V${r1(vy - vs * 2)}M${r1(vx - vs * 0.8)} ${r1(vy - vs * 2)}H${r1(vx + vs * 0.8)}`;

  return {
    w,
    h,
    pts: [
      resampleCorners(e.v, SHAPE_POINTS),
      resampleUniform(wa.v, SHAPE_POINTS),
      resampleUniform(ga.v, SHAPE_POINTS),
      resampleCorners(ho.v, SHAPE_POINTS),
    ],
    parts: {
      'e-vias': e.vias.map((p) => ring(p, viaR)).join(''),
      'w-joints': joints,
      'g-valve': valve,
      'g-stem': stem,
      'g-meter': meter,
      'g-dial': dial,
      'h-s0': ho.stripes[0],
      'h-s1': ho.stripes[1],
      'h-s2': ho.stripes[2],
      'h-s3': ho.stripes[3],
      'h-s4': ho.stripes[4],
      'h-door': ho.door,
    },
    spark: [r1(e.spark[0]), r1(e.spark[1])],
  };
}

/** Polilínea → atributo `d` (1 decimal). */
export function toPath(p: ArrayLike<number>): string {
  let d = `M${r1(p[0])} ${r1(p[1])}`;
  for (let i = 2; i < p.length; i += 2) d += `L${r1(p[i])} ${r1(p[i + 1])}`;
  return d;
}

/** Curva de transformación (entrada/salida suave). */
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
