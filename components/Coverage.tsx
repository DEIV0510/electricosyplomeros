import { CITIES, type CityId } from '@/lib/content';
import { cityMessage } from '@/lib/whatsapp';
import { WhatsAppLink } from '@/components/ui/Cta';
import SectionTag from '@/components/ui/SectionTag';
import CoverageLink from '@/components/sections/CoverageLink';

/** Norte → sur: Montería arriba a la izquierda, Medellín abajo a la derecha (sin mapa). */
const ORDER: readonly CityId[] = ['monteria', 'medellin'];

/** ESTAMOS DONDE NOS NECESITAS. (DESIGN.md §7.8) */
export default function Coverage() {
  const cities = ORDER.map((id) => CITIES.find((c) => c.id === id)).filter((c) => c !== undefined);

  return (
    <section id="cobertura" aria-labelledby="cov-title" className="cov">
      <div className="container-x">
        <header className="cov-head">
          <div className="cov-head-main">
            <SectionTag>Cobertura</SectionTag>
            <h2 id="cov-title" className="t-display cov-title">
              <span className="block">Estamos donde</span>
              <span className="block">nos necesitas.</span>
            </h2>
          </div>
          <p className="t-lead cov-lead">Atendemos en Medellín y Montería.</p>
        </header>

        <div className="cov-stage ticks">
          <div className="cov-grid bg-grid" aria-hidden="true" />
          <span className="cov-north" aria-hidden="true">
            <svg viewBox="0 0 12 16" width="12" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 15V2M1.8 6.2 6 2l4.2 4.2" />
            </svg>
            N
          </span>
          <CoverageLink />

          {cities.map((c) => (
            <div key={c.id} className={`cov-city cov-city--${c.id}`}>
              <span className="cov-node" data-cov-node={c.id} aria-hidden="true">
                <span className="cov-dia" />
              </span>
              <h3 className="t-display cov-name">{c.name}</h3>
              <div className="cov-body">
                <p className="cov-meta">
                  <span className="cov-region">{c.region}</span>
                  <span className="cov-coords">{c.coords}</span>
                </p>
                <WhatsAppLink variant="secondary" message={cityMessage(c.id)} className="cov-cta">
                  Cotizar en {c.name}
                </WhatsAppLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
