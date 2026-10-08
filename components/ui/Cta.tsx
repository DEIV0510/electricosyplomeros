import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { whatsappUrl, DEFAULT_MESSAGE } from '@/lib/whatsapp';
import { CONTACT } from '@/lib/content';
import { IconArrowRight, IconPhone, IconWhatsApp } from './Icons';

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

type Variant = 'primary' | 'secondary' | 'on-dark';

type WhatsAppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  message?: string;
  variant?: Variant;
  size?: 'md' | 'lg';
  children: ReactNode;
  /** Ícono de WhatsApp a la izquierda (por defecto sí). */
  icon?: boolean;
  /** Flecha a la derecha (por defecto no). */
  arrow?: boolean;
};

/**
 * Botón/enlace a WhatsApp. Es un <a> real (no window.open): funciona aunque el
 * navegador bloquee ventanas emergentes y se puede abrir con teclado o clic medio.
 */
export function WhatsAppLink({
  message = DEFAULT_MESSAGE,
  variant = 'primary',
  size = 'md',
  icon = true,
  arrow = false,
  className,
  children,
  ...rest
}: WhatsAppLinkProps) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cx('btn', `btn-${variant}`, size === 'lg' && 'btn-lg', className)}
      {...rest}
    >
      {icon && <IconWhatsApp size={size === 'lg' ? 24 : 20} />}
      <span>{children}</span>
      {arrow && <IconArrowRight className="btn-arrow" size={20} />}
      <span className="sr-only"> (se abre WhatsApp)</span>
    </a>
  );
}

/** Enlace de llamada con el número visible. */
export function CallLink({ className, children, ...rest }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { children?: ReactNode }) {
  return (
    <a href={CONTACT.telHref} className={className} {...rest}>
      {children ?? (
        <>
          <IconPhone size={18} />
          <span>{CONTACT.phoneDisplay}</span>
          <span className="sr-only"> (llamar)</span>
        </>
      )}
    </a>
  );
}
