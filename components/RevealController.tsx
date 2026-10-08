'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __epRevealFallback?: number;
  }
}

/**
 * Activa los `[data-reveal]` cuando entran en pantalla (añade `.is-in`).
 * Cancela la red de seguridad del script de arranque al montar.
 * Retardo escalonado opcional: style={{ '--reveal-delay': '120ms' }}.
 */
export default function RevealController() {
  useEffect(() => {
    if (window.__epRevealFallback) window.clearTimeout(window.__epRevealFallback);
    const root = document.documentElement;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'));
    if (root.classList.contains('rm') || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    );
    nodes.forEach((n) => io.observe(n));

    // Saltos de scroll (anclas, teclado End) pueden dejar atrás elementos sin revelar:
    // todo lo que ya quedó por encima del viewport se muestra.
    let raf = 0;
    const sweep = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const n of nodes) {
        if (!n.classList.contains('is-in') && n.getBoundingClientRect().top < vh * 0.92) {
          n.classList.add('is-in');
          io.unobserve(n);
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.setTimeout(sweep, 120);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', sweep);
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', sweep);
      if (raf) window.clearTimeout(raf);
    };
  }, []);
  return null;
}
