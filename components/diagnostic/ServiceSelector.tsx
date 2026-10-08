import { SYSTEMS, type SystemId } from '@/lib/content';
import { IconArrowRight, IconCheck } from '@/components/ui/Icons';
import { ServiceGlyph, SystemPattern } from './glyphs';
import { Segments, IconRestart } from './bits';
import type { Answers } from './model';

/** Paso 1 — ¿QUÉ NECESITAS? Cuatro opciones grandes unidas como un panel. */
export function ServiceSelector({
  a,
  onPick,
  onRestart,
  animate = false,
}: {
  a: Answers;
  onPick: (id: SystemId) => void;
  onRestart: () => void;
  /** Entrada animada solo al volver desde la consola (no en la carga inicial). */
  animate?: boolean;
}) {
  return (
    <div className={animate ? 'dx-panel dx-enter' : 'dx-panel'} data-dx-frame>
      <span className="ticks dx-ticks" aria-hidden="true" />
      <div className="dx-bar">
        <div className="dx-bar-head">
          <p className="t-label dx-bar-step">
            <span className="dx-bar-dot" aria-hidden="true" />
            Paso 1/5
          </p>
          <h3 id="dx-q1" className="t-display dx-h3" tabIndex={-1} data-dx-heading>
            ¿Qué necesitas?
          </h3>
        </div>
        <div className="dx-bar-side">
          {a.service && (
            <button type="button" className="dx-ctl dx-ctl--light" onClick={onRestart} data-action="restart">
              <IconRestart size={18} />
              <span>Reiniciar</span>
            </button>
          )}
          <Segments a={a} view={1} />
        </div>
      </div>

      <div role="group" aria-labelledby="dx-q1" className="dx-svcs">
        {SYSTEMS.map((sys) => {
          const on = a.service === sys.id;
          return (
            <button
              key={sys.id}
              type="button"
              className="dx-svc"
              data-sys={sys.id}
              data-service={sys.id}
              aria-pressed={on}
              onClick={() => onPick(sys.id)}
            >
              <SystemPattern id={sys.id} />
              <span className="dx-svc-meta" aria-hidden="true">
                <span className="dx-svc-idx">{sys.index}</span>
                <span className="dx-svc-rule" />
                <span className="dx-svc-sys">{sys.system}</span>
              </span>
              <span className="dx-svc-icon" aria-hidden="true">
                <ServiceGlyph id={sys.id} size={32} className="anim-loop" />
              </span>
              <span className="dx-svc-text">
                <span className="t-display dx-svc-name">{sys.name}</span>
                <span className="dx-svc-q">{sys.question}</span>
              </span>
              <span className="dx-svc-cue" aria-hidden="true">
                <span className="dx-svc-cue-t t-label">{on ? 'Elegido' : 'Empezar'}</span>
                {on ? <IconCheck size={20} /> : <IconArrowRight size={20} className="dx-svc-arrow" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
