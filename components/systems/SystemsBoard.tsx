'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { SYSTEMS } from '@/lib/content';
import { useInView, useIsLite, useMediaQuery, useMotionPaused, usePrefersReducedMotion } from '@/lib/hooks';
import SystemStage from './SystemStage';

const ROTATE_MS = 3500;
const COUNT = SYSTEMS.length;
/** Pasos de la rotación automática por cada entrada en pantalla: una vuelta completa y reposo. */
const TOUR = COUNT;
/** Fracción del escenario que debe verse (bajo la barra fija) para que la rotación corra. */
const SEEN_RATIO = 0.5;

/**
 * true mientras al menos `ratio` del elemento se ve por debajo de la barra fija.
 * Se decide con `intersectionRatio` y no solo con `isIntersecting`: según la especificación
 * `isIntersecting` puede ser true con el primer píxel visible, sea cual sea el umbral
 * (Chrome lo ata al umbral; no todos los navegadores lo hacen).
 */
function useSeen(ref: RefObject<Element | null>, ratio: number): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    const io = new IntersectionObserver(
      ([e]) => setSeen(e.isIntersecting && e.intersectionRatio >= ratio - 0.01),
      { rootMargin: `-${Math.round(nav)}px 0px 0px 0px`, threshold: [0, ratio] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, ratio]);
  return seen;
}

/** Índice de la columna que contiene el nodo del evento (o -1). */
function colIndex(target: EventTarget | null): number {
  if (!(target instanceof Element)) return -1;
  const col = target.closest<HTMLElement>('[data-col]');
  const i = col ? Number(col.dataset.col) : -1;
  return Number.isInteger(i) && i >= 0 && i < COUNT ? i : -1;
}

/**
 * Estado compartido entre el escenario (la línea que se transforma) y las columnas.
 *  - ≥768: hover / foco / clic sobre una columna elige el sistema; rotación automática
 *    cada 3,5 s mientras nadie ha interactuado y el ESCENARIO se ve (no basta con que se
 *    vean las columnas): una vuelta por cada vez que el escenario entra en pantalla.
 *    No rota con movimiento reducido, en equipos limitados (`lite`) ni con las
 *    animaciones pausadas por el visitante (WCAG 2.2.2).
 *  - <768: el escenario es sticky y el bloque que cruza la línea de lectura manda.
 * Las columnas llegan renderizadas desde el servidor (children); aquí solo se delegan eventos.
 */
export default function SystemsBoard({ children }: { children: ReactNode }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [took, setTook] = useState(false);
  const wide = useMediaQuery('(min-width: 768px)');
  const reduced = usePrefersReducedMotion();
  const lite = useIsLite();
  const motionPaused = useMotionPaused();
  /** Algo del panel en pantalla: los bucles corren y el scroll móvil se escucha. */
  const inView = useInView(boardRef);
  /** El escenario (no el panel entero) a la vista: solo entonces rota solo. */
  const stageSeen = useSeen(stageRef, SEEN_RATIO);

  const pick = useCallback((i: number) => {
    if (i < 0) return;
    setTook(true);
    setActive(i);
  }, []);

  // Rotación automática: solo ≥768, con el escenario a la vista, sin interacción, y nunca
  // con movimiento reducido, modo `lite` o animaciones pausadas. Si el escenario sale de
  // pantalla se detiene; al volver empieza otra vuelta completa y reposa.
  useEffect(() => {
    if (!wide || !stageSeen || took || reduced || lite || motionPaused) return;
    let steps = 0;
    const id = window.setInterval(() => {
      steps++;
      setActive((a) => (a + 1) % COUNT);
      if (steps >= TOUR) window.clearInterval(id);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [wide, stageSeen, took, reduced, lite, motionPaused]);

  // Móvil: el bloque que cruza la línea de lectura (debajo del escenario sticky) manda.
  useEffect(() => {
    if (wide || !inView) return;
    const board = boardRef.current;
    const list = colsRef.current;
    if (!board || !list) return;
    const stage = board.querySelector<HTMLElement>('.sys-stage');
    const cols = Array.from(list.querySelectorAll<HTMLElement>('[data-col]'));
    if (!stage || cols.length === 0) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const vh = window.innerHeight;
      const sb = Math.max(0, Math.min(vh * 0.5, stage.getBoundingClientRect().bottom));
      const lineY = sb + (vh - sb) * 0.4;
      let idx = -1;
      for (let i = 0; i < cols.length; i++) {
        const r = cols[i].getBoundingClientRect();
        if (r.top <= lineY && r.bottom > lineY) {
          idx = i;
          break;
        }
      }
      if (idx === -1) {
        if (cols[0].getBoundingClientRect().top > lineY) idx = 0;
        else if (cols[cols.length - 1].getBoundingClientRect().bottom <= lineY) idx = cols.length - 1;
      }
      if (idx >= 0) setActive(idx);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [wide, inView]);

  const onPointerOver = (e: PointerEvent<HTMLDivElement>) => {
    if (!wide || e.pointerType === 'touch') return;
    pick(colIndex(e.target));
  };
  const onFocus = (e: FocusEvent<HTMLDivElement>) => pick(colIndex(e.target));
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (wide) pick(colIndex(e.target));
  };

  return (
    <div ref={boardRef} className="sys-board" data-sys={SYSTEMS[active].id} data-active={active}>
      <SystemStage active={active} paused={!inView} stageRef={stageRef} />
      <div ref={colsRef} className="sys-cols-wrap" onPointerOver={onPointerOver} onFocus={onFocus} onClick={onClick}>
        {children}
      </div>
    </div>
  );
}
