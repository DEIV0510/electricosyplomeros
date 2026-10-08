'use client';

import { useEffect, useReducer, useRef, type MouseEvent } from 'react';
import type { SystemId } from '@/lib/content';
import { whatsappUrl } from '@/lib/whatsapp';
import { useFinePointer, useInView } from '@/lib/hooks';
import {
  EMPTY_ANSWERS,
  buildMessage,
  detailsOk,
  missingSteps,
  nextView,
  type Answers,
  type StepNo,
  type View,
} from './model';
import { ServiceSelector } from './ServiceSelector';
import { Console } from './Console';

/* ------------------------------------------------------------------ */
/*  Estado                                                             */
/* ------------------------------------------------------------------ */
export type SendState = 'idle' | 'sending' | 'sent';
export type CopyState = 'idle' | 'copied' | 'error';
type FocusTarget = 'heading' | 'details' | 'summary' | 'success';

export type DxState = {
  view: View;
  dir: 1 | -1;
  a: Answers;
  detailsError: boolean;
  /** Pasos pendientes mostrados en el resumen de error (vacío = sin error). */
  missing: StepNo[];
  send: SendState;
  copy: CopyState;
  readoutOpen: boolean;
  focus: { target: FocusTarget; tick: number; section?: boolean };
};

type PickKey = 'problem' | 'place' | 'city';
type Action =
  | { type: 'service'; id: SystemId }
  | { type: 'pick'; key: PickKey; id: string }
  | { type: 'advance'; from: StepNo }
  | { type: 'go'; view: View }
  | { type: 'back' }
  | { type: 'restart' }
  | { type: 'details'; value: string }
  | { type: 'name'; value: string }
  | { type: 'submitDetails' }
  | { type: 'invalid'; missing: StepNo[] }
  | { type: 'send'; state: SendState }
  | { type: 'copy'; state: CopyState }
  | { type: 'readout' };

const INITIAL: DxState = {
  view: 1,
  dir: 1,
  a: EMPTY_ANSWERS,
  detailsError: false,
  missing: [],
  send: 'idle',
  copy: 'idle',
  readoutOpen: false,
  focus: { target: 'heading', tick: 0 },
};

const order = (v: View) => (v === 'result' ? 6 : v);
const stepKey: Record<PickKey, StepNo> = { problem: 2, place: 3, city: 4 };

function moveTo(s: DxState, view: View, extra?: Partial<DxState>): DxState {
  return {
    ...s,
    ...extra,
    view,
    dir: order(view) < order(s.view) ? -1 : 1,
    send: 'idle',
    copy: 'idle',
    focus: { target: 'heading', tick: s.focus.tick + 1 },
  };
}

function reducer(s: DxState, act: Action): DxState {
  switch (act.type) {
    case 'service': {
      const a = { ...s.a, service: act.id };
      return moveTo(s, nextView(a, 1), { a, missing: s.missing.filter((m) => m !== 1) });
    }
    case 'pick': {
      const a = { ...s.a, [act.key]: act.id } as Answers;
      return { ...s, a, missing: s.missing.filter((m) => m !== stepKey[act.key]) };
    }
    case 'advance':
      // Un temporizador viejo no debe mover al usuario si ya cambió de paso.
      if (s.view !== act.from) return s;
      return moveTo(s, nextView(s.a, act.from));
    case 'go':
      return moveTo(s, act.view, { missing: [] });
    case 'back':
      if (s.view === 1) return s;
      return moveTo(s, s.view === 'result' ? 5 : ((s.view - 1) as StepNo), { missing: [] });
    case 'restart':
      return { ...INITIAL, focus: { target: 'heading', tick: s.focus.tick + 1, section: true } };
    case 'details': {
      const ok = detailsOk(act.value);
      return {
        ...s,
        a: { ...s.a, details: act.value },
        // El error se limpia al escribir, en cuanto el texto ya cumple (no en blur).
        detailsError: s.detailsError && !ok,
        missing: ok ? s.missing.filter((m) => m !== 5) : s.missing,
      };
    }
    case 'name':
      return { ...s, a: { ...s.a, name: act.value } };
    case 'submitDetails': {
      const miss = missingSteps(s.a);
      if (!miss.length) return moveTo(s, 'result', { detailsError: false, missing: [] });
      const others = miss.filter((m) => m !== 5);
      return {
        ...s,
        detailsError: miss.includes(5),
        missing: others,
        focus: { target: miss.includes(5) ? 'details' : 'summary', tick: s.focus.tick + 1 },
      };
    }
    case 'invalid':
      return { ...s, missing: act.missing, focus: { target: 'summary', tick: s.focus.tick + 1 } };
    case 'send':
      return {
        ...s,
        send: act.state,
        copy: 'idle',
        focus: act.state === 'sent' ? { target: 'success', tick: s.focus.tick + 1 } : s.focus,
      };
    case 'copy':
      return { ...s, copy: act.state };
    case 'readout':
      return { ...s, readoutOpen: !s.readoutOpen };
  }
}

