import type { CSSProperties } from 'react';
import Logo from '@/components/ui/Logo';

/**
 * Pantalla de carga "SISTEMA LISTO" (DESIGN.md §6 y §7.1).
 *
 * Componente de servidor y solo CSS: el script del <head> (lib/boot.ts) decide si se
 * muestra (html.is-booting), cuándo sale (html.boot-done) y cuándo se retira (boot-end).
 * Sin JS nunca aparece. Todo es decorativo: el contenedor va con aria-hidden.
 *
 * Línea de tiempo (ms desde el primer pintado). boot-done llega 950 ms después del primer
 * fotograma (lib/boot.ts), así que "● SISTEMA LISTO" queda ~500 ms en pantalla antes de salir:
 *   0     logo, circuito apagado y "SOLUCIONES EFICIENTES" ya visibles
 *   30    el pulso sale de la fuente y recorre el circuito (320 ms)
 *   ~90   ELECTRICIDAD · ~165 AGUA · ~245 GAS · ~320 HOGAR se encienden al paso
 *   330   el trazo cierra en un rombo de franjas (eco del logo)
 *   380   "SOLUCIONES EFICIENTES" cede el paso a "● SISTEMA LISTO" (entra a los 420)
 *   950   boot-done: el panel sube
 * Si boot-done llega antes, todo salta al estado final mientras el panel sube.
 *
 * El logo NO lleva `priority`: con loading="lazy" no se descarga cuando la pantalla de
 * carga no se muestra (display:none). Cuando sí se muestra, lib/boot.ts inyecta un
 * <link rel="preload"> con los mismos srcset/sizes para que esté desde el primer fotograma.
 */

type Node = { id: string; label: string; x: number; delay: number; color: string; side: 'top' | 'bottom' };

// x = posición en el ancho del circuito; delay = momento en que el pulso pasa por el nodo
// (30 ms de salida + 320 ms de recorrido × fracción de la pista hasta el nodo).
const NODES: Node[] = [
  { id: 'electricidad', label: 'Electricidad', x: 17, delay: 90, color: 'var(--color-power)', side: 'bottom' },
  { id: 'agua', label: 'Agua', x: 39, delay: 166, color: 'var(--color-water)', side: 'top' },
  { id: 'gas', label: 'Gas', x: 61, delay: 243, color: 'var(--color-gas)', side: 'bottom' },
  { id: 'hogar', label: 'Hogar', x: 83, delay: 320, color: 'var(--color-violet)', side: 'top' },
];

// Franjas del rombo final (centro de cada franja dentro de un rombo de 36×36).
const STRIPES = [9, 13.5, 18, 22.5, 27];

export default function LoadingScreen() {
  return (
    <div id="boot" className="boot-root" aria-hidden="true">
      <div className="boot-panel">
        <div className="boot-grid" />
        <div className="boot-stage">
          {/* sizes debe coincidir con el preload de lib/boot.ts */}
          <Logo className="boot-logo" sizes="(min-width: 540px) 420px, 78vw" alt="" />

          <div className="boot-circuit">
            <span className="boot-track">
              <span className="boot-fill">
                <span className="boot-head" />
              </span>
            </span>
            <span className="boot-src" />
            {NODES.map((n) => (
              <span
                key={n.id}
                className="boot-node"
                data-side={n.side}
                style={{ '--x': `${n.x}%`, '--d': `${n.delay}ms`, '--c': n.color } as CSSProperties}
              >
                <span className="boot-node-halo" />
                <span className="boot-node-core" />
                <span className="boot-node-tick" />
                <span className="boot-node-label">{n.label}</span>
              </span>
            ))}
            <svg className="boot-mark" viewBox="0 0 36 36" width="36" height="36" focusable="false">
              <defs>
                <clipPath id="boot-mark-clip">
                  <path d="M18 1.5 34.5 18 18 34.5 1.5 18Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#boot-mark-clip)">
                {STRIPES.map((y, i) => (
                  <rect
                    key={y}
                    className="boot-mark-stripe"
                    x="0"
                    y={y - 1.25}
                    width="36"
                    height="2.5"
                    style={{ '--i': i } as CSSProperties}
                  />
                ))}
              </g>
              <path className="boot-mark-outline" d="M1.5 18 18 1.5 34.5 18 18 34.5Z" pathLength={100} />
            </svg>
          </div>

          <p className="boot-status t-label">
            <span className="boot-status-a">Soluciones eficientes</span>
            <span className="boot-status-b">
              <span className="boot-status-dot" />
              Sistema listo
            </span>
          </p>
        </div>
        <div className="boot-edge" />
      </div>
    </div>
  );
}
