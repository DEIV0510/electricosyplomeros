'use client';

import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { SYSTEMS } from '@/lib/content';
import {
  buildShapes,
  easeInOutCubic,
  toPath,
  DEFAULT_H,
  DEFAULT_W,
  SHAPE_POINTS,
  type PartKey,
  type ShapeSet,
} from '@/lib/systemShapes';

/** Geometría del primer pintado (servidor y cliente iguales). */
const INITIAL = buildShapes(DEFAULT_W, DEFAULT_H);
const INITIAL_D = toPath(INITIAL.pts[0]);

/** Rótulo técnico de la forma que dibuja la línea (interfaz, no afirmación comercial). */
const FORM = ['Traza eléctrica', 'Tubería', 'Línea de gas', 'Contorno del hogar'] as const;

const MORPH_MS = 900;
/** Parte del tiempo que la transformación tarda en recorrer la línea de izquierda a derecha. */
const STAGGER = 0.32;

type Engine = { go: (i: number) => void; destroy: () => void };

/**
 * Motor imperativo de la línea: mide el escenario, calcula las cuatro formas en píxeles
 * reales y, al cambiar de sistema, interpola punto a punto en requestAnimationFrame
 * solo mientras dura la transformación.
 */
function createEngine(wrap: HTMLElement, svg: SVGSVGElement, start: number): Engine {
  const lines = Array.from(svg.querySelectorAll<SVGPathElement>('[data-line]'));
  const parts = Array.from(svg.querySelectorAll<SVGPathElement>('[data-part]'));
  const spark = svg.querySelector<SVGGElement>('[data-spark]');
  const desktop = window.matchMedia('(min-width: 1024px)');
  const rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const N = SHAPE_POINTS;

  let shapes: ShapeSet = INITIAL;
  let lastRuler = true;
  let target = start;
  const cur = Float32Array.from(INITIAL.pts[0]);
  const from = new Float32Array(N * 2);
  let raf = 0;
  let t0 = 0;

  const write = () => {
    const d = toPath(cur);
    for (const l of lines) l.setAttribute('d', d);
  };
  const place = () => {
    for (const p of parts) p.setAttribute('d', shapes.parts[p.dataset.part as PartKey] ?? '');
    spark?.setAttribute('transform', `translate(${shapes.spark[0]} ${shapes.spark[1]})`);
  };
  const reduced = () => rmQuery.matches || document.documentElement.classList.contains('rm');

  const frame = (now: number) => {
    const t = Math.min(1, Math.max(0, (now - t0) / MORPH_MS));
    const to = shapes.pts[target];
    for (let i = 0; i < N; i++) {
      const u = Math.min(1, Math.max(0, (t - STAGGER * (i / (N - 1))) / (1 - STAGGER)));
      const k = easeInOutCubic(u);
      const j = i * 2;
      cur[j] = from[j] + (to[j] - from[j]) * k;
      cur[j + 1] = from[j + 1] + (to[j + 1] - from[j + 1]) * k;
    }
    write();
    if (t < 1) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
      wrap.removeAttribute('data-morphing');
    }
  };

  const measure = () => {
    const r = svg.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    const ruler = desktop.matches;
    if (!w || !h) return;
    if (w === shapes.w && h === shapes.h && ruler === lastRuler && shapes !== INITIAL) return;
    lastRuler = ruler;
    shapes = buildShapes(w, h, ruler);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    place();
    if (!raf) {
      cur.set(shapes.pts[target]);
      write();
    }
  };

  const ro = new ResizeObserver(measure);
  ro.observe(svg);
  desktop.addEventListener('change', measure);

  return {
    go(i) {
      if (i === target) return;
      target = i;
      if (reduced()) {
        cancelAnimationFrame(raf);
        raf = 0;
        cur.set(shapes.pts[i]);
        write();
        wrap.removeAttribute('data-morphing');
        return;
      }
      from.set(cur);
      t0 = performance.now();
      wrap.setAttribute('data-morphing', '');
      if (!raf) raf = requestAnimationFrame(frame);
    },
    destroy() {
      ro.disconnect();
      desktop.removeEventListener('change', measure);
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

export default function SystemStage({ active, paused }: { active: number; paused: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const activeRef = useRef(active);
  const haloId = `sys-halo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;
    const engine = createEngine(wrap, svg, activeRef.current);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.go(active);
  }, [active]);

  return (
    <div ref={wrapRef} className="sys-stage" data-paused={paused ? 'true' : 'false'} aria-hidden="true">
      <div className="sys-stage-grid bg-grid-night" />
      <div className="ticks pointer-events-none absolute inset-2.5 text-mist-3 sm:inset-3" />

      <svg
        ref={svgRef}
        className="sys-svg"
        viewBox={`0 0 ${DEFAULT_W} ${DEFAULT_H}`}
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <defs>
          <radialGradient id={haloId}>
            <stop offset="0" className="sys-halo-stop" stopOpacity="0.5" />
            <stop offset="1" className="sys-halo-stop" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Bajo la línea: franjas del techo (eco del rombo del logo) y puerta */}
        <g className="sys-acc" data-acc="hogar">
          {(['h-s0', 'h-s1', 'h-s2', 'h-s3', 'h-s4'] as const).map((k, i) => (
            <path
              key={k}
              data-part={k}
              className="sys-h-stripe"
              style={{ '--k': i } as CSSProperties}
              d={INITIAL.parts[k]}
            />
          ))}
          <path data-part="h-door" className="sys-h-door" d={INITIAL.parts['h-door']} />
        </g>

        {/* La línea: halo, tubería (doble línea), núcleo y flujos por sistema */}
        <path data-line className="sys-l sys-l-glow" d={INITIAL_D} />
        <path data-line className="sys-l sys-l-pipe-o" d={INITIAL_D} />
        <path data-line className="sys-l sys-l-pipe-i" d={INITIAL_D} />
        <path data-line className="sys-l sys-l-core" d={INITIAL_D} />
        {SYSTEMS.map((s) => (
          <path key={s.id} data-line data-flow={s.id} className="sys-l sys-flow anim-loop" d={INITIAL_D} />
        ))}

        {/* Sobre la línea: accesorios de cada sistema */}
        <g className="sys-acc" data-acc="electricidad">
          <path data-part="e-vias" className="sys-e-vias" d={INITIAL.parts['e-vias']} />
          <g data-spark="" transform={`translate(${INITIAL.spark[0]} ${INITIAL.spark[1]})`}>
            <circle r="30" fill={`url(#${haloId})`} className="sys-spark-halo anim-loop" />
            <path d="M0 -11V-5M0 5V11M-11 0H-5M5 0H11M-6.5 -6.5-4 -4M4 4 6.5 6.5M6.5 -6.5 4 -4M-4 4-6.5 6.5" className="sys-spark-rays anim-loop" />
            <circle r="2.6" className="sys-spark-core" />
          </g>
        </g>
        <g className="sys-acc" data-acc="plomeria">
          <path data-part="w-joints" className="sys-w-joints" d={INITIAL.parts['w-joints']} />
        </g>
        <g className="sys-acc" data-acc="gas">
          <path data-part="g-meter" className="sys-g-meter" d={INITIAL.parts['g-meter']} />
          <path data-part="g-dial" className="sys-g-stem" d={INITIAL.parts['g-dial']} />
          <path data-part="g-stem" className="sys-g-stem" d={INITIAL.parts['g-stem']} />
          <path data-part="g-valve" className="sys-g-valve" d={INITIAL.parts['g-valve']} />
        </g>
      </svg>

      {/* Rótulo del sistema activo (los cuatro apilados en la misma celda: sin saltos) */}
      <div className="sys-tag">
        {SYSTEMS.map((s, i) => (
          <div key={s.id} className="sys-tag-item" data-sys={s.id} data-on={i === active ? '' : undefined}>
            <p className="sys-tag-big t-display whitespace-nowrap">
              <span className="sys-tag-idx">{s.index}</span>
              <span className="sys-tag-sep">/</span>
              {s.system}
            </p>
            <p className="t-label mt-2 hidden whitespace-nowrap text-mist-2 sm:block">{s.name}</p>
          </div>
        ))}
      </div>

      {/* Lectura arriba a la derecha: forma + posición en la secuencia */}
      <div className="sys-read">
        <div className="sys-read-form t-label">
          {FORM.map((f, i) => (
            <span key={f} className="sys-read-item whitespace-nowrap" data-on={i === active ? '' : undefined}>
              {f}
            </span>
          ))}
        </div>
        <ol className="sys-dots">
          {SYSTEMS.map((s, i) => (
            <li key={s.id} className="sys-dot" data-on={i === active ? '' : undefined} />
          ))}
        </ol>
      </div>

      {/* Regla inferior alineada con las cuatro columnas (≥1024) */}
      <div className="sys-rule">
        {SYSTEMS.map((s) => (
          <span key={s.id} className="sys-rule-cell" />
        ))}
        <span className="sys-rule-bar" style={{ transform: `translateX(${active * 100}%)` }} />
      </div>
    </div>
  );
}
