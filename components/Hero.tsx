import SectionTag from '@/components/ui/SectionTag';
import { CallLink, WhatsAppLink } from '@/components/ui/Cta';
import { IconArrowDown, IconPhone } from '@/components/ui/Icons';
import HomeSystem from '@/components/HomeSystem';
import { BRAND, CITIES, CONTACT } from '@/lib/content';

/**
 * Hero — 01 · DETECTAR (DESIGN.md §7.3).
 * Componente de servidor: el texto, el H1 y los CTA no dependen de JS.
 * La secuencia de entrada es CSS (styles/hero.css) y espera a que termine la carga.
 * El rótulo superior lleva el nombre de la empresa (el logo del menú es pequeño);
 * el paso "01 · DETECTAR" vive en la lectura del HomeSystem.
 */
export default function Hero() {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="hero relative overflow-x-clip">
      <div className="hero-bg bg-grid" aria-hidden="true" />

      <div className="hero-inner container-x relative grid items-start gap-y-10 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:gap-x-10">
        <div className="hero-copy">
          <SectionTag className="hero-brand whitespace-nowrap">
            <span className="hero-brand-name">{BRAND.name}</span>
            <span className="hero-brand-tag"> · {BRAND.tagline}</span>
          </SectionTag>

          <p className="hero-ask">
            <span className="hero-ask-text">¿Qué está pasando?</span>
            <span className="hero-caret" aria-hidden="true" />
          </p>

          {/* La barra verde de "encendido" es un ::after de .hero-solve: así no parte el
              texto ("SOLUCIÓN.") ni el nombre accesible del titular. */}
          <h1 id="hero-title" className="hero-title t-display text-ink">
            <span className="hero-line hero-line-1">Tranquilo.</span>{' '}
            <span className="hero-line hero-line-2">Tenemos la</span>{' '}
            <span className="hero-line hero-line-3">
              <span className="hero-solve">solución</span>.
            </span>
          </h1>

          <p className="hero-lead hero-in hero-in-1 t-lead max-w-[32ch]">
            Electricidad, plomería, gas y asistencia para tu hogar.
          </p>

          {/* Disposición de CTA y datos en hero.css (no en utilidades): en móviles
              horizontales estrechos vuelven a apilarse, y una utilidad sm:* le ganaría. */}
          <div className="hero-ctas hero-in hero-in-2">
            <WhatsAppLink>Cotizar por WhatsApp</WhatsAppLink>
            <a href="#diagnostico" className="btn btn-secondary">
              <span>Encontrar una solución</span>
              <IconArrowDown size={20} className="hero-arrow" />
            </a>
          </div>

          <div className="hero-in hero-in-3 hero-facts">
            <CallLink className="hero-call">
              <IconPhone size={18} />
              <span>{CONTACT.phoneDisplay}</span>
              <span className="sr-only"> (llamar)</span>
            </CallLink>
            <p className="hero-cities t-label">
              <span className="sr-only">Atendemos en </span>
              {CITIES.map((c, i) => (
                <span key={c.id} className="inline-flex items-center">
                  {i > 0 && <span className="hero-rhomb" aria-hidden="true" />}
                  {i > 0 && <span className="sr-only"> y </span>}
                  {c.name}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="hero-visual">
          <HomeSystem />
        </div>
      </div>
    </section>
  );
}
