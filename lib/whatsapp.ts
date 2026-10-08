import { BRAND, CONTACT, CITIES, SYSTEMS, type CityId, type SystemId } from './content';

export const DEFAULT_MESSAGE = `Hola, quiero solicitar una cotización de ${BRAND.fullName}.`;

/** Enlace wa.me con mensaje prellenado (codificado de forma segura). */
export function whatsappUrl(message: string = DEFAULT_MESSAGE): string {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DEFAULT_URL = whatsappUrl();

export function serviceMessage(id: SystemId): string {
  const s = SYSTEMS.find((x) => x.id === id);
  return `Hola, quiero solicitar un servicio de ${s?.whatsappLabel ?? 'mantenimiento'} con ${BRAND.fullName}. Quisiera recibir información.`;
}

export function cityMessage(id: CityId): string {
  const c = CITIES.find((x) => x.id === id);
  return `Hola, estoy en ${c?.name ?? ''} y quiero solicitar una cotización de ${BRAND.fullName}.`;
}

export type DiagnosticAnswers = {
  service: string; // etiqueta legible, p. ej. "Plomería"
  problem: string; // "Fuga"
  place: string; // "Casa"
  city: string; // "Medellín"
  details: string;
  name?: string;
};

/** Mensaje del mini diagnóstico, con el formato pedido por el cliente. */
export function diagnosticMessage(a: DiagnosticAnswers): string {
  const lines = [
    a.name?.trim() ? `Hola, soy ${a.name.trim()}. Quiero solicitar una cotización.` : 'Hola, quiero solicitar una cotización.',
    '',
    `Servicio: ${a.service}`,
    `Problema: ${a.problem}`,
    `Lugar: ${a.place}`,
    `Ciudad: ${a.city}`,
  ];
  if (a.details.trim()) lines.push(`Detalles: ${a.details.trim()}`);
  lines.push('', 'Quisiera recibir información.');
  return lines.join('\n');
}
