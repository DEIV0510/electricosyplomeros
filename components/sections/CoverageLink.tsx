'use client';

import { useEffect, useRef } from 'react';
import { useInView } from '@/lib/hooks';

/** Largo visible del pulso (px) y radio de la esquina del enlace (px). */
const PULSE_PX = 64;
const CORNER = 16;

/**
 * Enlace entre los dos nodos-ciudad de la cobertura. Mide los nodos (HTML) y dibuja
 * una ruta ortogonal: baja desde Montería y gira hacia Medellín (en móvil es una línea
 * vertical). Dos pulsos la recorren en sentidos opuestos; los bucles se pausan fuera de
 * pantalla (`data-paused`) y en modo lite (`anim-loop`).
 *
 * Escribe la geometría directamente en el DOM (sin estado de React): solo se recalcula
 * cuando cambia el tamaño del escenario o de los nombres (carga de la fuente).
 */
export default function CoverageLink() {
  const svgRef = useRef<SVGSVGElement>(null);
  const onScreen = useInView(svgRef, { rootMargin: '120px 0px' });

  useEffect(() => {
    const svg = svgRef.current;
    const stage = svg?.parentElement;
    if (!svg || !stage) return;
    const from = stage.querySelector<HTMLElement>('[data-cov-node="monteria"]');
    const to = stage.querySelector<HTMLElement>('[data-cov-node="medellin"]');
    if (!from || !to) return;

    const lines = svg.querySelectorAll<SVGPathElement>('[data-cov-line]');
    const pulses = svg.querySelectorAll<SVGPathElement>('[data-cov-pulse]');
    const pingFrom = svg.querySelector<SVGGElement>('[data-cov-ping="monteria"]');
    const pingTo = svg.querySelector<SVGGElement>('[data-cov-ping="medellin"]');

    let raf = 0;
    const draw = () => {
      raf = 0;
      const box = svg.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      if (!box.width || !box.height || !a.width || !b.width) return;
      const r1 = (n: number) => Math.round(n * 10) / 10;
      const x1 = r1(a.left + a.width / 2 - box.left);
      const y1 = r1(a.top + a.height / 2 - box.top);
      const x2 = r1(b.left + b.width / 2 - box.left);
      const y2 = r1(b.top + b.height / 2 - box.top);
      const dx = x2 - x1;
      const dy = y2 - y1;

      let d: string;
      if (Math.abs(dx) < 2 || dy < 2) {
        d = `M${x1} ${y1}L${x2} ${y2}`;
      } else {
        const r = Math.min(CORNER, Math.abs(dx) / 2, dy / 2);
        const sx = Math.sign(dx);
        d = `M${x1} ${y1}V${r1(y2 - r)}Q${x1} ${y2} ${r1(x1 + sx * r)} ${y2}H${x2}`;
      }
      const length = Math.abs(dx) + Math.abs(dy);
      const dash = Math.min(30, (PULSE_PX / Math.max(length, 1)) * 100).toFixed(2);

      svg.setAttribute('viewBox', `0 0 ${r1(box.width)} ${r1(box.height)}`);
      lines.forEach((p) => p.setAttribute('d', d));
      pulses.forEach((p) => p.setAttribute('stroke-dasharray', `${dash} 300`));
      pingFrom?.setAttribute('transform', `translate(${x1} ${y1})`);
      pingTo?.setAttribute('transform', `translate(${x2} ${y2})`);
      svg.setAttribute('data-ready', 'true');
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(stage);
    stage.querySelectorAll('.cov-name').forEach((n) => ro.observe(n));
    document.fonts?.ready.then(schedule).catch(() => {});
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="cov-link"
      aria-hidden="true"
      focusable="false"
      fill="none"
      data-paused={onScreen ? undefined : 'true'}
    >
      <path data-cov-line="" className="cov-line" />
      <path data-cov-line="" data-cov-pulse="" pathLength={100} className="cov-pulse cov-pulse--down anim-loop" />
      <path data-cov-line="" data-cov-pulse="" pathLength={100} className="cov-pulse cov-pulse--up anim-loop" />
      <g data-cov-ping="monteria">
        <circle r="15" className="cov-ping cov-ping--from anim-loop" />
      </g>
      <g data-cov-ping="medellin">
        <circle r="15" className="cov-ping cov-ping--to anim-loop" />
      </g>
    </svg>
  );
}
