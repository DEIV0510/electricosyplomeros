import HomeSystemStage from '@/components/hero/HomeSystemStage';
import { BackSvg, HouseSvg, LABELS, LabelsLayer, SystemsSvg } from '@/components/hero/drawing';

/**
 * HomeSystem: la casa como un sistema conectado (DESIGN.md §7.4).
 * El dibujo es marcado de servidor; solo el escenario (`HomeSystemStage`) es cliente.
 * Cabecera de instrumento: paso "01 · DETECTAR" a la izquierda y la lectura de estado
 * a la derecha (decorativas: el escenario ya tiene su descripción accesible).
 */
export default function HomeSystem() {
  return (
    <div className="hs">
      <div className="hs-head" aria-hidden="true">
        <p className="hs-step t-label">
          <span className="hs-step-i">01</span>
          <span className="hs-step-sep">·</span>
          <span>Detectar</span>
        </p>
        <p className="hs-readout t-label">
          <span className="hs-read-k">Estado:</span>
          <span className="hs-read-v">
            <span className="hs-read-detect">
              <i className="hs-dot hs-dot-alert" />
              Detectando…
            </span>
            <span className="hs-read-ok">
              <i className="hs-dot hs-dot-ok" />
              Sistema listo
            </span>
          </span>
        </p>
      </div>

      <HomeSystemStage label="Esquema de una casa con sus sistemas de electricidad, agua, gas y hogar conectados">
        <div className="hs-layer hs-l-back" data-depth="-10">
          <BackSvg />
        </div>
        <div className="hs-layer hs-l-house">
          <HouseSvg />
        </div>
        <div className="hs-halo" aria-hidden="true" />
        <div className="hs-scan-clip" aria-hidden="true">
          <div className="hs-scan" />
        </div>
        <div className="hs-layer hs-l-sys" data-depth="4">
          <SystemsSvg />
        </div>
        <div className="hs-layer hs-l-labels" data-depth="10">
          <LabelsLayer />
        </div>
      </HomeSystemStage>

      {/* Leyenda (móvil): reemplaza los rótulos sobre el dibujo */}
      <ul className="hs-legend" aria-hidden="true">
        {LABELS.map((l) => (
          <li key={l.sys} data-sys={l.sys}>
            <span className="hs-sw" data-sys={l.sys} />
            <span className="hs-label-i">{l.index}</span>
            <span className="hs-legend-n">{l.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
