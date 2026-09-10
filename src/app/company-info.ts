/**
 * Datos legales y horario del estudio: una sola fuente para el pie de página, /contacto y los
 * datos estructurados (Organization). Acordado con Robert el 10 sep 2026 (plan de la nota de
 * página de destino en LinkDesign-simple, docs/plan-nota-pagina-destino.md).
 */
export const COMPANY_LEGAL = {
  legalName: 'NOLO CAAR',
  /** CUIT (clave única de identificación tributaria). */
  taxId: '30-71951427-4',
  showLegalName: true,
  label: { es: 'CUIT', en: 'CUIT' }
} as const;

/** Horario de atención: largo para /contacto, corto para el pie. Coincide con el horario de las campañas (L-V 9-18). */
export const COMPANY_SCHEDULE = {
  es: { long: 'Lunes a viernes, 9 a 18', short: 'L-V, 9 a 18' },
  en: { long: 'Monday to Friday, 9am to 6pm', short: 'Mon-Fri, 9am-6pm' }
} as const;
