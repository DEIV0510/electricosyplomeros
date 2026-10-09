import type { MouseEvent } from 'react';
import { CITIES, DIAGNOSTIC } from '@/lib/content';
import { cx } from '@/components/ui/Cta';
import { IconAlert, IconArrowLeft, IconArrowRight, IconCheck, IconCopy, IconEdit, IconWhatsApp } from '@/components/ui/Icons';
import { Scope } from './glyphs';
import { IconChevron, IconRestart, Segments } from './bits';
import {
  DETAILS_MAX,
  DETAILS_MIN,
  STEPS,
  STEP_META,
  isAnswered,
  orderedProblems,
  systemOf,
  valueText,
  type StepNo,
  type View,
} from './model';
import type { DxState, FieldHint } from './DiagnosticTool';

type PickKey = 'problem' | 'place' | 'city';

type ConsoleProps = {
  s: DxState;
  message: string;
  url: string;
  onPick: (key: PickKey, id: string) => void;
  onGo: (view: View, field?: FieldHint) => void;
  onBack: () => void;
  onRestart: () => void;
  onDetails: (v: string) => void;
  onName: (v: string) => void;
  onSubmitDetails: () => void;
  onCta: (e: MouseEvent<HTMLAnchorElement>) => void;
  onCopy: () => void;
  onToggleReadout: () => void;
  onFieldFocus: (on: boolean) => void;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Consola de diagnóstico (pasos 2–5 y resultado): panel `night` tipo equipo de medición. */
export function Console(p: ConsoleProps) {
  const { s } = p;
  const sys = systemOf(s.a.service);
  const isResult = s.view === 'result';

  return (
    <div className="dx-console on-dark" data-sys={s.a.service ?? undefined} data-dx-frame>
      <span className="ticks dx-ticks" aria-hidden="true" />

      {/* Barra superior */}
      <div className="dx-cbar" data-dx-bar>
        <button type="button" className="dx-ctl dx-cbar-back" onClick={p.onBack} data-action="back">
          <IconArrowLeft size={18} />
          <span>Atrás</span>
        </button>
        <p className="t-label dx-cbar-label">
          <span className="dx-cbar-title">
            <span className="dx-bar-dot" aria-hidden="true" />
            Diagnóstico
          </span>
          <span className="dx-cbar-step">{isResult ? 'Resultado' : `Paso ${s.view}/5`}</span>
        </p>
        <div className="dx-cbar-segs">
          <Segments a={s.a} view={s.view} />
        </div>
        <button type="button" className="dx-ctl dx-ctl--ghost dx-cbar-restart" onClick={p.onRestart} data-action="restart">
          <IconRestart size={18} />
          <span>Reiniciar</span>
        </button>
      </div>

      <div className="dx-cbody">
        <Readout {...p} sysLabel={sys ? `${sys.index} · ${sys.system}` : '—'} />

        <div className="dx-main">
          <div key={String(s.view)} className="dx-q" data-dir={s.dir}>
            {s.view === 2 && (
              <OptionStep
                step={2}
                options={orderedProblems(s.a.service)}
                value={s.a.problem}
                onPick={(id) => p.onPick('problem', id)}
                cols={3}
              />
            )}
            {s.view === 3 && (
              <OptionStep
                step={3}
                options={[...DIAGNOSTIC.places]}
                value={s.a.place}
                onPick={(id) => p.onPick('place', id)}
                cols={3}
              />
            )}
            {s.view === 4 && <CityStep value={s.a.city} onPick={(id) => p.onPick('city', id)} />}
            {s.view === 5 && <DetailsStep {...p} />}
            {isResult && <Result {...p} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lectura: resumen vivo + osciloscopio                               */
/* ------------------------------------------------------------------ */
function Readout({ s, message, onGo, onToggleReadout, sysLabel }: ConsoleProps & { sysLabel: string }) {
  const isResult = s.view === 'result';
  const done = STEPS.filter((step) => isAnswered(s.a, step)).length;
  const summary = isResult
    ? 'Así llega tu mensaje'
    : STEPS.slice(0, 4)
        .map((step) => valueText(s.a, step) ?? '—')
        .join(' · ');
  // Para lectores de pantalla: solo lo respondido (sin las rayas "—" de los pendientes).
  const answered = STEPS.slice(0, 4)
    .map((step) => valueText(s.a, step))
    .filter(Boolean)
    .join(', ');
  const spokenSummary = isResult
    ? 'Mensaje: así llega tu mensaje'
    : `Lectura ${done} de 5${answered ? `: ${answered}` : ''}`;

  return (
    <aside className="dx-readout" data-open={s.readoutOpen ? 'true' : 'false'} aria-label="Lectura del diagnóstico">
      <button
        type="button"
        className="dx-readout-toggle"
        aria-expanded={s.readoutOpen}
        aria-controls="dx-readout-body"
        onClick={onToggleReadout}
      >
        <span className="t-label dx-readout-k" aria-hidden="true">
          {isResult ? 'Mensaje' : `Lectura ${done}/5`}
        </span>
        <span className="dx-readout-sum" aria-hidden="true">
          {summary}
        </span>
        <span className="sr-only">{spokenSummary}</span>
        <IconChevron size={20} className="dx-readout-chev" />
      </button>

      <div id="dx-readout-body" className="dx-readout-body">
        <div className="dx-readout-head">
          <span className="t-label">{isResult ? 'Lectura completa' : 'Lectura'}</span>
          <span className="t-label dx-readout-sys">{sysLabel}</span>
        </div>
        <div className="dx-scope-wrap">
          <Scope sys={s.a.service} done={isResult} run={String(s.view)} />
          <span className="t-label dx-scope-tag">{isResult ? 'Listo' : 'En curso'}</span>
        </div>

        {isResult ? (
          <div className="dx-preview">
            <p className="t-label dx-preview-k">Vista previa del mensaje</p>
            <p className="dx-preview-msg">{message}</p>
          </div>
        ) : (
          <ul className="dx-rows">
            {STEPS.map((step) => {
              const v = valueText(s.a, step);
              const current = s.view === step;
              // Nombre accesible limpio: "Lugar: pendiente. Ir a este paso" (sin leer la raya).
              const cut = v && v.length > 60 ? `${v.slice(0, 57).trimEnd()}…` : v;
              // Sin puntuación final: evita "…baño.. Cambiar".
              const spoken = cut?.replace(/[.!?¡¿…,;:]+$/u, '');
              return (
                <li key={step}>
                  <button
                    type="button"
                    className="dx-row"
                    data-done={v ? 'true' : 'false'}
                    aria-current={current ? 'step' : undefined}
                    aria-label={`${STEP_META[step].label}: ${spoken ?? 'pendiente'}. ${v ? 'Cambiar' : 'Ir a este paso'}`}
                    onClick={() => onGo(step)}
                    data-row={step}
                  >
                    <span className="t-label dx-row-k">{STEP_META[step].label}</span>{' '}
                    <span className="dx-row-v">{v ?? <span aria-hidden="true">—</span>}</span>
                    <span className="dx-row-s" aria-hidden="true">
                      {v ? <IconCheck size={16} strokeWidth={2.25} /> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Pregunta con opciones de un toque                                   */
/* ------------------------------------------------------------------ */
function StepHead({ step, id }: { step: StepNo; id: string }) {
  const meta = STEP_META[step];
  return (
    <div className="dx-qhead">
      <p className="t-label dx-qhead-k" aria-hidden="true">
        <span className="dx-qhead-n">{pad(step)}</span>
        <span className="dx-qhead-rule" />
        {meta.label}
      </p>
      <h3 id={id} className="t-display dx-h3 dx-h3--q" tabIndex={-1} data-dx-heading>
        {meta.question}
      </h3>
      {meta.hint && (
        <p id={`${id}-hint`} className="dx-qhead-hint">
          {meta.hint}
        </p>
      )}
    </div>
  );
}

function OptionStep({
  step,
  options,
  value,
  onPick,
  cols,
}: {
  step: StepNo;
  options: { id: string; label: string }[];
  value: string | null;
  onPick: (id: string) => void;
  cols: 2 | 3;
}) {
  const hid = `dx-q${step}`;
  return (
    <>
      <StepHead step={step} id={hid} />
      <div
        role="group"
        aria-labelledby={hid}
        aria-describedby={STEP_META[step].hint ? `${hid}-hint` : undefined}
        className={cx('dx-opts', cols === 3 && 'dx-opts--3', options.length % 2 === 1 && 'dx-opts--odd')}
      >
        {options.map((o, i) => {
          const on = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className="dx-opt"
              aria-pressed={on}
              data-option={o.id}
              onClick={() => onPick(o.id)}
            >
              <span className="t-label dx-opt-i" aria-hidden="true">
                {pad(i + 1)}
              </span>
              <span className="dx-opt-l">{o.label}</span>
              <span className="dx-opt-c" aria-hidden="true">
                <IconCheck size={16} strokeWidth={2.5} />
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function CityStep({ value, onPick }: { value: string | null; onPick: (id: string) => void }) {
  return (
    <>
      <StepHead step={4} id="dx-q4" />
      <div role="group" aria-labelledby="dx-q4" aria-describedby="dx-q4-hint" className="dx-opts dx-opts--city">
        {CITIES.map((c) => {
          const on = value === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className="dx-opt dx-opt--city"
              aria-pressed={on}
              data-option={c.id}
              onClick={() => onPick(c.id)}
            >
              <span className="dx-city-top" aria-hidden="true">
                <span className="dx-city-node" />
                <span className="t-label dx-city-region">{c.region}</span>
              </span>
              <span className="t-display dx-city-name">{c.name}</span>
              <span className="t-label dx-city-coords" aria-hidden="true">
                {c.coords}
              </span>
              <span className="dx-opt-c" aria-hidden="true">
                <IconCheck size={16} strokeWidth={2.5} />
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Paso 5: descripción + nombre opcional                              */
/* ------------------------------------------------------------------ */
function DetailsStep({ s, onDetails, onName, onSubmitDetails, onFieldFocus, onGo }: ConsoleProps) {
  const len = s.a.details.trim().length;
  const ok = len >= DETAILS_MIN;
  return (
    <form
      className="dx-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitDetails();
      }}
    >
      <StepHead step={5} id="dx-q5" />

      <div className="dx-field">
        <div className="dx-label-row">
          <label htmlFor="dx-details" className="dx-label">
            Describe lo que pasa
          </label>
          <span className="t-label dx-count" data-ok={ok ? 'true' : 'false'} aria-hidden="true">
            {ok ? (
              <>
                <IconCheck size={14} strokeWidth={2.5} /> {len}
              </>
            ) : (
              `${len}/${DETAILS_MIN}`
            )}
          </span>
        </div>
        <p id="dx-details-help" className="dx-help">
          Por ejemplo: dónde está, desde cuándo pasa o qué ya intentaste.
          <span className="sr-only"> Mínimo {DETAILS_MIN} caracteres.</span>
        </p>
        <textarea
          id="dx-details"
          name="details"
          className="dx-input dx-textarea"
          rows={4}
          maxLength={DETAILS_MAX}
          required
          aria-required="true"
          aria-invalid={s.detailsError}
          aria-describedby="dx-details-help dx-details-err"
          value={s.a.details}
          onChange={(e) => onDetails(e.target.value)}
          onFocus={() => onFieldFocus(true)}
          onBlur={() => onFieldFocus(false)}
        />
        {/* Espacio reservado: el error aparece sin mover el botón de abajo. */}
        <p id="dx-details-err" className="dx-err">
          {s.detailsError && (
            <>
              <IconAlert size={18} />
              <span>Escribe al menos {DETAILS_MIN} caracteres.</span>
            </>
          )}
        </p>
      </div>

      <div className="dx-field dx-field--name">
        <label htmlFor="dx-name" className="dx-label">
          ¿Cómo te llamas? <span className="dx-label-opt">(opcional)</span>
        </label>
        <input
          id="dx-name"
          name="name"
          type="text"
          className="dx-input"
          autoComplete="given-name"
          maxLength={60}
          value={s.a.name}
          onChange={(e) => onName(e.target.value)}
          onFocus={() => onFieldFocus(true)}
          onBlur={() => onFieldFocus(false)}
        />
      </div>

      <div className="dx-form-actions">
        <button type="submit" className="btn btn-primary dx-submit" data-action="summary">
          <span>Ver resumen</span>
          <IconArrowRight size={20} className="btn-arrow" />
        </button>
      </div>
      <MissingSummary missing={s.missing} onGo={onGo} />
    </form>
  );
}

/** Resumen de error con un botón por paso pendiente (role="alert"). */
function MissingSummary({ missing, onGo }: { missing: StepNo[]; onGo: (v: View) => void }) {
  if (!missing.length) return null;
  return (
    <div className="dx-alert" role="alert" data-dx-summary>
      <p className="dx-alert-t">
        <IconAlert size={18} />
        <span>Falta completar {missing.length === 1 ? 'un paso' : `${missing.length} pasos`}:</span>
      </p>
      <ul className="dx-alert-list">
        {missing.map((m) => (
          <li key={m}>
            <button type="button" className="dx-alert-link" onClick={() => onGo(m)}>
              {pad(m)} · {STEP_META[m].label}
              <IconArrowRight size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Resultado + CTA a WhatsApp                                         */
/* ------------------------------------------------------------------ */
function Result({ s, url, message, onGo, onCta, onCopy, onRestart }: ConsoleProps) {
  const rows: { step: StepNo; label: string; value: string | null; field?: FieldHint }[] = STEPS.map((step) => ({
    step,
    label: STEP_META[step].label,
    value: valueText(s.a, step),
    field: step === 5 ? 'details' : undefined,
  }));
  const name = s.a.name.trim();
  if (name) rows.push({ step: 5, label: 'Nombre', value: name, field: 'name' });
  const sending = s.send === 'sending';

  return (
    <div className="dx-result">
      <p className="t-label dx-ok-tag">
        <span className="dx-ok-dot" aria-hidden="true" />
        Diagnóstico listo
      </p>
      <h3 className="t-display dx-h3 dx-h3--result" tabIndex={-1} data-dx-heading>
        Tenemos una idea de lo que necesitas.
      </h3>
      <p className="dx-result-sub">Revisa tus respuestas. Si algo no cuadra, edítalo antes de enviar.</p>

      <dl className="dx-sheet">
        {rows.map((r) => (
          <div key={r.label} className="dx-sheet-row" data-long={r.step === 5 && r.label !== 'Nombre' ? 'true' : undefined}>
            <dt className="t-label dx-sheet-k">{r.label}</dt>
            <dd className="dx-sheet-v">{r.value ?? '—'}</dd>
            <dd className="dx-sheet-act">
              <button
                type="button"
                className="dx-edit"
                onClick={() => onGo(r.step, r.field)}
                aria-label={`Editar ${r.label.toLowerCase()}`}
                data-edit={r.label.toLowerCase()}
              >
                <IconEdit size={16} />
                <span>Editar</span>
              </button>
            </dd>
          </div>
        ))}
      </dl>

      <div className="dx-cta-zone">
        {s.send !== 'sent' ? (
          <>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg dx-cta"
              data-action="whatsapp"
              data-state={s.send}
              aria-describedby="dx-cta-note"
              onClick={onCta}
            >
              <IconWhatsApp size={24} />
              <span className="dx-swap">
                <span data-on={!sending ? 'true' : 'false'}>Hablar con un asesor</span>
                <span data-on={sending ? 'true' : 'false'} className="dx-sending">
                  Abriendo WhatsApp…
                  <span className="dx-pulse anim-loop" aria-hidden="true" />
                </span>
              </span>
              <span className="sr-only"> (se abre WhatsApp)</span>
            </a>
            <p id="dx-cta-note" className="dx-cta-note">
              Se abre WhatsApp con tu mensaje listo. Solo tienes que enviarlo.
            </p>
          </>
        ) : (
          <div className="dx-success" tabIndex={-1} data-dx-success>
            <div className="dx-success-head">
              <span className="dx-success-ring" aria-hidden="true">
                <IconCheck size={22} strokeWidth={2.25} />
              </span>
              <p className="t-title dx-success-t">Listo. Te abrimos WhatsApp con tu mensaje.</p>
            </div>
            <p className="dx-success-again">
              ¿No se abrió?{' '}
              <a href={url} target="_blank" rel="noopener noreferrer" className="dx-link" data-action="whatsapp-again">
                Abrir WhatsApp de nuevo<span className="sr-only"> (se abre WhatsApp)</span>
              </a>
            </p>
            <div className="dx-success-actions">
              <button type="button" className="btn btn-on-dark dx-copy" onClick={onCopy} data-action="copy">
                {s.copy === 'copied' ? <IconCheck size={20} /> : <IconCopy size={20} />}
                <span className="dx-swap">
                  <span data-on={s.copy !== 'copied' ? 'true' : 'false'}>Copiar mensaje</span>
                  <span data-on={s.copy === 'copied' ? 'true' : 'false'}>Mensaje copiado</span>
                </span>
              </button>
              <button type="button" className="dx-ctl dx-again" onClick={onRestart} data-action="again">
                <IconRestart size={20} />
                <span>Empezar otro diagnóstico</span>
              </button>
            </div>
            <p className={cx('dx-copy-status', s.copy === 'error' && 'is-error')}>
              {s.copy === 'error' && (
                <>
                  <IconAlert size={18} />
                  <span>No pudimos copiar. Mantén presionado el texto para copiarlo.</span>
                </>
              )}
              {s.copy === 'copied' && 'Copiado. Pégalo donde lo necesites.'}
            </p>
            {s.copy === 'error' && <p className="dx-preview-msg dx-msg-select">{message}</p>}
          </div>
        )}
        <MissingSummary missing={s.missing} onGo={onGo} />
      </div>
    </div>
  );
}

