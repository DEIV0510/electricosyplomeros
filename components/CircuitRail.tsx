'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * Riel de progreso DETECTAR → ENTENDER → SOLUCIONAR (DESIGN.md §7.12). Solo ≥ 1440 px.
 *
 * - El relleno crece con CSS scroll-driven (animation-timeline: scroll(root)). Va en dos
 *   tramos y cada tramo usa como rango los px de scroll reales de su sección, así el
 *   relleno llega a cada nodo justo cuando esa sección llega al centro de la pantalla.
 *   Este componente solo mide (al montar y cuando cambia el alto de la página).
 * - Cada nodo se enciende cuando su sección cruza el centro (IntersectionObserver).
 * - Sobre secciones oscuras cambia de tono (muestrea el fondo bajo cada nodo al
 *   detenerse el scroll; nada de trabajo por fotograma).
 * Sin soporte de scroll-driven: riel estático con los nodos igual de vivos.
 */

const STEPS = [
  { id: 'inicio', index: '01', label: 'Detectar' },
  { id: 'diagnostico', index: '02', label: 'Entender' },
  { id: 'solucionamos', index: '03', label: 'Solucionar' },
] as const;

/** Luminosidad aproximada (0–1) de un color calculado por el navegador, o null si es transparente. */
function lightnessOf(color: string): number | null {
  const m = color.match(/^(rgba?|color|oklab|oklch)\((.*)\)$/);
  if (!m) return null;
  const [fn, body] = [m[1], m[2]];
  // rgb(r, g, b[, a]) · color(srgb r g b[ / a]) · oklab(L a b[ / a]) · oklch(L c h[ / a])
  const parts = body.replace('srgb', '').split(/[\s,/]+/).filter(Boolean);
  const nums = parts.map((p) => (p.endsWith('%') ? parseFloat(p) / 100 : parseFloat(p)));
  const alpha = nums[3] ?? 1;
  if (!(alpha > 0.5)) return null;
  if (fn === 'oklab' || fn === 'oklch') return nums[0];
  const scale = fn === 'color' ? 1 : 255;
  const [r, g, b] = nums.map((n) => n / scale);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function toneAt(x: number, y: number): 'dark' | 'light' {
  let el: Element | null = document.elementFromPoint(x, y);
  while (el && el !== document.documentElement) {
    const l = lightnessOf(getComputedStyle(el).backgroundColor);
    if (l !== null) return l < 0.32 ? 'dark' : 'light';
    el = el.parentElement;
  }
  return 'light';
}

export default function CircuitRail() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const wide = window.matchMedia('(min-width: 1440px)');

    const start = () => {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
      const sections = STEPS.map((s) => document.getElementById(s.id));

      // 1) Rangos de scroll de cada tramo del relleno.
      const measure = () => {
        const vh = window.innerHeight;
        const y = window.scrollY;
        const max = Math.max(1, document.documentElement.scrollHeight - vh);
        const at = (el: HTMLElement | null, fallback: number) =>
          el ? Math.min(max, Math.max(1, el.getBoundingClientRect().top + y - vh * 0.5)) : fallback;
        const a1 = at(sections[1], max / 3);
        const b1 = Math.max(a1 + 1, at(sections[2], (max * 2) / 3));
        root.style.setProperty('--rail-a1', `${Math.round(a1)}px`);
        root.style.setProperty('--rail-b1', `${Math.round(b1)}px`);
      };

      // 2) Tono claro/oscuro bajo cada nodo y bajo el centro del riel.
      const sample = () => {
        const x = root.getBoundingClientRect().left + 0.5;
        root.dataset.tone = toneAt(x, window.innerHeight / 2);
        for (const n of nodes) {
          const r = n.getBoundingClientRect();
          n.dataset.tone = toneAt(x, r.top);
        }
      };

      let measureRaf = 0;
      const scheduleMeasure = () => {
        if (!measureRaf)
          measureRaf = requestAnimationFrame(() => {
            measureRaf = 0;
            measure();
            sample();
          });
      };
      let sampleTimer = 0;
      let lastSample = 0;
      const onScroll = () => {
        // Muestreo ligero durante el scroll (≤ 8 por segundo) y uno final al detenerse.
        const now = performance.now();
        if (now - lastSample > 120) {
          lastSample = now;
          sample();
        }
        window.clearTimeout(sampleTimer);
        sampleTimer = window.setTimeout(sample, 140);
      };

      const ro = new ResizeObserver(scheduleMeasure);
      ro.observe(document.body);
      window.addEventListener('resize', scheduleMeasure, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      scheduleMeasure();

      // 3) Estado de cada nodo: activo (cruza el centro), pasado o en espera.
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const node = nodes[sections.indexOf(e.target as HTMLElement)];
            if (!node) continue;
            node.dataset.state = e.isIntersecting
              ? 'active'
              : e.boundingClientRect.top < window.innerHeight * 0.4
                ? 'passed'
                : 'idle';
          }
        },
        { rootMargin: '-40% 0px -40% 0px' },
      );
      sections.forEach((el) => el && io.observe(el));

      return () => {
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('resize', scheduleMeasure);
        window.removeEventListener('scroll', onScroll);
        window.clearTimeout(sampleTimer);
        if (measureRaf) cancelAnimationFrame(measureRaf);
      };
    };

    let stop: (() => void) | null = null;
    const sync = () => {
      if (wide.matches && !stop) stop = start();
      else if (!wide.matches && stop) {
        stop();
        stop = null;
      }
    };
    sync();
    wide.addEventListener('change', sync);
    return () => {
      wide.removeEventListener('change', sync);
      stop?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="rail-root" aria-hidden="true">
      <span className="rail-line">
        <span className="rail-fill rail-fill-a" />
        <span className="rail-fill rail-fill-b" />
      </span>
      {STEPS.map((s, i) => (
        <span key={s.id} className="rail-node" data-step={s.id} style={{ '--p': `${i * 50}%` } as CSSProperties}>
          <span className="rail-dot" />
          <span className="rail-label">
            <span className="rail-index">{s.index}</span>
            {s.label}
          </span>
        </span>
      ))}
    </div>
  );
}
