import type { CSSProperties } from 'react';
import Logo from '@/components/ui/Logo';
import { CallLink } from '@/components/ui/Cta';
import { IconArrowDown, IconWhatsApp, SOCIAL_ICONS } from '@/components/ui/Icons';
import MotionToggle from '@/components/ui/MotionToggle';
import { BRAND, CITIES, SOCIAL, SYSTEMS } from '@/lib/content';
import { WHATSAPP_DEFAULT_URL } from '@/lib/whatsapp';

/**
 * Footer claro (DESIGN.md §7.11). Lleva el logo oficial (superficie clara).
 * Año fijo 2026: nada de new Date() en el render de servidor.
 */

// Color de cada sistema (mismo código de color que el resto del sitio).
const SYSTEM_COLOR: Record<string, string> = {
  electricidad: 'var(--color-power)',
  plomeria: 'var(--color-water)',
  gas: 'var(--color-gas)',
  hogar: 'var(--color-violet)',
};

export default function Footer() {
  return (
    <footer id="pie" className="ft-root">
      <div className="container-x">
        <div className="ft-main">
          <div className="ft-brand">
            <a href="#inicio" className="ft-logo-link" aria-label={`${BRAND.name}, ${BRAND.tagline}: ir al inicio`}>
              <Logo className="ft-logo" sizes="174px" />
            </a>
            <p className="t-label ft-brand-label">
              <span className="ft-brand-name">
                <span className="ft-brand-sep" aria-hidden="true" />
                Eléctricos y Plomeros
              </span>
              <span className="ft-brand-tag">Soluciones Eficientes</span>
            </p>
            <p className="ft-brand-line">Electricidad, plomería, gas y asistencia para tu hogar.</p>
          </div>

          <div className="ft-cols">
            <div className="ft-col">
              <p id="ft-servicios" className="t-label ft-col-title">
                Servicios
              </p>
              <ul aria-labelledby="ft-servicios" className="ft-list">
                {SYSTEMS.map((s) => (
                  <li key={s.id}>
                    <a
                      href="#servicios"
                      className="ft-link"
                      style={{ '--c': SYSTEM_COLOR[s.id] } as CSSProperties}
                    >
                      <span className="ft-bullet" aria-hidden="true" />
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ft-col">
              <p id="ft-ciudades" className="t-label ft-col-title">
                Ciudades
              </p>
              <ul aria-labelledby="ft-ciudades" className="ft-list">
                {CITIES.map((c) => (
                  <li key={c.id}>
                    <a href="#cobertura" className="ft-link">
                      <span className="ft-bullet" aria-hidden="true" />
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ft-col ft-col-contact">
              <p id="ft-contacto" className="t-label ft-col-title">
                Contacto
              </p>
              <ul aria-labelledby="ft-contacto" className="ft-list">
                <li>
                  <CallLink className="ft-link ft-link-icon ft-phone" />
                </li>
                <li>
                  <a href={WHATSAPP_DEFAULT_URL} target="_blank" rel="noopener noreferrer" className="ft-link ft-link-icon">
                    <IconWhatsApp size={18} />
                    <span>Hablar por WhatsApp</span>
                    <span className="sr-only"> (se abre WhatsApp)</span>
                  </a>
                </li>
                {SOCIAL.map((s) => {
                  const Icon = SOCIAL_ICONS[s.id];
                  return (
                    <li key={s.id}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="ft-link ft-link-icon">
                        <Icon size={18} />
                        <span>{s.label}</span>
                        <span className="sr-only"> (se abre en una pestaña nueva)</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="ft-bottom">
          <p className="ft-copy">© 2026 Eléctricos y Plomeros · Soluciones Eficientes</p>
          <div className="ft-bottom-actions">
            <MotionToggle className="ft-motion" />
            <a href="#inicio" className="ft-top">
              Volver arriba
              <IconArrowDown size={18} className="ft-top-icon" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
