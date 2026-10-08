import type { SystemId } from '@/lib/content';

/**
 * Gráficos propios del diagnóstico (SVG en línea, trazo 1.75 con extremos redondeados,
 * el mismo lenguaje de components/ui/Icons.tsx). Todos decorativos: aria-hidden.
 */

/* ------------------------------------------------------------------ */
/*  Utilidades deterministas (sin Math.random: mismo SVG en servidor)  */
/* ------------------------------------------------------------------ */
function wave(x0: number, x1: number, y: number, amp: number, period: number, phase = 0, step = 4): string {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += step) {
    const v = y + amp * Math.sin(((x + phase) / period) * Math.PI * 2);
    pts.push(`${x === x0 ? 'M' : 'L'}${x} ${v.toFixed(1)}`);
  }
  return pts.join(' ');
}

/* ------------------------------------------------------------------ */
/*  Íconos animables por sistema                                       */
/* ------------------------------------------------------------------ */
export function ServiceGlyph({ id, size = 32, className }: { id: SystemId; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      data-glyph={id}
    >
      {id === 'electricidad' && (
        <>
          <path className="dx-g-bolt" d="M13.2 2.6 5.6 13.4h5.6l-1.1 8 7.7-11h-5.7l1.1-7.8Z" />
          <path className="dx-g-spark" d="M18.4 3.6 20.2 2.2" />
          <path className="dx-g-spark" d="M19.4 6.8h2.2" />
          <path className="dx-g-spark" d="M4.6 18.8 2.8 20.2" />
        </>
      )}
      {id === 'plomeria' && (
        <>
          <g className="dx-g-drop">
            <path d="M12 2.6c3.1 3.9 5.6 7 5.6 10.2a5.6 5.6 0 0 1-11.2 0c0-3.2 2.5-6.3 5.6-10.2Z" />
            <path d="M9.3 13.6a2.8 2.8 0 0 0 2.3 2.5" />
          </g>
          <ellipse className="dx-g-ripple" cx="12" cy="21.2" rx="6.2" ry="1.3" strokeWidth={1.25} />
        </>
      )}
      {id === 'gas' && (
        <>
          <path
            className="dx-g-flame-o"
            d="M12 21.4c-3.5 0-6.2-2.5-6.2-5.9 0-3.1 2-5 3.5-7.1.3 1.5 1.1 2.5 2.2 3 .1-2.9 1.3-5.4 3.6-7.6-.2 2.7.8 4.6 2 6.4 1 1.5 1.9 3.1 1.9 5.3 0 3.4-2.6 5.9-7 5.9Z"
          />
          <path
            className="dx-g-flame-i"
            d="M12 21.4c-1.5 0-2.6-1-2.6-2.5 0-1.4 1-2.3 2.1-3.4.4 1 1 1.5 1.7 1.7.6.8.9 1.3.9 1.9 0 1.3-.9 2.3-2.1 2.3Z"
          />
        </>
      )}
      {id === 'hogar' && (
        <>
          <path className="dx-g-draw" pathLength={1} d="M3.4 11.2 12 4l8.6 7.2" />
          <path className="dx-g-draw dx-g-draw-2" pathLength={1} d="M5.6 9.6V20h12.8V9.6" />
          <path className="dx-g-draw dx-g-draw-3" pathLength={1} d="M10 20v-5.6h4V20" />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Patrón de fondo de cada sistema (aparece al pasar el puntero)     */
/* ------------------------------------------------------------------ */
// Zona libre arriba a la derecha de cada columna (al lado del ícono): el patrón no pasa por detrás del texto.
const WAVES = [0, 1, 2].map((i) => wave(150, 330, 64 + i * 22, 5, 60, i * 15));
const GAS_LINES = [0, 1, 2, 3, 4].map((i) => wave(158, 330, 52 + i * 18, 2, 150, i * 30, 6));
const ROOF = Array.from({ length: 6 }, (_, k) => {
  const y = 30 + (k + 1) * 11;
  const half = (k + 1) * 11;
  return `M${250 - half} ${y}H${250 + half}`;
}).join(' ');
const TRACE_A = 'M330 50H236a8 8 0 0 0-8 8v22a8 8 0 0 1-8 8h-58';
const TRACE_B = 'M330 82h-30a8 8 0 0 0-8 8v30a8 8 0 0 1-8 8h-52';

export function SystemPattern({ id }: { id: SystemId }) {
  return (
    <svg
      className="dx-pattern"
      viewBox="0 0 320 320"
      preserveAspectRatio="xMaxYMin slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {id === 'electricidad' && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path className="dx-pat-line" d={TRACE_A} />
          <path className="dx-pat-line" d={TRACE_B} />
          <path className="dx-pat-flow anim-loop" pathLength={100} d={TRACE_A} />
          <circle className="dx-pat-node" cx="162" cy="88" r="3.4" />
          <circle className="dx-pat-node" cx="232" cy="128" r="3.4" />
          <circle className="dx-pat-node" cx="300" cy="50" r="3.4" />
        </g>
      )}
      {id === 'plomeria' && (
        <g strokeLinecap="round" strokeLinejoin="round">
          {WAVES.map((d, i) => (
            <path key={i} className="dx-pat-line" d={d} />
          ))}
          <path className="dx-pat-flow dx-pat-flow-slow anim-loop" pathLength={100} d={WAVES[1]} />
        </g>
      )}
      {id === 'gas' && (
        <g strokeLinecap="round">
          {GAS_LINES.map((d, i) => (
            <path key={i} className="dx-pat-dash anim-loop" d={d} style={{ animationDelay: `${i * -0.6}s` }} />
          ))}
        </g>
      )}
      {id === 'hogar' && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path className="dx-pat-line" d={ROOF} />
          <path className="dx-pat-line" d="M196 104v36M304 104v36M178 140h150M238 140v-22h24v22" />
          <path className="dx-pat-flow dx-pat-flow-slow anim-loop" pathLength={100} d="M178 140h150" />
        </g>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini osciloscopio de la consola                                    */
/* ------------------------------------------------------------------ */
const SCOPE_W = 280;
const SCOPE_H = 84;
export const SCOPE_TRACE: Record<SystemId | 'none', string> = {
  electricidad:
    'M0 54H34l8-28 8 32 8-36 8 32H110l8-24 8 32 8-36 8 28H186l8-26 8 32 8-36 8 30H280',
  plomeria: wave(0, 280, 42, 15, 70, 0, 4),
  gas: wave(0, 280, 44, 6, 140, 20, 4),
  hogar: 'M0 64H60V40L100 14l40 26v24H164V50h18v14H280',
  none: 'M0 42H280',
};

export function Scope({ sys, done }: { sys: SystemId | null; done: boolean }) {
  const d = SCOPE_TRACE[sys ?? 'none'];
  return (
    <svg
      className="dx-scope"
      data-done={done ? 'true' : 'false'}
      viewBox={`0 0 ${SCOPE_W} ${SCOPE_H}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g className="dx-scope-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <path key={`v${i}`} d={`M${i * 40} 0V${SCOPE_H}`} />
        ))}
        {[1, 2, 3].map((i) => (
          <path key={`h${i}`} d={`M0 ${i * 21}H${SCOPE_W}`} />
        ))}
      </g>
      {/* key: al cambiar de servicio la traza se vuelve a dibujar */}
      <g key={sys ?? 'none'}>
        <path className="dx-scope-trace" pathLength={100} d={d} />
        <path className="dx-scope-pulse anim-loop" pathLength={100} d={d} />
      </g>
      <rect className="dx-scope-sweep anim-loop" x="0" y="0" width="1.5" height={SCOPE_H} />
    </svg>
  );
}
