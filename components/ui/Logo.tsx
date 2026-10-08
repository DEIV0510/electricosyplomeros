/**
 * Logo OFICIAL (archivo del cliente, solo escalado y comprimido; proporción 1899×790).
 * Lleva texto negro y morado: úsalo siempre sobre superficies claras.
 * Controla el tamaño con la ALTURA (p. ej. className="h-12 w-auto"); el ancho sale solo.
 */
type LogoProps = {
  className?: string;
  /** true solo para el logo visible al cargar (navbar / pantalla de carga). */
  priority?: boolean;
  /** Ancho mostrado aproximado, para elegir el archivo correcto. */
  sizes?: string;
  alt?: string;
};

const SRC = (ext: string) => `/brand/logo-320.${ext} 320w, /brand/logo-640.${ext} 640w, /brand/logo-960.${ext} 960w, /brand/logo-1440.${ext} 1440w`;

export default function Logo({
  className,
  priority = false,
  sizes = '160px',
  alt = 'Eléctricos y Plomeros, Soluciones Eficientes',
}: LogoProps) {
  return (
    <picture style={{ display: 'contents' }}>
      <source type="image/avif" srcSet={SRC('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={SRC('webp')} sizes={sizes} />
      <img
        src="/brand/logo-640.png"
        srcSet="/brand/logo-640.png 640w, /brand/logo-960.png 960w"
        sizes={sizes}
        width={1899}
        height={790}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}
