'use client';

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { useInView } from '@/lib/hooks';
import { VB_H, VB_W } from './drawing';

const noopSubscribe = () => () => {};
/** false en el servidor y durante la hidratación; true después (sin setState en efectos). */
const useHydrated = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

const LIT_RADIUS = 90; // px
const EPS = 0.002;
const Y_DAMP = 0.3;

/**
 * Escenario interactivo del HomeSystem.
 * - Pausa todo lo animado cuando sale de pantalla (data-paused).
 * - Solo con puntero fino (y sin `rm` / `lite`): parallax por capas con lerp en un rAF
 *   que se detiene al converger, halo que sigue al cursor, nodos que se encienden cerca
 *   del puntero y resaltado del sistema bajo el cursor. Nada de esto corre en táctiles.
 */
export default function HomeSystemStage({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { rootMargin: '80px 0px' });
  const hydrated = useHydrated();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const html = document.documentElement;
    const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
      el,
      d: Number(el.dataset.depth) || 0,
    }));
    const halo = root.querySelector<HTMLElement>('.hs-halo');
    const nodes = Array.from(root.querySelectorAll<SVGCircleElement>('.hs-node')).map((el) => ({
      el,
      x: Number(el.dataset.x),
      y: Number(el.dataset.y),
      lit: false,
    }));

    // Estado del bucle (normalizado −1..1 para el parallax; px para el halo).
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const pt = { x: 0, y: 0 };
    const hp = { x: 0, y: 0 };
    let rect: DOMRect | null = null;
    let raf = 0;
    let inside = false;
    let pointerDirty = false;
    let focus = '';
    let enabled = false;

    const readRect = () => {
      rect = root.getBoundingClientRect();
    };

    const setRaf = (on: boolean) => {
      root.dataset.raf = on ? 'on' : 'off';
    };

    const updateNodes = () => {
      if (!rect) return;
      // Misma geometría que preserveAspectRatio="xMidYMid slice".
      const s = Math.max(rect.width / VB_W, rect.height / VB_H);
      const ox = (rect.width - VB_W * s) / 2;
      const oy = (rect.height - VB_H * s) / 2;
      for (const n of nodes) {
        const dx = ox + n.x * s - pt.x;
        const dy = oy + n.y * s - pt.y;
        const lit = inside && dx * dx + dy * dy < LIT_RADIUS * LIT_RADIUS;
        if (lit !== n.lit) {
          n.lit = lit;
          n.el.classList.toggle('is-lit', lit);
        }
      }
    };

    const frame = () => {
      raf = 0;
      cur.x += (target.x - cur.x) * 0.09;
      cur.y += (target.y - cur.y) * 0.09;
      hp.x += (pt.x - hp.x) * 0.2;
      hp.y += (pt.y - hp.y) * 0.2;
      for (const l of layers) {
        // El eje vertical se amortigua: las guías del rótulo HOGAR viajan por un hueco
        // de 6 u entre franjas del techo y no deben pisarlas.
        l.el.style.transform = `translate3d(${(cur.x * l.d).toFixed(2)}px, ${(cur.y * l.d * Y_DAMP).toFixed(2)}px, 0)`;
      }
      if (halo) halo.style.transform = `translate3d(${hp.x.toFixed(1)}px, ${hp.y.toFixed(1)}px, 0)`;
      if (pointerDirty) {
        pointerDirty = false;
        updateNodes();
      }
      const settled =
        Math.abs(target.x - cur.x) < EPS &&
        Math.abs(target.y - cur.y) < EPS &&
        Math.abs(pt.x - hp.x) < 0.5 &&
        Math.abs(pt.y - hp.y) < 0.5;
      if (settled) {
        setRaf(false);
      } else {
        raf = requestAnimationFrame(frame);
      }
    };

    const kick = () => {
      if (!raf) {
        raf = requestAnimationFrame(frame);
        setRaf(true);
      }
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      readRect();
      inside = true;
      if (rect) {
        // El halo aparece donde entra el puntero (sin viajar desde la esquina).
        pt.x = hp.x = e.clientX - rect.left;
        pt.y = hp.y = e.clientY - rect.top;
      }
      root.dataset.pointer = 'on';
      onMove(e);
    };

    const onMove = (e: PointerEvent) => {
      if (!inside || !rect) return;
      pt.x = e.clientX - rect.left;
      pt.y = e.clientY - rect.top;
      target.x = Math.max(-1, Math.min(1, (pt.x / rect.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, (pt.y / rect.height) * 2 - 1));
      pointerDirty = true;
      kick();
    };

    const setFocus = (sys: string) => {
      if (sys === focus) return;
      focus = sys;
      if (sys) root.dataset.focus = sys;
      else delete root.dataset.focus;
    };

    const onOver = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest<HTMLElement | SVGElement>('[data-sys]');
      setFocus(t?.dataset.sys ?? '');
    };

    const onLeave = () => {
      inside = false;
      target.x = 0;
      target.y = 0;
      pointerDirty = true;
      delete root.dataset.pointer;
      setFocus('');
      kick();
    };

    const invalidate = () => {
      if (inside) readRect();
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      root.dataset.interactive = 'true';
      root.addEventListener('pointerenter', onEnter);
      root.addEventListener('pointermove', onMove, { passive: true });
      root.addEventListener('pointerover', onOver, { passive: true });
      root.addEventListener('pointerleave', onLeave);
      window.addEventListener('scroll', invalidate, { passive: true });
      window.addEventListener('resize', invalidate, { passive: true });
    };

    const disable = () => {
      if (!enabled) return;
      enabled = false;
      delete root.dataset.interactive;
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerover', onOver);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      setRaf(false);
      inside = false;
      cur.x = cur.y = target.x = target.y = 0;
      for (const l of layers) l.el.style.transform = '';
      if (halo) halo.style.transform = '';
      for (const n of nodes) {
        n.lit = false;
        n.el.classList.remove('is-lit');
      }
      delete root.dataset.pointer;
      setFocus('');
    };

    const sync = () => {
      const allowed =
        mqFine.matches && !mqReduce.matches && !html.classList.contains('rm') && !html.classList.contains('lite');
      if (allowed) enable();
      else disable();
    };

    sync();
    setRaf(false);
    mqFine.addEventListener('change', sync);
    mqReduce.addEventListener('change', sync);
    return () => {
      mqFine.removeEventListener('change', sync);
      mqReduce.removeEventListener('change', sync);
      disable();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="hs-stage"
      role="img"
      aria-label={label}
      data-paused={hydrated && !inView ? 'true' : undefined}
    >
      {children}
    </div>
  );
}
