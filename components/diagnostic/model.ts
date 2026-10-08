import { CITIES, DIAGNOSTIC, SYSTEMS, type CityId, type SystemId } from '@/lib/content';
import { diagnosticMessage } from '@/lib/whatsapp';

/**
 * Modelo del mini diagnóstico: pasos, respuestas, validación y mensaje.
 * Sin estado ni efectos: lo usa DiagnosticTool.
 */

export type ProblemId = (typeof DIAGNOSTIC.problems)[number]['id'];
export type PlaceId = (typeof DIAGNOSTIC.places)[number]['id'];
export type StepNo = 1 | 2 | 3 | 4 | 5;
/** 1 = selector de servicio; 2–5 = consola; 'result' = ficha final. */
export type View = StepNo | 'result';
export type FieldKey = 'service' | 'problem' | 'place' | 'city' | 'details';

export type Answers = {
  service: SystemId | null;
  problem: ProblemId | null;
  place: PlaceId | null;
  city: CityId | null;
  details: string;
  name: string;
};

export const EMPTY_ANSWERS: Answers = {
  service: null,
  problem: null,
  place: null,
  city: null,
  details: '',
  name: '',
};

export const DETAILS_MIN = 10;
export const DETAILS_MAX = 600;
export const STEPS: readonly StepNo[] = [1, 2, 3, 4, 5];

export const STEP_META: Record<StepNo, { key: FieldKey; label: string; question: string; hint?: string }> = {
  1: { key: 'service', label: 'Servicio', question: '¿Qué necesitas?' },
  2: { key: 'problem', label: 'Problema', question: '¿Qué está pasando?', hint: 'Elige la opción que más se parezca.' },
  3: { key: 'place', label: 'Lugar', question: '¿Dónde está ocurriendo?', hint: 'Así sabemos qué tipo de espacio es.' },
  4: { key: 'city', label: 'Ciudad', question: '¿En qué ciudad?', hint: 'Atendemos en Medellín y Montería.' },
  5: { key: 'details', label: 'Detalles', question: 'Cuéntanos un poco más' },
};

export const systemOf = (id: SystemId | null) => SYSTEMS.find((s) => s.id === id) ?? null;
export const problemLabel = (id: ProblemId | null) => DIAGNOSTIC.problems.find((p) => p.id === id)?.label ?? null;
export const placeLabel = (id: PlaceId | null) => DIAGNOSTIC.places.find((p) => p.id === id)?.label ?? null;
export const cityOf = (id: CityId | null) => CITIES.find((c) => c.id === id) ?? null;

/** Problemas en el orden sugerido para el servicio (todas las opciones siguen visibles). */
export function orderedProblems(service: SystemId | null) {
  if (!service) return [...DIAGNOSTIC.problems];
  const order = DIAGNOSTIC.problemOrder[service] as readonly ProblemId[];
  return [...DIAGNOSTIC.problems].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

export const detailsOk = (details: string) => details.trim().length >= DETAILS_MIN;

export function isAnswered(a: Answers, step: StepNo): boolean {
  switch (step) {
    case 1:
      return !!a.service;
    case 2:
      return !!a.problem;
    case 3:
      return !!a.place;
    case 4:
      return !!a.city;
    case 5:
      return detailsOk(a.details);
  }
}

export const missingSteps = (a: Answers): StepNo[] => STEPS.filter((s) => !isAnswered(a, s));

/**
 * Siguiente vista tras responder `from`: el primer paso pendiente después de él,
 * luego los pendientes anteriores; si no falta nada, la ficha final.
 */
export function nextView(a: Answers, from: StepNo): View {
  const after = STEPS.filter((s) => s > from && !isAnswered(a, s));
  if (after.length) return after[0];
  const before = STEPS.filter((s) => s < from && !isAnswered(a, s));
  if (before.length) return before[0];
  return 'result';
}

/** Texto legible de la respuesta de un paso (null si falta). */
export function valueText(a: Answers, step: StepNo): string | null {
  switch (step) {
    case 1:
      return systemOf(a.service)?.name ?? null;
    case 2:
      return problemLabel(a.problem);
    case 3:
      return placeLabel(a.place);
    case 4:
      return cityOf(a.city)?.name ?? null;
    case 5:
      return detailsOk(a.details) ? a.details.trim() : null;
  }
}

/** Mensaje de WhatsApp con el formato pedido por el cliente. */
export function buildMessage(a: Answers): string {
  return diagnosticMessage({
    service: systemOf(a.service)?.name ?? '',
    problem: problemLabel(a.problem) ?? '',
    place: placeLabel(a.place) ?? '',
    city: cityOf(a.city)?.name ?? '',
    details: a.details,
    name: a.name,
  });
}
