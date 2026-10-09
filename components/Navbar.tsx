'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Logo from '@/components/ui/Logo';
import { CallLink, WhatsAppLink } from '@/components/ui/Cta';
import { IconArrowRight } from '@/components/ui/Icons';
import { BRAND, CITIES, NAV } from '@/lib/content';
import { useScrollSnapshot } from '@/components/nav/scroll';

/**
 * Navbar fija (DESIGN.md §7.2).
 * - Arriba: transparente, integrada con el hero. Tras 24 px: sólida y compacta.
 * - Resalta la sección visible (#inicio #servicios #diagnostico #cobertura #contacto).
 * - <1024: logo · Cotizar · hamburguesa con menú a pantalla completa (Escape, X o
 *   tocar un enlace lo cierran; bloquea el scroll y atrapa el foco).
 * - Mientras el menú está abierto marca <html data-ep-menu="open"> (el botón flotante
 *   de WhatsApp se esconde con eso).
 */

const NAV_IDS: readonly string[] = NAV.map((n) => n.href.slice(1));
// Todas las secciones de la página, también las que no están en el menú: mientras se ve
// una de ellas (p. ej. #solucionamos) no se marca ningún enlace.
const SECTION_IDS = ['inicio', 'diagnostico', 'servicios', 'solucionamos', 'cobertura', 'contacto'];

function readScrolled(): boolean {
  return window.scrollY > 24;
}

function readActive(): string {
  const doc = document.documentElement;
  const vh = window.innerHeight;
  const y = window.scrollY;
  // Al final de la página el contacto puede no alcanzar la línea de lectura.
  if (y > 0 && y + vh >= doc.scrollHeight - 4 && document.getElementById('contacto')) return 'contacto';
  const navH = window.innerWidth >= 1024 ? 76 : 64;
  const line = navH + (vh - navH) * 0.3;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= line && r.bottom > line) return NAV_IDS.includes(id) ? id : '';
  }
  return '';
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  const scrolled = useScrollSnapshot(readScrolled, false);
  const active = useScrollSnapshot(readActive, '');
  const [open, setOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const focusToggleOnClose = useRef(false);
  // Doble clic / doble toque (DESIGN §2): el segundo clic, < 400 ms después de abrir o
  // cerrar el menú, se ignora (si no, el menú se abre y se cierra en el acto).
  const changedAt = useRef(-Infinity);
  const tooSoon = () => performance.now() - changedAt.current < 400;

  const closeMenu = useCallback((focusToggle: boolean) => {
    focusToggleOnClose.current = focusToggle;
    changedAt.current = performance.now();
    setOpen(false);
  }, []);
  const openMenu = () => {
    changedAt.current = performance.now();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) {
      if (focusToggleOnClose.current) {
        focusToggleOnClose.current = false;
        toggleRef.current?.focus();
      }
      return;
    }

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    html.setAttribute('data-ep-menu', 'open');

    // Modal de verdad: todo lo que queda detrás del menú (contenido, footer, botón flotante,
    // riel, enlace de salto…) sale del árbol de accesibilidad y del foco con `inert`, para
    // que el gesto de deslizar de VoiceOver/TalkBack no se escape del menú. El header queda
    // intacto (logo, Cotizar y el botón de cerrar forman parte del ciclo de foco).
    const header = headerRef.current;
    const madeInert: HTMLElement[] = [];
    for (const el of Array.from(document.body.children)) {
      if (!(el instanceof HTMLElement) || el === header || el.contains(header)) continue;
      if (/^(SCRIPT|STYLE|TEMPLATE|LINK|NOSCRIPT)$/.test(el.tagName) || el.inert) continue;
      el.inert = true;
      madeInert.push(el);
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (e.key !== 'Tab') return;
      const root = headerRef.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden',
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!(current instanceof HTMLElement) || !root.contains(current)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // Si la ventana pasa a escritorio con el menú abierto, se cierra.
    const desk = window.matchMedia('(min-width: 1024px)');
    const onDesk = () => {
      if (desk.matches) closeMenu(false);
    };

    document.addEventListener('keydown', onKey);
    desk.addEventListener('change', onDesk);
    return () => {
      document.removeEventListener('keydown', onKey);
      desk.removeEventListener('change', onDesk);
      html.style.overflow = prevOverflow;
      html.removeAttribute('data-ep-menu');
      for (const el of madeInert) el.inert = false;
    };
  }, [open, closeMenu]);

  const solid = scrolled || open;

  return (
    <header
      ref={headerRef}
      className="nav-root"
      data-solid={solid ? 'true' : 'false'}
      data-open={open ? 'true' : 'false'}
    >
      <div className="nav-bg" aria-hidden="true" />

      <div className="container-x nav-bar">
        <a
          href="#inicio"
          className="nav-brand"
          aria-label={`${BRAND.name}, ${BRAND.tagline}: ir al inicio`}
          onClick={() => open && closeMenu(false)}
        >
          <Logo priority className="nav-logo" sizes="(min-width: 1024px) 145px, 106px" />
        </a>

        <nav aria-label="Principal" className="nav-desk">
          <ul className="nav-desk-list">
            {NAV.map((item) => {
              const id = item.href.slice(1);
              return (
                <li key={id}>
                  <a href={item.href} className="nav-link" aria-current={active === id ? 'true' : undefined}>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="nav-actions">
          <CallLink className="nav-call" />
          <WhatsAppLink className="nav-cta">Cotizar ahora</WhatsAppLink>
          <WhatsAppLink className="nav-quote">Cotizar</WhatsAppLink>
          <button
            ref={toggleRef}
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => {
              if (tooSoon()) return;
              if (open) closeMenu(true);
              else openMenu();
            }}
          >
            <span className="nav-toggle-lines" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Menú móvil / tablet: dentro del header (mismo contexto de apilamiento). */}
      <div
        id="nav-menu"
        className="nav-menu bg-grid"
        inert={!open}
        onClickCapture={(e) => {
          // Recién abierto: un segundo toque accidental no debe seguir un enlace.
          if (tooSoon()) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div className="nav-menu-scroll">
          <div className="container-x nav-menu-inner">
            <p className="t-label nav-menu-kicker">
              <span className="nav-menu-kicker-dot" aria-hidden="true" />
              Menú
            </p>
            <nav aria-label="Principal">
              <ol className="nav-mlist">
                {NAV.map((item, i) => {
                  const id = item.href.slice(1);
                  return (
                    <li key={id} style={{ '--i': i } as CSSProperties}>
                      <a
                        href={item.href}
                        className="nav-mlink"
                        aria-current={active === id ? 'true' : undefined}
                        onClick={() => closeMenu(false)}
                      >
                        <span className="nav-mlink-num" aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="nav-mlink-text t-display">{item.label}</span>
                        <IconArrowRight className="nav-mlink-arrow" size={22} />
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="nav-menu-foot" style={{ '--i': NAV.length } as CSSProperties}>
              <WhatsAppLink size="lg" className="nav-menu-cta" onClick={() => closeMenu(false)}>
                Cotizar por WhatsApp
              </WhatsAppLink>
              <CallLink className="nav-mcall" />
              <p className="t-label nav-mcities">
                {CITIES.map((c) => (
                  <span key={c.id} className="nav-mcity">
                    <span className="nav-mcity-dot" aria-hidden="true" />
                    {c.name}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
