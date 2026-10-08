import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Diagnostic from "@/components/Diagnostic";
import Systems from "@/components/Systems";
import NotOnlyFix from "@/components/NotOnlyFix";
import Coverage from "@/components/Coverage";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CircuitRail from "@/components/CircuitRail";
import RevealController from "@/components/RevealController";
import { BRAND, CITIES, CONTACT, SITE_URL, SYSTEMS } from "@/lib/content";

// Datos estructurados (negocio local). Solo información entregada por el cliente:
// sin dirección, horarios, reseñas ni precios.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Electrician", "Plumber"],
  "@id": `${SITE_URL}/#negocio`,
  name: BRAND.fullName,
  alternateName: BRAND.name,
  slogan: BRAND.tagline,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-960.png`,
  image: `${SITE_URL}/brand/logo-960.png`,
  telephone: CONTACT.phoneE164,
  sameAs: [CONTACT.facebookUrl],
  areaServed: CITIES.map((c) => ({
    "@type": "City",
    name: c.name,
    containedInPlace: { "@type": "AdministrativeArea", name: c.region },
  })),
  knowsAbout: [
    "Instalación y reparación de redes eléctricas",
    "Electricidad residencial",
    "Plomería",
    "Instalaciones y servicios relacionados con gas",
    "Asistencia para el hogar",
    "Mantenimiento y soluciones técnicas",
  ],
  makesOffer: SYSTEMS.map((s) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: s.name, serviceType: s.name },
  })),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: CONTACT.phoneE164,
    contactType: "customer service",
    areaServed: "CO",
    availableLanguage: ["es"],
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <CircuitRail />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <Hero />
        <Diagnostic />
        <Systems />
        <NotOnlyFix />
        <Coverage />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <RevealController />
    </>
  );
}
