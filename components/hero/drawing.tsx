import type { CSSProperties } from 'react';

/**
 * Plano del sistema del hogar (HomeSystem). Todo está dibujado sobre una retícula de
 * 4 u (viewBox 600 × 540) y en tres capas SVG apiladas con el mismo viewBox:
 *
 *   back    → eje y marcas de registro (parallax −)
 *   house   → techo de franjas, muros, entrepiso, muebles (fija)
 *   systems → energía, agua, gas, anillo de encendido, nodos (parallax +)
 *
 * Coordenadas clave:
 *   techo  : mitad superior de un rombo, ápice (300,20), base y=220 de x=100 a x=500
 *   muros  : exteriores x=120/480 (8 u de espesor), cubierta y=220–228,
 *            entrepiso y=340–348, losa de piso y=470–478, terreno y=470
 *   tabiques: x=340 en ambos niveles (sala | cocina, alcoba | baño)
 *   acometidas: energía por la izquierda (y=504), gas y agua por la derecha (y=496 / 512)
 */

export const VB_W = 600;
export const VB_H = 540;

type Var = CSSProperties & Record<`--${string}`, string | number>;

/* ------------------------------------------------------------------ */
/*  Techo: franjas horizontales recortadas por la mitad de un rombo     */
/* ------------------------------------------------------------------ */
const APEX_Y = 20;
const EAVE_Y = 220;
const STRIPES = 12;
const PITCH = (EAVE_Y - APEX_Y) / STRIPES; // 16.67
const STRIPE_H = 10;
export const RING = { x: 300, y: APEX_Y + PITCH * 7 + STRIPE_H + (PITCH - STRIPE_H) / 2 }; // centro de un hueco entre franjas (y=150)

/* ------------------------------------------------------------------ */
/*  Nodos (uniones, pasos por losa y muro)                              */
/* ------------------------------------------------------------------ */
export type SysId = 'electricidad' | 'plomeria' | 'gas' | 'hogar';

export const NODES: Array<{ x: number; y: number; sys: SysId }> = [
  { x: 138, y: 474, sys: 'electricidad' }, // acometida eléctrica atraviesa la losa
  { x: 352, y: 474, sys: 'plomeria' }, // acometida de agua atraviesa la losa
  { x: 500, y: 474, sys: 'gas' }, // tubería de gas sale del terreno
  { x: 138, y: 344, sys: 'electricidad' }, // paso por entrepiso
  { x: 352, y: 404, sys: 'plomeria' }, // derivación al grifo
  { x: 476, y: 448, sys: 'gas' }, // paso por el muro
  { x: 138, y: 318, sys: 'electricidad' }, // derivación a la toma de la alcoba
  { x: 352, y: 344, sys: 'plomeria' }, // paso por entrepiso
  { x: 340, y: 242, sys: 'electricidad' }, // paso por el tabique
];

/* ------------------------------------------------------------------ */
/*  Rótulos (HTML encima del SVG) y sus líneas guía                     */
/* ------------------------------------------------------------------ */
export type LabelDef = {
  sys: SysId;
  index: string;
  name: string;
  /** Extremo exterior de la línea guía. */
  x: number;
  /** Inicio del texto (siempre alineado a la izquierda: su posición no depende de la fuente). */
  lx: number;
  y: number;
  /** Punto del sistema al que apunta. */
  tx: number;
  /** Lado en el que se apoya el texto. */
  side: 'left' | 'right';
};

export const LABELS: LabelDef[] = [
  { sys: 'electricidad', index: '01', name: 'Energía', x: 10, lx: 10, y: 404, tx: 132, side: 'left' },
  { sys: 'plomeria', index: '02', name: 'Agua', x: 592, lx: 522, y: 304, tx: 446, side: 'right' },
  { sys: 'gas', index: '03', name: 'Gas', x: 592, lx: 522, y: 440, tx: 512, side: 'right' },
  { sys: 'hogar', index: '04', name: 'Hogar', x: 592, lx: 522, y: RING.y, tx: 336, side: 'right' },
];

