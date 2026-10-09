'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsLite, useMotionPaused, usePrefersReducedMotion } from '@/lib/hooks';

/** Largo visible del pulso (px) y radio de la esquina del enlace (px). */
const PULSE_PX = 64;
const CORNER = 16;
/** Reposo mínimo tras una pasada antes de que el puntero o el foco la reactiven (ms). */
const REST_MS = 1200;

/**
 * Enlace entre los dos nodos-ciudad de la cobertura. Mide los nodos (HTML) y dibuja
 * una ruta ortogonal: baja desde Montería y gira hacia Medellín (en móvil es una línea
 * vertical). Dos pulsos la recorren en sentidos opuestos.
 *
 * Los pulsos animan `stroke-dashoffset` (costo de hilo principal), así que NO son un bucle
 * infinito (DESIGN §2 Movimiento): con `data-run` corren 2 idas y vueltas y reposan. Se
 * reactivan al volver a entrar en pantalla o al interactuar con el escenario (puntero o
 * foco). No arrancan con animaciones pausadas (botón del footer), en modo lite ni con
 * movimiento reducido; si se pausan a mitad de pasada, se detienen en el estado de reposo.
 *
 * Escribe la geometría directamente en el DOM (sin estado de React): solo se recalcula
 * cuando cambia el tamaño del escenario o de los nombres (carga de la fuente).
 */
export default function CoverageLink() {
  const svgRef = useRef<SVGSVGElement>(null);
  /** El escenario se ve al menos un 20 % (la pasada arranca cuando ya se puede seguir). */
  const [onScreen, setOnScreen] = useState(false);
  /** La pasada de esta visita ya terminó (se limpia al salir de pantalla o al interactuar). */
  const [ended, setEnded] = useState(false);
  const endedAt = useRef(0);

  const paused = useMotionPaused();
  const lite = useIsLite();
  const reduced = usePrefersReducedMotion();
  const canRun = !paused && !lite && !reduced;
  const running = onScreen && canRun && !ended;

  // Al salir del todo de pantalla se rearma, así cada nueva entrada reinicia la pasada.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting && entry.intersectionRatio >= 0.2);
        if (!entry.isIntersecting) setEnded(false);
      },
      { threshold: [0, 0.2] },
    );
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  // Fin de la pasada: el pulso de vuelta es el último en terminar.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName !== 'cov-up') return;
      endedAt.current = performance.now();
      setEnded(true);
    };
    svg.addEventListener('animationend', onEnd);
    return () => svg.removeEventListener('animationend', onEnd);
  }, []);

  // En reposo, pasar el puntero o llevar el foco al escenario la reactiva.
  useEffect(() => {
    const stage = svgRef.current?.parentElement;
    if (!stage || !ended || !canRun) return;
    const wake = () => {
      if (performance.now() - endedAt.current < REST_MS) return;
      setEnded(false);
    };
    stage.addEventListener('pointerenter', wake);
    stage.addEventListener('focusin', wake);
    return () => {
      stage.removeEventListener('pointerenter', wake);
      stage.removeEventListener('focusin', wake);
    };
  }, [ended, canRun]);

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
      data-run={running ? '' : undefined}
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
