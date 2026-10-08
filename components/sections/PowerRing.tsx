import type { SVGProps } from 'react';

/**
 * Anillo de encendido del logo (círculo abierto a la derecha + barra horizontal desde el
 * centro). Es un eco geométrico del logo, no el logo: el logo real solo va por <Logo />.
 * Decorativo siempre (aria-hidden). `nonScaling` mantiene el grosor del trazo en px
 * aunque el SVG se escale mucho (motivo grande de fondo).
 *
 * Geometría (viewBox 44×32): centro (16,16), radio 12, abertura de ±34°.
 */
export const RING_ARC = 'M25.95 9.29A12 12 0 1 0 25.95 22.71';
export const RING_BAR = 'M20.6 16H40';

type Props = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  strokeWidth?: number;
  nonScaling?: boolean;
  /** Clases para cada trazo (p. ej. para dibujarlos con stroke-dashoffset). */
  arcClassName?: string;
  barClassName?: string;
};

export default function PowerRing({
  strokeWidth = 3.4,
  nonScaling = false,
  arcClassName,
  barClassName,
  ...rest
}: Props) {
  const ve = nonScaling ? ('non-scaling-stroke' as const) : undefined;
  return (
    <svg
      viewBox="0 0 44 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={RING_ARC} pathLength={1} vectorEffect={ve} className={arcClassName} />
      <path d={RING_BAR} pathLength={1} vectorEffect={ve} className={barClassName} />
    </svg>
  );
}
