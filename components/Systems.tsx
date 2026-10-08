import type { CSSProperties } from 'react';
import SectionTag from '@/components/ui/SectionTag';
import { SYSTEMS } from '@/lib/content';
import SystemsBoard from '@/components/systems/SystemsBoard';
import SystemColumn from '@/components/systems/SystemColumn';

/**
 * §7.6 "UN HOGAR. CUATRO SISTEMAS." — también es la sección informativa de servicios.
 * Escenario `night` con una línea que se transforma (energía → tubería → gas → casa)
 * y cuatro columnas unidas como un panel. Todo el contenido existe sin JS.
 */
export default function Systems() {
  return (
    <section id="servicios" aria-labelledby="sys-title" className="sys-section">
      <div className="container-x">
        <header className="sys-head" data-reveal="">
          <div className="sys-head-title">
            <SectionTag>Servicios</SectionTag>
            <h2 id="sys-title" className="sys-h2 t-display">
              <span className="block">Un hogar.</span>
              <span className="block text-violet">Cuatro sistemas.</span>
            </h2>
          </div>
          <p className="sys-head-lead t-lead">
            Electricidad, agua, gas y soporte. Cuando uno falla, toda la casa lo siente.
          </p>
        </header>

        <div data-reveal="" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          <SystemsBoard>
            <ol className="sys-cols">
              {SYSTEMS.map((s, i) => (
                <SystemColumn key={s.id} system={s} i={i} />
              ))}
            </ol>
          </SystemsBoard>
        </div>
      </div>
    </section>
  );
}
