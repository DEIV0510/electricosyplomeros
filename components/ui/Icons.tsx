import type { SVGProps } from 'react';

/**
 * Set de íconos propio: retícula de 24 px, trazo 1.75, extremos redondeados
 * (como los trazos redondeados del logo). Decorativos por defecto (aria-hidden):
 * el texto del control debe describir la acción.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

function Base({ size = 24, strokeWidth = 1.75, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
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

export const IconBolt = (p: IconProps) => (
  <Base {...p}>
    <path d="M13.2 2.6 5.6 13.4h5.6l-1.1 8 7.7-11h-5.7l1.1-7.8Z" />
  </Base>
);

export const IconDrop = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.2c3.3 4.1 5.9 7.4 5.9 10.7a5.9 5.9 0 0 1-11.8 0c0-3.3 2.6-6.6 5.9-10.7Z" />
    <path d="M9.2 14.6a2.9 2.9 0 0 0 2.4 2.6" />
  </Base>
);

export const IconFlame = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21.4c-3.5 0-6.2-2.5-6.2-5.9 0-3.1 2-5 3.5-7.1.3 1.5 1.1 2.5 2.2 3 .1-2.9 1.3-5.4 3.6-7.6-.2 2.7.8 4.6 2 6.4 1 1.5 1.9 3.1 1.9 5.3 0 3.4-2.6 5.9-7 5.9Z" />
    <path d="M12 21.4c-1.5 0-2.6-1-2.6-2.5 0-1.4 1-2.3 2.1-3.4.4 1 1 1.5 1.7 1.7.6.8.9 1.3.9 1.9 0 1.3-.9 2.3-2.1 2.3Z" />
  </Base>
);

export const IconHome = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.4 11.2 12 4l8.6 7.2" />
    <path d="M5.6 9.6V20h12.8V9.6" />
    <path d="M10 20v-5.6h4V20" />
  </Base>
);

export const IconPower = (p: IconProps) => (
  <Base {...p}>
    <path d="M7.4 6.4a7.6 7.6 0 1 0 9.2 0" />
    <path d="M12 3v8.4" />
  </Base>
);

export const IconPhone = (p: IconProps) => (
  <Base {...p}>
    <path d="M5.1 3.8h3.1l1.6 4.1-2 1.3a10.6 10.6 0 0 0 5 5l1.3-2 4.1 1.6v3.1a2 2 0 0 1-2.2 2A16.4 16.4 0 0 1 3.1 6a2 2 0 0 1 2-2.2Z" />
  </Base>
);

export const IconArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h15.5" />
    <path d="m13.5 6 6 6-6 6" />
  </Base>
);

export const IconArrowLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12H4.5" />
    <path d="m10.5 6-6 6 6 6" />
  </Base>
);

export const IconArrowDown = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v15.5" />
    <path d="m6 13.5 6 6 6-6" />
  </Base>
);

export const IconMenu = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 8h17" />
    <path d="M3.5 16h17" />
  </Base>
);

export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="M5.5 5.5 18.5 18.5" />
    <path d="M18.5 5.5 5.5 18.5" />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m4.8 12.6 4.6 4.5 9.8-10" />
  </Base>
);

export const IconPin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21.2s-6.6-5.7-6.6-11.1a6.6 6.6 0 0 1 13.2 0c0 5.4-6.6 11.1-6.6 11.1Z" />
    <circle cx="12" cy="10.1" r="2.3" />
  </Base>
);

export const IconEdit = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h4.2L19.4 8.8a2.1 2.1 0 0 0 0-3l-1.2-1.2a2.1 2.1 0 0 0-3 0L4 15.8V20Z" />
    <path d="m13.6 6.2 4.2 4.2" />
  </Base>
);

export const IconAlert = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.6 2.8 19.6h18.4L12 3.6Z" />
    <path d="M12 9.6v4.6" />
    <path d="M12 17.1v.1" />
  </Base>
);

export const IconCopy = (p: IconProps) => (
  <Base {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="1" />
    <path d="M15.5 8.5V5.5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3" />
  </Base>
);

/** Marca de WhatsApp (glifo oficial, Simple Icons CC0). Relleno, no trazo. */
export const IconWhatsApp = ({ size = 24, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

/** Marca de Facebook (glifo oficial, Simple Icons CC0). */
export const IconFacebook = ({ size = 24, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
  </svg>
);

/** Ícono por sistema del hogar. */
export const SYSTEM_ICONS = {
  electricidad: IconBolt,
  plomeria: IconDrop,
  gas: IconFlame,
  hogar: IconHome,
} as const;
