import { CONTACT } from '@/lib/content';
import { CallLink, WhatsAppLink } from '@/components/ui/Cta';
import { IconArrowRight, IconFacebook, IconPhone } from '@/components/ui/Icons';
import SectionTag from '@/components/ui/SectionTag';
import PowerRing from '@/components/sections/PowerRing';

/**
 * CTA final — "¿TIENES UN PROBLEMA? HABLEMOS." (DESIGN.md §7.9)
 * El marco `paper` deja ver un panel `night` que se revela en rombo desde el centro
 * (CSS scroll-driven dentro de @supports y fuera de movimiento reducido). Sin soporte,
 * el panel se ve completo. Todo el contenido es HTML estático (sin JS).
 */
export default function Contact() {
  return (
    <section id="contacto" aria-labelledby="ct-title" className="ct">
      <div className="container-x">
        <div className="ct-frame">
          {/* Capa de papel bajo el panel: guías en rombo que el panel cubre al revelarse */}
          <svg className="ct-guides" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
            <path d="M0 -92 92 0 0 92 -92 0Z" />
            <path d="M0 -62 62 0 0 62 -62 0Z" />
            <path d="M0 -32 32 0 0 32 -32 0Z" />
            <path className="ct-guides-node" d="M0 -5 5 0 0 5 -5 0Z" />
          </svg>

          <div className="ct-panel ticks on-dark">
            <div className="ct-inner">
              <SectionTag tone="dark" className="ct-tag">
                Contacto
              </SectionTag>
              <h2 id="ct-title" className="t-display ct-title">
                <span className="block">¿Tienes un problema?</span>
                <span className="block text-green">Hablemos.</span>
              </h2>
              <p className="ct-text">Cuéntanos qué necesitas y encontraremos la mejor manera de ayudarte.</p>

              <div className="ct-actions">
                {/* Anillo de encendido (eco del logo): su barra pasa por detrás del botón de WhatsApp */}
                <PowerRing className="ct-ring" strokeWidth={1.25} nonScaling />
                <WhatsAppLink size="lg" arrow className="ct-wa">
                  Hablar por WhatsApp
                </WhatsAppLink>

                <ul className="ct-list">
                  <li>
                    <CallLink className="ct-row">
                      <span className="ct-row-label">Llamar</span>{' '}
                      <span className="ct-row-value ct-phone">{CONTACT.phoneDisplay}</span>
                      <IconPhone className="ct-row-icon" size={22} />
                    </CallLink>
                  </li>
                  <li>
                    <a href={CONTACT.facebookUrl} target="_blank" rel="noopener noreferrer" className="ct-row">
                      <span className="ct-row-label" aria-hidden="true">
                        Redes
                      </span>
                      <span className="ct-row-value">Síguenos en Facebook</span>
                      <IconFacebook className="ct-row-icon" size={22} />
                      <span className="sr-only"> (se abre Facebook)</span>
                    </a>
                  </li>
                </ul>

                <a href="#diagnostico" className="link-arrow ct-diag">
                  <span>
                    ¿Prefieres que te guiemos? <span className="whitespace-nowrap">Haz el diagnóstico</span>
                  </span>
                  <IconArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
