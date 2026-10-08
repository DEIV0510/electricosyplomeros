'use client';

import { useSyncExternalStore } from 'react';

/**
 * Suscripción compartida a scroll/resize agrupada en un solo requestAnimationFrame.
 * Cada componente lee lo que necesita en `read` (solo lecturas: nada de escribir estilos
 * aquí) y React vuelve a pintar únicamente si el valor cambió.
 */
const listeners = new Set<() => void>();
let raf = 0;

function flush() {
  raf = 0;
  listeners.forEach((l) => l());
}
function schedule() {
  if (!raf) raf = requestAnimationFrame(flush);
}

function subscribe(cb: () => void) {
  if (listeners.size === 0) {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

/** `read` debe devolver un primitivo (boolean, string, number) para comparar por valor. */
export function useScrollSnapshot<T extends string | number | boolean>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribe, read, () => serverValue);
}
