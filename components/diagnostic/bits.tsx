import type { SVGProps } from 'react';
import { STEPS, isAnswered, type Answers, type View } from './model';

/** 5 segmentos de progreso: se encienden en verde al completar cada paso. */
export function Segments({ a, view }: { a: Answers; view: View }) {
  return (
    <ol className="dx-segs" aria-hidden="true">
      {STEPS.map((step) => (
        <li
          key={step}
          className="dx-seg"
          data-done={isAnswered(a, step) ? 'true' : 'false'}
          data-current={view === step ? 'true' : 'false'}
        />
      ))}
    </ol>
  );
}

type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconRestart = (p: P) => (
  <Base {...p}>
    <path d="M4.6 12.2a7.4 7.4 0 1 0 2.3-5.6" />
    <path d="M4.4 3.8v4.4h4.4" />
  </Base>
);

export const IconChevron = (p: P) => (
  <Base {...p}>
    <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
  </Base>
);
