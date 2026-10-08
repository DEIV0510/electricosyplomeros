import SectionTag from '@/components/ui/SectionTag';
import { WhatsAppLink } from '@/components/ui/Cta';
import WordStack from '@/components/sections/WordStack';

/**
 * 03 · SOLUCIONAR — "NO SOLO ARREGLAMOS." (DESIGN.md §7.7)
 * Escritorio: título + subtexto + CTA a la izquierda, pila a la derecha.
 * Móvil: título, pila, subtexto, CTA (orden del DOM).
 */
export default function NotOnlyFix() {
  return (
    <section id="solucionamos" aria-labelledby="nf-title" className="nf on-dark">
      <div className="nf-bg bg-grid-night" aria-hidden="true" />
      <div className="container-x nf-grid">
        <div className="nf-head">
          <SectionTag index="03" tone="dark">
            Solucionar
          </SectionTag>
          <h2 id="nf-title" className="t-display nf-title">
            No solo <span className="whitespace-nowrap">arreglamos.</span>
          </h2>
        </div>

        <WordStack />

        <div className="nf-foot">
          <p className="nf-sub">Soluciones eficientes para las necesidades de tu hogar.</p>
          <WhatsAppLink arrow className="nf-cta w-full sm:w-auto">
            Necesito ayuda
          </WhatsAppLink>
        </div>
      </div>
    </section>
  );
}
