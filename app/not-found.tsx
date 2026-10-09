import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { WhatsAppLink } from "@/components/ui/Cta";
import { IconArrowLeft } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Página no encontrada | Eléctricos y Plomeros",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="contenido" tabIndex={-1} className="bg-grid min-h-svh outline-none">
      <div className="container-x flex min-h-svh flex-col justify-center gap-10 py-16">
        <Link href="/" className="w-fit" aria-label="Eléctricos y Plomeros, Soluciones Eficientes: ir al inicio">
          <Logo className="h-14 w-auto sm:h-16" sizes="160px" alt="" />
        </Link>
        <div className="max-w-2xl">
          <p className="t-label mb-5 inline-flex items-center gap-3 text-ink-3">
            <span aria-hidden="true" className="inline-block size-2 rotate-45 bg-violet" />
            Error 404
          </p>
          <h1 className="t-display text-[clamp(2.1rem,6vw,4rem)]">
            No encontramos <span className="text-violet">esta página.</span>
          </h1>
          <p className="t-lead mt-5 max-w-xl">
            Puede que el enlace haya cambiado. Vuelve al inicio o escríbenos y te ayudamos.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <WhatsAppLink>Cotizar por WhatsApp</WhatsAppLink>
          <Link href="/" className="btn btn-secondary">
            <IconArrowLeft size={20} />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
