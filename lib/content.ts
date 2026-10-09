/**
 * ÚNICA fuente de verdad del contenido del sitio.
 *
 * Regla absoluta: aquí solo vive información entregada por el cliente o presente en
 * el logo oficial. No agregar años de experiencia, clientes, testimonios, reseñas,
 * certificaciones, garantías, precios, promociones, horarios, direcciones, barrios,
 * trabajadores, alianzas ni estadísticas.
 */

export const BRAND = {
  name: 'Eléctricos y Plomeros',
  tagline: 'Soluciones Eficientes',
  fullName: 'Eléctricos y Plomeros Soluciones Eficientes',
} as const;

export const CONTACT = {
  phoneDisplay: '313 894 8186',
  phoneE164: '+573138948186',
  telHref: 'tel:+573138948186',
  whatsappNumber: '573138948186',
  facebookUrl: 'https://www.facebook.com/profile.php?id=100083289071863',
} as const;

/** Dominio público. Se usa para metadatos absolutos (Open Graph, sitemap, JSON-LD). */
export const SITE_URL = 'https://electricosyplomeros.vercel.app';

export const CITIES = [
  {
    id: 'medellin',
    name: 'Medellín',
    region: 'Antioquia',
    // Coordenadas públicas del centro de la ciudad (dato geográfico, no una dirección del negocio).
    coords: '6.24° N · 75.58° O',
  },
  {
    id: 'monteria',
    name: 'Montería',
    region: 'Córdoba',
    coords: '8.75° N · 75.88° O',
  },
] as const;

export type CityId = (typeof CITIES)[number]['id'];

/** Los cuatro sistemas del hogar. Los servicios listados son EXACTAMENTE los entregados. */
export const SYSTEMS = [
  {
    id: 'electricidad',
    index: '01',
    system: 'Energía',
    name: 'Electricidad',
    label: 'Electricidad',
    question: '¿Necesitas un electricista?',
    line: 'Instalación y reparación de redes eléctricas y electricidad residencial.',
    services: ['Instalaciones', 'Reparaciones', 'Mantenimiento', 'Redes eléctricas'],
    whatsappLabel: 'electricidad',
  },
  {
    id: 'plomeria',
    index: '02',
    system: 'Agua',
    name: 'Plomería',
    label: 'Plomería',
    question: '¿Tienes una fuga?',
    line: 'Instalaciones, reparaciones y soluciones para el agua de tu casa.',
    services: ['Instalaciones', 'Reparaciones', 'Mantenimiento', 'Soluciones de fugas'],
    whatsappLabel: 'plomería',
  },
  {
    id: 'gas',
    index: '03',
    system: 'Gas',
    name: 'Gas',
    label: 'Gas',
    question: '¿Necesitas una instalación de gas?',
    line: 'Instalaciones y servicios relacionados con gas.',
    services: ['Instalaciones', 'Mantenimiento', 'Soluciones relacionadas con gas'],
    whatsappLabel: 'gas',
  },
  {
    id: 'hogar',
    index: '04',
    system: 'Soporte',
    name: 'Asistencia para el hogar',
    label: 'Asistencia para el hogar',
    question: '¿Se dañó algo en la casa?',
    line: 'Mantenimiento y soluciones técnicas para lo que tu hogar necesite.',
    services: ['Soluciones técnicas', 'Mantenimiento', 'Atención de necesidades del hogar'],
    whatsappLabel: 'asistencia para el hogar',
  },
] as const;

export type SystemId = (typeof SYSTEMS)[number]['id'];

/** Opciones del mini diagnóstico (definidas por el cliente). */
export const DIAGNOSTIC = {
  problems: [
    { id: 'fuga', label: 'Fuga' },
    { id: 'electrico', label: 'Problema eléctrico' },
    { id: 'gas', label: 'Problema de gas' },
    { id: 'instalacion', label: 'Instalación' },
    { id: 'mantenimiento', label: 'Mantenimiento' },
    { id: 'otro', label: 'Otro' },
  ],
  places: [
    { id: 'casa', label: 'Casa' },
    { id: 'apartamento', label: 'Apartamento' },
    { id: 'local', label: 'Local' },
    { id: 'oficina', label: 'Oficina' },
    { id: 'otro', label: 'Otro' },
  ],
  /**
   * Orden sugerido de problemas según el servicio elegido (solo reordena: todas las
   * opciones siguen disponibles).
   */
  problemOrder: {
    electricidad: ['electrico', 'instalacion', 'mantenimiento', 'fuga', 'gas', 'otro'],
    plomeria: ['fuga', 'instalacion', 'mantenimiento', 'electrico', 'gas', 'otro'],
    gas: ['gas', 'instalacion', 'mantenimiento', 'fuga', 'electrico', 'otro'],
    hogar: ['mantenimiento', 'instalacion', 'electrico', 'fuga', 'gas', 'otro'],
  },
} as const;

export const NAV = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#diagnostico', label: 'Soluciones' },
  { href: '#cobertura', label: 'Cobertura' },
  { href: '#contacto', label: 'Contacto' },
] as const;

export const SEO = {
  title: 'Eléctricos y Plomeros | Soluciones Eficientes en Medellín y Montería',
  description:
    'Electricista y plomero en Medellín y Montería: redes eléctricas, plomería, gas y asistencia para el hogar. Cotiza por WhatsApp al 313 894 8186.',
  keywords: [
    'electricista Medellín',
    'plomero Medellín',
    'electricista Montería',
    'plomero Montería',
    'servicios eléctricos Medellín',
    'servicios de plomería Medellín',
    'servicios para el hogar',
  ],
} as const;
