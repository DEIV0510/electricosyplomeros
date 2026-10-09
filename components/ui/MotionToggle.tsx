'use client';

import { useMotionPaused } from '@/lib/hooks';
import { cx } from './Cta';

/**
 * Pausa / reanuda las animaciones decorativas en bucle (WCAG 2.2.2).
 * Pone o quita `motion-paused` en <html> y lo recuerda en localStorage ('ep-motion').
 * Todo bucle lleva `.anim-loop`, y los bucles en JS consultan useMotionPaused().
 */
export default function MotionToggle({ className }: { className?: string }) {
  const paused = useMotionPaused();
  const toggle = () => {
    const c = document.documentElement.classList;
    const next = !c.contains('motion-paused');
    c.toggle('motion-paused', next);
    try {
      if (next) localStorage.setItem('ep-motion', 'paused');
      else localStorage.removeItem('ep-motion');
    } catch {
      /* almacenamiento bloqueado: la pausa vale solo para esta visita */
    }
  };
  return (
    <button type="button" onClick={toggle} aria-pressed={paused} className={cx('motion-toggle', className)}>
      <span aria-hidden="true" className="motion-toggle-icon">
        {paused ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3.5 2.2v9.6L11.6 7z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="3" y="2.5" width="2.6" height="9" />
            <rect x="8.4" y="2.5" width="2.6" height="9" />
          </svg>
        )}
      </span>
      <span>{paused ? 'Reanudar animaciones' : 'Pausar animaciones'}</span>
    </button>
  );
}
