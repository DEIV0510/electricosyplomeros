'use client';

import { useEffect, useState } from 'react';
import { IconWhatsApp } from '@/components/ui/Icons';
import { WHATSAPP_DEFAULT_URL } from '@/lib/whatsapp';
import { useMediaQuery } from '@/lib/hooks';

/**
 * Botón flotante de WhatsApp (DESIGN.md §7.10).
 *
 * Se esconde (para no duplicar CTAs ni tapar contenido) mientras:
 *  - el hero (#inicio) ocupa la pantalla,
 *  - el contacto (#contacto) o el footer (#pie) están a la vista,
 *  - el menú móvil está abierto (CSS: html[data-ep-menu="open"]),
 *  - en táctil, un campo de texto tiene el foco (el teclado lo empujaría encima),
 *  - en pantallas < 1024 px, el diagnóstico ocupa el centro de la pantalla (sus
 *    opciones son filas anchas y el botón quedaría encima; ese flujo ya termina en WhatsApp).
 */

const FIELD =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, select';

function isField(t: EventTarget | null): boolean {
  return t instanceof HTMLElement && (t.matches(FIELD) || t.isContentEditable);
}

export default function WhatsAppButton() {
  // Arranca escondido (el hero está a la vista al cargar): sin saltos en la hidratación.
  const [heroIn, setHeroIn] = useState(true);
  const [endIn, setEndIn] = useState(false);
  const [dxIn, setDxIn] = useState(false);
  const [typing, setTyping] = useState(false);
  const narrow = useMediaQuery('(max-width: 1023.98px)');

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

    const coarse = window.matchMedia('(hover: none), (pointer: coarse)');
    const onFocusIn = (e: FocusEvent) => {
      if (coarse.matches && isField(e.target)) setTyping(true);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!isField(e.relatedTarget)) setTyping(false);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);

    return () => {
      ioHero.disconnect();
      ioEnd.disconnect();
      ioDx.disconnect();
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const visible = !heroIn && !endIn && !typing && !(narrow && dxIn);

  return (
    <div className="wa-root" data-visible={visible ? 'true' : 'false'}>
      <a
        href={WHATSAPP_DEFAULT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-btn"
        aria-label="Cotizar por WhatsApp (se abre WhatsApp)"
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
