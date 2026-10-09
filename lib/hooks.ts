'use client';

import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';

/** Suscripción a una media query (SSR: devuelve `serverValue`). */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
/** Puntero fino con hover (mouse / trackpad). En táctiles es false. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');

/** true si el script de arranque marcó el equipo como limitado (ahorro de datos, 2G…). */
export function useIsLite(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => document.documentElement.classList.contains('lite'),
    () => false,
  );
}

/** Observa una clase de <html> (p. ej. 'motion-paused', 'lite', 'rm'). SSR: false. */
export function useHtmlClass(name: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mo = new MutationObserver(onChange);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => mo.disconnect();
    },
    () => document.documentElement.classList.contains(name),
    () => false,
  );
}

/** true si el visitante pausó las animaciones con el botón del footer (WCAG 2.2.2). */
export const useMotionPaused = () => useHtmlClass('motion-paused');

/**
 * Observa si un elemento está en pantalla. `once` deja de observar tras la primera entrada.
 * Pensado también para pausar animaciones decorativas fuera de pantalla.
 */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = '0px', threshold = 0, once = false }: { rootMargin?: string; threshold?: number; once?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    // Con threshold > 0 se exige la proporción visible (o que llene esa fracción de la
    // pantalla, para elementos más altos que ella): isIntersecting por sí solo puede ser
    // true desde el primer píxel en algunos navegadores.
    const steps = threshold > 0 ? Array.from({ length: 11 }, (_, i) => i / 10) : 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        const fills = entry.rootBounds ? entry.intersectionRect.height >= entry.rootBounds.height * threshold : false;
        const visible = threshold > 0 ? entry.isIntersecting && (entry.intersectionRatio >= threshold || fills) : entry.isIntersecting;
        setInView(visible);
        if (visible && once) io.disconnect();
      },
      { rootMargin, threshold: steps },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, once]);
  return inView;
}