/* ------------------------------------------------------------------ */
/*  Capa trasera: eje de simetría y marcas de registro                  */
/* ------------------------------------------------------------------ */
export function BackSvg() {
  const cross = (x: number, y: number) => `M${x - 6} ${y}h12M${x} ${y - 6}v12`;
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true" focusable="false">
      <path className="hs-axis" d={`M300 0V${VB_H}`} />
      <path className="hs-cross" d={[cross(40, 40), cross(560, 40), cross(40, 530), cross(560, 530)].join('')} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Capa de la casa                                                     */
/* ------------------------------------------------------------------ */
export function HouseSvg() {
  const hatch: string[] = [];
  for (let x = 30; x <= 114; x += 12) hatch.push(`M${x} 471l-7 7`);
  for (let x = 494; x <= 578; x += 12) hatch.push(`M${x} 471l-7 7`);

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="hs-roof-clip">
          <path d={`M100 ${EAVE_Y}L300 ${APEX_Y}L500 ${EAVE_Y}Z`} />
        </clipPath>
        <mask id="hs-roof-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
          <rect width={VB_W} height={VB_H} fill="#fff" />
          <circle cx={RING.x} cy={RING.y} r="34" fill="#000" />
        </mask>
      </defs>

      {/* Interior y hueco del anillo en papel: la cuadrícula de la página no cruza la casa */}
      <path className="hs-room" fill="#f6f5f9" d="M128 228H472V470H128Z" />
      <circle className="hs-room" fill="#f6f5f9" cx={RING.x} cy={RING.y} r="34" />

      {/* Techo: franjas del rombo del logo */}
      <g className="hs-roof" clipPath="url(#hs-roof-clip)">
        <g mask="url(#hs-roof-mask)">
          {Array.from({ length: STRIPES }, (_, k) => (
            <rect
              key={k}
              className="hs-stripe"
              style={{ '--i': k } as Var}
              x="100"
              y={+(APEX_Y + k * PITCH).toFixed(2)}
              width="400"
              height={STRIPE_H}
            />
          ))}
        </g>
      </g>

      {/* Terreno */}
      <path className="hs-ground" d="M20 470H120M480 470H580" />
      <path className="hs-hatch" d={hatch.join('')} />

      {/* Muros, cubierta, entrepiso y losa (corte) */}
      <path
        className="hs-shell"
        fill="#edeaf3"
        fillRule="evenodd"
        d="M120 220H480V478H120Z M128 228H472V340H128Z M128 348H472V470H128Z"
      />
      {/* Tabiques */}
      <path className="hs-part" d="M340 228V340M340 348V470" />
      {/* Ventanas (corte por el muro) */}
      <path className="hs-window" d="M120 262h8v44h-8zM124 262v44M472 252h8v28h-8zM476 252v28" />

      {/* Cocina: mueble del lavaplatos con poceta, estufa */}
      <path className="hs-furn" d="M364 470V420M412 420V470" />
      <path className="hs-counter" d="M360 420H374V427Q374 432 379 432H397Q402 432 402 427V420H416" />
      <rect className="hs-furn hs-fill" x="418" y="420" width="48" height="50" />
      <path className="hs-knob" d="M426 428h0M433 428h0" />
      <path className="hs-furn" d="M430 417H454" />
      {/* Baño: plato de ducha */}
      <path className="hs-furn" d="M412 336H464" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Capa de sistemas                                                    */
/* ------------------------------------------------------------------ */
const E = {
  supply: 'M20 504H130Q138 504 138 496V420',
  up: 'M138 388V250Q138 242 146 242H397',
  ground: 'M150 388V370Q150 362 158 362H285',
  outlets: 'M150 420V438Q150 446 158 446H257',
  tee: 'M138 318H209',
  pulse: 'M20 504H130Q138 504 138 496V250Q138 242 146 242H397',
};
const W = {
  main: 'M580 512H360Q352 512 352 504V284Q352 276 360 276H432Q440 276 440 284V290',
  tap: 'M352 404H380Q388 404 388 412V414',
};
const G = {
  supply: 'M580 496H508Q500 496 500 488V456',
  service: 'M488 448H450Q442 448 442 440V419',
};

/** Luminaria con el símbolo eléctrico de lámpara (círculo con aspa). */
function Lamp({ x, y, n }: { x: number; y: number; n: number }) {
  const d = 4.95;
  return (
    <g className="hs-lamp" data-n={n}>
      <circle className="hs-lamp-bg" cx={x} cy={y} r="7" />
      <circle className="hs-lamp-glow anim-loop" cx={x} cy={y} r="7" />
      <path d={`M${x - d} ${y - d}L${x + d} ${y + d}M${x + d} ${y - d}L${x - d} ${y + d}`} />
      <circle className="hs-lamp-ring" cx={x} cy={y} r="7" />
    </g>
  );
}

function Outlet({ x, y }: { x: number; y: number }) {
  return (
    <g className="hs-outlet">
      <rect x={x - 5} y={y - 7} width="10" height="14" rx="1" />
      <path d={`M${x - 2} ${y - 2.5}v5M${x + 2} ${y - 2.5}v5`} />
    </g>
  );
}

/** Lengua de llama (lados cóncavos, punta afilada). `lean` inclina la punta hacia afuera. */
function Flame({ x, h, lean = 0 }: { x: number; h: number; lean?: number }) {
  const b = 412;
  const w = 2.6;
  const tx = x + lean;
  return (
    <path
      d={`M${x - w} ${b}Q${x - w * 0.35} ${b - h * 0.45} ${tx} ${b - h}Q${x + w * 0.35} ${b - h * 0.45} ${x + w} ${b}Z`}
    />
  );
}

function Diamond({ x, y }: { x: number; y: number }) {
  return <path className="hs-src" d={`M${x} ${y - 4.5}L${x + 4.5} ${y}L${x} ${y + 4.5}L${x - 4.5} ${y}Z`} />;
}

/** Anillo de encendido (eco del logo): aro abierto a la derecha + barra horizontal. */
function PowerRing({ className }: { className: string }) {
  const r = 20;
  const a = (38 * Math.PI) / 180;
  const px = +(RING.x + r * Math.cos(a)).toFixed(2);
  const dy = +(r * Math.sin(a)).toFixed(2);
  return (
    <g className={className}>
      <path d={`M${px} ${RING.y - dy}A${r} ${r} 0 1 0 ${px} ${RING.y + dy}`} />
      <path d={`M${RING.x} ${RING.y}H${RING.x + 29}`} />
    </g>
  );
}

export function SystemsSvg() {
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="hs-ring-glow">
          <stop offset="0.45" stopColor="#00c000" stopOpacity="0.16" />
          <stop offset="1" stopColor="#00c000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="hs-power">
        {/* ---------------- 03 GAS ---------------- */}
        <g className="hs-sys hs-g" data-sys="gas">
          <path className="hs-hit" d={`${G.supply}${G.service}M488 440h24`} />
          <path className="hs-gas anim-loop" d={G.supply} />
          <path className="hs-gas anim-loop" d={G.service} />
          <rect className="hs-meter" x="488" y="424" width="24" height="32" />
          <circle className="hs-meter-dial" cx="500" cy="437" r="6" />
          <path className="hs-meter-dial" d="M500 437l3.5-3.5" />
          <g className="hs-flames">
            <Flame x={436.5} h={8} lean={-1.2} />
            <Flame x={442} h={11} />
            <Flame x={447.5} h={8} lean={1.2} />
          </g>
          <circle className="hs-burner" cx="442" cy="414" r="3" />
          <Diamond x={580} y={496} />
        </g>

        {/* ---------------- 02 AGUA ---------------- */}
        <g className="hs-sys hs-w" data-sys="plomeria">
          <path className="hs-hit" d={`${W.main}${W.tap}`} />
          <path className="hs-pipe" d={W.main} />
          <path className="hs-pipe" d={W.tap} />
          <path className="hs-flow anim-loop" d={W.main} />
          <path className="hs-flow anim-loop" d={W.tap} />
          <path className="hs-shower" d="M433 290H447L451 297H429Z" />
          <path className="hs-drops" d="M433 304v6M440 304v6M447 304v6M436.5 316v6M443.5 316v6" />
          <Diamond x={580} y={512} />
        </g>

        {/* ---------------- 01 ENERGÍA ---------------- */}
        <g className="hs-sys hs-e" data-sys="electricidad">
          <path className="hs-hit" d={`${E.supply}${E.up}${E.ground}${E.outlets}${E.tee}`} />
          <path className="hs-wire" d={`${E.supply}${E.up}${E.ground}${E.outlets}${E.tee}`} />
          <path className="hs-pulse-glow anim-loop" d={E.pulse} pathLength={1000} />
          <path className="hs-pulse anim-loop" d={E.pulse} pathLength={1000} />
          <path className="hs-pulse-glow hs-pulse-b anim-loop" d={E.ground} pathLength={1000} />
          <path className="hs-pulse hs-pulse-b anim-loop" d={E.ground} pathLength={1000} />
          <g className="hs-panel">
            <rect x="132" y="388" width="24" height="32" />
            <path d="M138 396v8M144 396v8M150 396v8M138 412H150" />
          </g>
          <Lamp x={212} y={362} n={0} />
          <Lamp x={292} y={362} n={1} />
          <Lamp x={236} y={242} n={2} />
          <Lamp x={404} y={242} n={3} />
          <Outlet x={262} y={446} />
          <Outlet x={214} y={318} />
          <Diamond x={20} y={504} />
        </g>

        {/* Nodos (uniones y pasos por muro/losa) */}
        <g className="hs-nodes">
          {NODES.map((n, i) => (
            <g
              key={i}
              className="hs-node anim-loop"
              data-node={n.sys}
              data-x={n.x}
              data-y={n.y}
              style={{ '--i': i } as Var}
            >
              <circle className="hs-node-ring" cx={n.x} cy={n.y} r="4" />
              <circle className="hs-node-core anim-loop" cx={n.x} cy={n.y} r="4" />
            </g>
          ))}
        </g>
      </g>

      {/* ---------------- 04 HOGAR: anillo de encendido ---------------- */}
      <g className="hs-sys hs-h" data-sys="hogar">
        <circle className="hs-hit-fill" cx={RING.x} cy={RING.y} r="30" />
        <circle className="hs-ring-glow" cx={RING.x} cy={RING.y} r="33" fill="url(#hs-ring-glow)" />
        <circle className="hs-ring-wave anim-loop" cx={RING.x} cy={RING.y} r="25" />
        <PowerRing className="hs-ring hs-ring-alert" />
        <PowerRing className="hs-ring hs-ring-ok" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Capa de rótulos: líneas guía (SVG) + textos (HTML en %)             */
/* ------------------------------------------------------------------ */
export function LabelsLayer() {
  return (
    <>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true" focusable="false">
        {LABELS.map((l) => (
          <g key={l.sys} className="hs-leader" data-sys={l.sys}>
            <path d={`M${l.x} ${l.y}H${l.tx}`} />
            <circle cx={l.tx} cy={l.y} r="2.25" />
          </g>
        ))}
      </svg>
      {LABELS.map((l) => (
        <span
          key={l.sys}
          className="hs-label"
          data-sys={l.sys}
          data-side={l.side}
          style={{ left: `${((l.lx / VB_W) * 100).toFixed(3)}%`, top: `${((l.y / VB_H) * 100).toFixed(3)}%` }}
        >
          <span className="hs-label-i">{l.index}</span>
          <span className="hs-label-n">{l.name}</span>
        </span>
      ))}
    </>
  );
}
