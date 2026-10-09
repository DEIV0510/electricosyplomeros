'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { IconWhatsApp } from '@/components/ui/Icons';
import { WHATSAPP_DEFAULT_URL } from '@/lib/whatsapp';
import { useMediaQuery } from '@/lib/hooks';

/**
 * Botón flotante de WhatsApp (DESIGN.md §7.10).
 *
 * Se esconde (para no duplicar CTAs ni tapar contenido) mientras:
 *  - el hero (#inicio) ocupa la pantalla,
 *  - el contacto (#contacto) o el footer (#pie) están a la vista,
 *  - un CTA de WhatsApp de la página (p. ej. "Necesito ayuda", "Cotizar en Montería") o una
 *    opción del paso 1 del diagnóstico ("04 Soporte" a 1024–1366 px) pasa por la franja
 *    inferior de la pantalla justo en la columna del botón (dos botones verdes encimados y
 *    toques que caían en el flotante en vez de en la opción),
 *  - el menú móvil está abierto (CSS: html[data-ep-menu="open"]),
 *  - en táctil, un campo de texto tiene el foco (el teclado lo empujaría encima),
 *  - en pantallas < 1024 px, el diagnóstico ocupa el centro de la pantalla (sus
 *    opciones son filas anchas y el botón quedaría encima; ese flujo ya termina en WhatsApp).
 *
 * Etiqueta al pasar el mouse / con foco (WCAG 1.4.13): se puede pasar el puntero sobre ella
 * sin que desaparezca (es parte del enlace) y Escape la oculta hasta que se retire el
 * puntero y el foco.
 */

const FIELD =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, select';

// CTAs de WhatsApp dentro del contenido y opciones del paso 1 del diagnóstico que pueden
// quedar bajo el botón flotante. (Los pasos 2–5 lo ocultan con html[data-dx-console].)
const PAGE_CTAS = 'main a[href^="https://wa.me/"], #diagnostico .dx-svc';

function isField(t: EventTarget | null): boolean {
  return t instanceof HTMLElement && (t.matches(FIELD) || t.isContentEditable);
}