/* ------------------------------------------------------------------ */
/*  Utilidades del navegador (solo en manejadores y efectos)           */
/* ------------------------------------------------------------------ */
const reducedMotion = () =>
  document.documentElement.classList.contains('rm') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function navHeight(): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
  return Number.isFinite(v) ? v : 64;
}

/**
 * Desplaza lo mínimo para que se vea la acción del paso (`action`) sin esconder el
 * inicio del bloque bajo el navbar. En escritorio el ancla es el panel completo; en
 * móvil (barra de la consola fija) es el bloque de la pregunta, y abajo se deja aire
 * para el botón flotante.
 */
function ensureVisible(action: HTMLElement | null, root: HTMLElement) {
  const bar = root.querySelector<HTMLElement>('[data-dx-bar]');
  const sticky = !!bar && getComputedStyle(bar).position === 'sticky';
  const frame = root.querySelector<HTMLElement>('[data-dx-frame]');
  const anchor = (sticky ? root.querySelector<HTMLElement>('.dx-q') : null) ?? frame;
  if (!anchor) return;
  const top = navHeight() + (sticky && bar ? bar.offsetHeight : 0) + 12;
  const bottom = window.innerHeight - (sticky ? 84 : 16);
  const aTop = anchor.getBoundingClientRect().top;
  let dy = 0;
  if (aTop < top - 1) {
    dy = aTop - top;
  } else if (action) {
    const over = action.getBoundingClientRect().bottom - bottom;
    if (over > 0) dy = Math.min(over, aTop - top);
  }
  if (Math.abs(dy) > 1) window.scrollBy({ top: dy, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */
export default function DiagnosticTool() {
  const [s, dispatch] = useReducer(reducer, INITIAL);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { rootMargin: '120px 0px' });
  const fine = useFinePointer();
  const advanceTimer = useRef(0);
  const sendTimer = useRef(0);

  const message = buildMessage(s.a);
  const url = whatsappUrl(message);

  // Foco y desplazamiento tras cada cambio pedido por el usuario.
  useEffect(() => {
    const { target, tick, section } = s.focus;
    const root = rootRef.current;
    if (!tick || !root) return;
    const sel: Record<FocusTarget, string> = {
      heading: '[data-dx-heading]',
      details: '#dx-details',
      summary: '[data-dx-summary] button',
      success: '[data-dx-success]',
    };
    const el = root.querySelector<HTMLElement>(sel[target]);
    el?.focus({ preventScroll: true });
    if (section) {
      root.closest('section')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    } else if (el) {
      // Paso nuevo: que quepa la pregunta completa (o el CTA del resultado). Errores y éxito: ese bloque.
      const action =
        target === 'heading'
          ? (root.querySelector<HTMLElement>('.dx-q .dx-cta, .dx-q .dx-opts, .dx-q .dx-submit') ??
            root.querySelector<HTMLElement>('[data-dx-frame]'))
          : el;
      ensureVisible(action, root);
    }
  }, [s.focus]);

  // <html data-dx-console="1"> mientras la consola está abierta y en pantalla: el botón
  // flotante de WhatsApp puede ocultarse (la consola ya termina en WhatsApp).
  const consoleOpen = s.view !== 1 && inView;
  useEffect(() => {
    const d = document.documentElement.dataset;
    if (consoleOpen) d.dxConsole = '1';
    else delete d.dxConsole;
  }, [consoleOpen]);

  // Limpieza: temporizadores y marcas en <html> ("campo con foco" oculta el botón flotante).
  useEffect(
    () => () => {
      window.clearTimeout(advanceTimer.current);
      window.clearTimeout(sendTimer.current);
      delete document.documentElement.dataset.inputFocus;
      delete document.documentElement.dataset.dxConsole;
    },
    [],
  );

  const pickService = (id: SystemId) => {
    window.clearTimeout(advanceTimer.current);
    dispatch({ type: 'service', id });
  };

  const pick = (key: PickKey, id: string) => {
    if (s.view === 1 || s.view === 'result' || s.view === 5) return;
    const from = s.view;
    dispatch({ type: 'pick', key, id });
    window.clearTimeout(advanceTimer.current);
    // Breve pausa para que se vea el ✓ antes de avanzar.
    advanceTimer.current = window.setTimeout(() => dispatch({ type: 'advance', from }), reducedMotion() ? 60 : 180);
  };

  const go = (view: View) => {
    window.clearTimeout(advanceTimer.current);
    dispatch({ type: 'go', view });
  };

  const back = () => {
    window.clearTimeout(advanceTimer.current);
    dispatch({ type: 'back' });
  };

  const restart = () => {
    window.clearTimeout(advanceTimer.current);
    window.clearTimeout(sendTimer.current);
    dispatch({ type: 'restart' });
  };

  const onCta = (e: MouseEvent<HTMLAnchorElement>) => {
    const miss = missingSteps(s.a);
    if (miss.length) {
      e.preventDefault();
      dispatch({ type: 'invalid', missing: miss });
      return;
    }
    // Enlace real: no se bloquea la navegación, solo se muestra el estado.
    dispatch({ type: 'send', state: 'sending' });
    window.clearTimeout(sendTimer.current);
    sendTimer.current = window.setTimeout(() => dispatch({ type: 'send', state: 'sent' }), 700);
  };

  const copy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) ok = legacyCopy(message);
    dispatch({ type: 'copy', state: ok ? 'copied' : 'error' });
  };

  const fieldFocus = (on: boolean) => {
    if (on) document.documentElement.dataset.inputFocus = '1';
    else delete document.documentElement.dataset.inputFocus;
  };

  const live =
    s.send === 'sending'
      ? 'Abriendo WhatsApp…'
      : s.copy === 'copied'
        ? 'Mensaje copiado.'
        : s.copy === 'error'
          ? 'No pudimos copiar. Mantén presionado el texto para copiarlo.'
          : s.send === 'sent'
            ? 'Listo. Te abrimos WhatsApp con tu mensaje.'
            : '';

  return (
    <div
      ref={rootRef}
      className="dx-root"
      data-paused={inView ? 'false' : 'true'}
      data-fine={fine ? 'true' : 'false'}
      data-view={s.view}
    >
      {s.view === 1 ? (
        <ServiceSelector a={s.a} onPick={pickService} onRestart={restart} animate={s.focus.tick > 0} />
      ) : (
        <Console
          s={s}
          message={message}
          url={url}
          onPick={pick}
          onGo={go}
          onBack={back}
          onRestart={restart}
          onDetails={(value) => dispatch({ type: 'details', value })}
          onName={(value) => dispatch({ type: 'name', value })}
          onSubmitDetails={() => dispatch({ type: 'submitDetails' })}
          onCta={onCta}
          onCopy={copy}
          onToggleReadout={() => dispatch({ type: 'readout' })}
          onFieldFocus={fieldFocus}
        />
      )}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>
    </div>
  );
}
