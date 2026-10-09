import type { CSSProperties } from 'react';
import SectionTag from '@/components/ui/SectionTag';
import { IconWhatsApp } from '@/components/ui/Icons';
import { WHATSAPP_DEFAULT_URL } from '@/lib/whatsapp';
import DiagnosticTool from '@/components/diagnostic/DiagnosticTool';

/**
 * 02 · ENTENDER — "ALGO NO ESTÁ FUNCIONANDO."
 * Selector de servicio + mini diagnóstico que termina en WhatsApp con el mensaje escrito.
 * La cabecera es estática (servidor); la herramienta es un componente de cliente.
 */
export default function Diagnostic() {
  return (
    <section id="diagnostico" aria-labelledby="dx-title" className="dx-section">
      <div className="container-x">
        <header className="dx-head">
          <div data-reveal>
            <SectionTag index="02">Entender</SectionTag>
            <h2 id="dx-title" className="t-display dx-h2">
              <span className="block">Algo no está</span>{' '}
              {/* Acento de titular sobre paper: segunda línea en violet (DESIGN §2).
                  Guion suave (U+00AD): si el usuario amplía el espaciado de texto (WCAG 1.4.12)
                  y la palabra ya no cabe, parte por sílaba ("FUNCIO- / NANDO.") y no letra
                  suelta. A diferencia de <wbr>, el nombre accesible sigue siendo una sola
                  palabra ("funcionando"). */}
              <span className="block dx-h2-accent">{'funcio­nando.'}</span>
            </h2>
          </div>
          <div className="dx-head-side" data-reveal style={{ '--reveal-delay': '100ms' } as CSSProperties}>
            <p className="t-lead dx-lead">Cuéntanos qué sucede y te ayudamos a encontrar la solución.</p>
            <p className="t-label dx-flow">
              <span>5 pasos</span>
              <span className="sr-only"> que terminan en </span>
              <span className="dx-flow-line" aria-hidden="true" />
              <span className="dx-flow-end">
                <IconWhatsApp size={14} />
                WhatsApp
              </span>
            </p>
          </div>
        </header>

        <div className="dx-stage" data-reveal style={{ '--reveal-delay': '160ms' } as CSSProperties}>
          <DiagnosticTool />
        </div>

        <p className="dx-direct">
          <span className="dx-direct-q">¿Prefieres escribir directo?</span>{' '}
          <a href={WHATSAPP_DEFAULT_URL} target="_blank" rel="noopener noreferrer" className="dx-direct-link">
            <IconWhatsApp size={18} />
            <span>Hablar por WhatsApp</span>
            <span className="sr-only"> (se abre WhatsApp)</span>
          </a>
        </p>
      </div>
    </section>
  );
}
