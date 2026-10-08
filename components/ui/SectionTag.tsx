import { cx } from './Cta';

/**
 * Rótulo técnico de sección: nodo + índice + texto en mono.
 * Ej.: <SectionTag index="02">Entender</SectionTag>  →  ● 02 — ENTENDER
 */
export default function SectionTag({
  index,
  children,
  tone = 'light',
  className,
}: {
  index?: string;
  children: React.ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <p className={cx('t-label inline-flex items-center gap-3', tone === 'dark' ? 'text-mist-2' : 'text-ink-3', className)}>
      <span
        aria-hidden="true"
        className={cx('inline-block size-2 rotate-45', tone === 'dark' ? 'bg-electric-glow' : 'bg-violet')}
      />
      {index && (
        <>
          <span className={tone === 'dark' ? 'text-mist' : 'text-violet'}>{index}</span>
          <span aria-hidden="true" className={cx('h-px w-6', tone === 'dark' ? 'bg-mist-3' : 'bg-ink-3')} />
        </>
      )}
      <span>{children}</span>
    </p>
  );
}
