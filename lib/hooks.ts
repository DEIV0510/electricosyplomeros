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
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, once]);
  return inView;
}
