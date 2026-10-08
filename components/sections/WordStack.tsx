'use client';

import { useRef, type CSSProperties } from 'react';
import { useInView } from '@/lib/hooks';
import { cx } from '@/components/ui/Cta';
import PowerRing from './PowerRing';

const WORDS = ['Arreglamos', 'Ayudamos', 'Resolvemos', 'Solucionamos.'] as const;

/**
 * Pila ARREGLAMOS → AYUDAMOS → RESOLVEMOS → SOLUCIONAMOS.
 * Un pulso baja por el cable una sola vez al entrar en pantalla y enciende cada palabra.
 * El estado final (sin JS, con movimiento reducido o tras la secuencia) es el mismo
 * marcado: las tres primeras en mist-3 y la última en verde con el anillo encendido.
 */
export default function WordStack() {
  const ref = useRef<HTMLDivElement>(null);
  // Arranca una vez cuando la pila ya se ve bien; el segundo observador solo pausa el halo.
  const run = useInView(ref, { once: true, threshold: 0.45 });
  const onScreen = useInView(ref, { rootMargin: '120px 0px' });

  return (
    <div className="nf-stack-wrap">
      <p className="sr-only">No solo arreglamos: ayudamos, resolvemos y solucionamos.</p>
      <div
        ref={ref}
        aria-hidden="true"
        className={cx('nf-stack', run && 'is-run')}
        data-paused={onScreen ? undefined : 'true'}
      >
        <span className="nf-cable">
          <span className="nf-fill" />
          <span className="nf-track">
            <span className="nf-pulse" />
          </span>
        </span>
        {WORDS.map((word, i) => {
          const last = i === WORDS.length - 1;
          return (
            <div key={word} className={cx('nf-row', last && 'nf-row--end')} style={{ '--i': i } as CSSProperties}>
              <span className="nf-node">
                {last ? (
                  <>
                    <span className="nf-halo">
                      <span className="nf-halo-in anim-loop" />
                    </span>
                    <PowerRing className="nf-ring nf-ring--base" strokeWidth={3} />
                    <PowerRing
                      className="nf-ring nf-ring--lit"
                      strokeWidth={3.4}
                      arcClassName="nf-ring-arc"
                      barClassName="nf-ring-bar"
                    />
                    <span className="nf-dia nf-dia--end" />
                  </>
                ) : (
                  <span className="nf-dia" />
                )}
              </span>
              <span className="nf-word">
                <span className="nf-base">{word}</span>
                <span className="nf-lit">{word}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