export default function WhatsAppButton() {
  // Arranca escondido (el hero está a la vista al cargar): sin saltos en la hidratación.
  const [heroIn, setHeroIn] = useState(true);
  const [endIn, setEndIn] = useState(false);
  const [dxIn, setDxIn] = useState(false);
  const [ctaIn, setCtaIn] = useState(false);
  const [typing, setTyping] = useState(false);
  const [tipOff, setTipOff] = useState(false);
  const narrow = useMediaQuery('(max-width: 1023.98px)');
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const hero = document.getElementById('inicio');
    const dx = document.getElementById('diagnostico');
    const ends = [document.getElementById('contacto'), document.getElementById('pie')].filter(
      (el): el is HTMLElement => el !== null,
    );

    // El hero cuenta como "a la vista" mientras ocupe algo más que una franja arriba.
    const ioHero = new IntersectionObserver(([e]) => setHeroIn(e.isIntersecting), {
      rootMargin: '-22% 0px 0px 0px',
    });
    if (hero) ioHero.observe(hero);
    else queueMicrotask(() => setHeroIn(false));

    const endState = new Map<Element, boolean>();
    const ioEnd = new IntersectionObserver(
      (entries) => {
        for (const e of entries) endState.set(e.target, e.isIntersecting);
        setEndIn(Array.from(endState.values()).some(Boolean));
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    ends.forEach((el) => ioEnd.observe(el));

    const ioDx = new IntersectionObserver(([e]) => setDxIn(e.isIntersecting), {
      rootMargin: '-38% 0px -38% 0px',
    });
    if (dx) ioDx.observe(dx);

    // CTAs de la página en la franja inferior (22 % de abajo, donde vive el botón) que
    // además cruzan su columna. En escritorio los CTAs van a la izquierda: no lo esconden.
    const BAND = 0.78; // la franja empieza al 78 % del alto (= rootMargin de ioCta)
    const inBand = new Set<HTMLElement>();
    const ctaHit = () => {
      const fab = rootRef.current?.getBoundingClientRect();
      if (!fab) return false;
      for (const el of inBand) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.left < fab.right + 8 && r.right > fab.left - 8) return true;
      }
      return false;
    };
    const checkCtas = () => setCtaIn(ctaHit());
    const ioCta = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) inBand.add(el);
          else inBand.delete(el);
        }
        checkCtas();
      },
      { rootMargin: `-${BAND * 100}% 0px 0px 0px` },
    );
    // El diagnóstico desmonta y vuelve a montar sus opciones (paso 1 ↔ consola, Reiniciar):
    // el conjunto observado se sincroniza cuando cambia su árbol. Al volver al paso 1 la
    // consola suelta html[data-dx-console] en ese mismo momento y el primer aviso del IO
    // llega un fotograma tarde (el botón alcanzaba a asomar): por eso lo recién montado se
    // mide aquí, en la microtarea del MutationObserver, y el estado se aplica con flushSync,
    // antes de que el navegador pinte.
    const observed = new Set<HTMLElement>();
    const syncCtas = (now: boolean) => {
      const current = new Set(document.querySelectorAll<HTMLElement>(PAGE_CTAS));
      for (const el of observed) {
        if (current.has(el)) continue;
        ioCta.unobserve(el);
        observed.delete(el);
        inBand.delete(el);
      }
      for (const el of current) {
        if (observed.has(el)) continue;
        ioCta.observe(el);
        observed.add(el);
        if (!now) continue;
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.bottom > window.innerHeight * BAND && r.top < window.innerHeight)
          inBand.add(el);
      }
      if (now) {
        const hit = ctaHit();
        flushSync(() => setCtaIn(hit));
      } else checkCtas();
    };
    syncCtas(false);
    const moDx = new MutationObserver(() => syncCtas(true));
    if (dx) moDx.observe(dx, { childList: true, subtree: true });
    window.addEventListener('resize', checkCtas, { passive: true });

    const coarse = window.matchMedia('(hover: none), (pointer: coarse)');
    const onFocusIn = (e: FocusEvent) => {
      if (coarse.matches && isField(e.target)) setTyping(true);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!isField(e.relatedTarget)) setTyping(false);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);

    // Escape oculta la etiqueta mientras el botón tiene el puntero encima o el foco.
    const onKey = (e: KeyboardEvent) => {
      const btn = btnRef.current;
      if (e.key !== 'Escape' || !btn) return;
      if (btn.matches(':hover') || document.activeElement === btn) setTipOff(true);
    };
    document.addEventListener('keydown', onKey);

    return () => {
      ioHero.disconnect();
      ioEnd.disconnect();
      ioDx.disconnect();
      ioCta.disconnect();
      moDx.disconnect();
      window.removeEventListener('resize', checkCtas);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const visible = !heroIn && !endIn && !typing && !ctaIn && !(narrow && dxIn);

  return (
    <div
      ref={rootRef}
      className="wa-root"
      data-visible={visible ? 'true' : 'false'}
      data-tip={tipOff ? 'off' : undefined}
    >
      <a
        ref={btnRef}
        href={WHATSAPP_DEFAULT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-btn"
        aria-label="Cotizar por WhatsApp (se abre WhatsApp)"
        onPointerLeave={(e) => {
          if (document.activeElement !== e.currentTarget) setTipOff(false);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.matches(':hover')) setTipOff(false);
        }}
      >
        <span className="wa-label" aria-hidden="true">
          Cotizar por WhatsApp
        </span>
        <span className="wa-circle" aria-hidden="true">
          <span className="wa-ring" />
          <IconWhatsApp size={28} />
        </span>
      </a>
    </div>
  );
}
