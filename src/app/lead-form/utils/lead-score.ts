import { LeadPayload } from '../models/lead-payload.model';
import { SourceLanding } from '../models/lead-form-options';

/**
 * Lead scoring — port fiel de calculateScore() del CRM.
 * Fuente original: LinkDesign CRM → server/src/modules/web-leads/web-lead.scoring.ts
 *
 * ⚠ Si el CRM tunea pesos o umbrales, este archivo debe actualizarse en paralelo
 * para que el value enviado a Google Ads se mantenga alineado con la categoría
 * que el CRM almacena en el documento WebLead.
 *
 * Esta lógica vive aquí (duplicada del server) porque hoy el endpoint público
 * del CRM no devuelve el score en su respuesta. Cuando lo haga, esta utility
 * puede quedar como fallback para dev/simulateSubmit y eliminarse del flujo
 * productivo.
 */

export type LeadScoreCategory =
  | 'hot'
  | 'warm'
  | 'cold'
  | 'nurture'
  | 'suspicious';

export interface LeadScoreFactor {
  factor: string;
  points: number;
}

export interface LeadScoreResult {
  score: number;
  category: LeadScoreCategory;
  breakdown: LeadScoreFactor[];
}

/**
 * Mapa categoría → value en USD a reportar a Google Ads.
 * - `suspicious` → null: NO disparar conversión (señales muy negativas).
 * - Techo (`hot` = 30) iguala al evento "Agendar" del sitio, considerado
 *   la conversión más caliente posible.
 * - Piso (`nurture` = 15) iguala al click a teléfono.
 */
export const LEAD_SCORE_ADS_VALUE: Record<LeadScoreCategory, number | null> = {
  suspicious: null,
  nurture: 15,
  cold: 18,
  warm: 24,
  hot: 30
};

const TIMING_OR_BUDGET_RE =
  /\b(mes|presupuesto|usd|colones|peso|pesos|julio|agosto|septiembre|octubre|noviembre|diciembre|enero|febrero|marzo|abril|mayo|junio|q1|q2|q3|q4|antes\s+de|para\s+el)\b/i;

/**
 * Calcula score + categoría de un payload de lead siguiendo la misma fórmula
 * que el CRM aplica en el server. Función pura, sin side effects.
 */
export function computeLeadScore(payload: LeadPayload): LeadScoreResult {
  const breakdown: LeadScoreFactor[] = [];

  const add = (factor: string, points: number): void => {
    if (points !== 0) {
      breakdown.push({ factor, points });
    }
  };

  // ----- Contact -----
  if (payload.contact.email_domain_type === 'corporate') {
    add('email_corporativo', 15);
  } else {
    add('email_personal', -5);
  }
  if (payload.contact.company) {
    add('tiene_empresa', 10);
  }

  // ----- Intent -----
  const needs = payload.intent.need ?? [];
  if (needs.includes('software_a_medida')) add('need_software', 20);
  if (needs.includes('ecommerce')) add('need_ecommerce', 12);
  if (needs.includes('sitio_web')) add('need_sitio_web', 8);
  if (needs.length >= 2) add('multi_servicio', 5);

  const preferred = payload.intent.preferred_contact ?? [];
  if (preferred.includes('llamada')) add('prefiere_llamada', 12);
  if (preferred.includes('whatsapp')) add('prefiere_whatsapp', 8);

  const msg = payload.intent.message;
  if (msg && msg.length > 100) {
    add('mensaje_largo', 12);
  }
  if (msg && TIMING_OR_BUDGET_RE.test(msg)) {
    add('mensaje_menciona_tiempo_o_presupuesto', 10);
  }

  // ----- Source landing -----
  if (payload.source.landing === 'software') add('landing_software', 10);
  if (payload.source.landing === 'corporate') add('landing_corporate', 5);

  // ----- Attribution -----
  if (payload.attribution.utm_medium === 'cpc') add('utm_cpc', 8);
  if (payload.attribution.gclid) add('tiene_gclid', 5);

  // ----- Session -----
  const timeMs = payload.session.time_on_site_ms ?? 0;
  if (timeMs > 120_000) add('time_on_site_>2min', 10);
  if (timeMs < 30_000) add('time_on_site_<30s', -10);

  const pages = payload.session.pages_visited ?? 0;
  if (pages >= 3) add('pages_visited_>=3', 8);
  if (pages >= 5) add('pages_visited_>=5', 5);
  if (pages === 1) add('pages_visited_==1', -8);

  if ((payload.session.interaction_count ?? 0) < 3) {
    add('interaction_<3', -5);
  }
  if ((payload.session.form_load_to_submit_ms ?? 0) < 10_000) {
    add('form_llenado_<10s', -5);
  }

  if (payload.session.country === 'CR') add('pais_CR', 8);
  if (payload.session.country_source === 'both') add('pais_alta_confianza', 2);

  // ----- Anti-spam -----
  const allPassed =
    payload.anti_spam.passed_honeypot &&
    payload.anti_spam.passed_time_check &&
    payload.anti_spam.passed_interaction_check;
  if (allPassed) {
    add('anti_spam_pasa_todo', 5);
  } else {
    add('anti_spam_fallido', -50);
  }

  const score = breakdown.reduce((acc, b) => acc + b.points, 0);

  return {
    score,
    category: deriveCategory(score),
    breakdown
  };
}

function deriveCategory(score: number): LeadScoreCategory {
  if (score < 0) return 'suspicious';
  if (score >= 80) return 'hot';
  if (score >= 50) return 'warm';
  if (score >= 20) return 'cold';
  return 'nurture';
}

// ──────────────────────────────────────────────────────────────────────────
// Señales de sesión — subconjunto del scoring disponible SIN formulario
// ──────────────────────────────────────────────────────────────────────────

/**
 * Campos mínimos para puntuar la calidad de una sesión sin que el usuario haya
 * llenado el formulario. Es lo que `LeadTrackingService` puede entregar en
 * cualquier momento de la visita.
 */
export interface SessionSignals {
  landing: SourceLanding;
  utm_medium: string | null;
  gclid: string | null;
  time_on_site_ms: number;
  pages_visited: number;
  country: string | null;
  country_source: 'timezone' | 'locale' | 'both' | null;
}

/**
 * Puntúa SOLO las señales de sesión/atribución/landing — el subconjunto de
 * factores de `computeLeadScore` que existe aunque no haya formulario.
 * Función pura. Rango efectivo aprox: -13 (sesión muy pobre) … +56 (ideal).
 *
 * Lo usa `AdsService` para modular el value de las conversiones de click
 * (WhatsApp, copiar correo, agendar) según qué tan caliente viene la sesión,
 * en vez de un value fijo.
 *
 * ⚠ Los pesos replican la porción de sesión/atribución/landing de
 * `computeLeadScore` (y por ende del CRM). NO es crítico que coincidan al dígito
 * —el resultado se normaliza a un factor 0.7–1.0— pero sí en signo y orden de
 * magnitud. Si el CRM retoca esos pesos, conviene reflejarlo aquí para mantener
 * la idea "una sesión de calidad X vale lo mismo en cualquier evento".
 * NO incluye los factores que dependen del formulario (email, empresa, needs,
 * mensaje, anti-spam, interaction_count, form_load_to_submit_ms).
 */
export function scoreSessionSignals(
  s: SessionSignals
): { score: number; breakdown: LeadScoreFactor[] } {
  const breakdown: LeadScoreFactor[] = [];
  const add = (factor: string, points: number): void => {
    if (points !== 0) breakdown.push({ factor, points });
  };

  // ----- Source landing -----
  if (s.landing === 'software') add('landing_software', 10);
  if (s.landing === 'corporate') add('landing_corporate', 5);

  // ----- Attribution -----
  if (s.utm_medium === 'cpc') add('utm_cpc', 8);
  if (s.gclid) add('tiene_gclid', 5);

  // ----- Session -----
  const timeMs = s.time_on_site_ms ?? 0;
  if (timeMs > 120_000) add('time_on_site_>2min', 10);
  if (timeMs < 30_000) add('time_on_site_<30s', -10);

  const pages = s.pages_visited ?? 0;
  if (pages >= 3) add('pages_visited_>=3', 8);
  if (pages >= 5) add('pages_visited_>=5', 5);
  if (pages === 1) add('pages_visited_==1', -8);

  if (s.country === 'CR') add('pais_CR', 8);
  if (s.country_source === 'both') add('pais_alta_confianza', 2);

  const score = breakdown.reduce((acc, b) => acc + b.points, 0);
  return { score, breakdown };
}

/**
 * Mapea el score de señales de sesión a un factor multiplicador del value base
 * de una conversión de click.
 *
 * Opción A (acordada): solo PENALIZA sesiones flojas; nunca sube por encima del
 * value base (techo = 1.0). Así el formulario sigue siendo el techo del sitio y
 * no hay que recalibrar su escala (atada al scoring del CRM).
 *
 *   floja      score < 0    → 0.7
 *   media      0 – 19       → 0.8
 *   buena      20 – 39      → 0.9
 *   excelente  ≥ 40         → 1.0
 */
export function sessionQualityFactor(score: number): number {
  if (score < 0) return 0.7;
  if (score < 20) return 0.8;
  if (score < 40) return 0.9;
  return 1.0;
}

/**
 * Aplica el factor de calidad de sesión a un value base y redondea a 2 decimales.
 * Es la fórmula que usa `AdsService` para los clicks de contacto. Pura y testeable.
 */
export function modulateValueBySession(base: number, s: SessionSignals): number {
  const { score } = scoreSessionSignals(s);
  return Math.round(base * sessionQualityFactor(score) * 100) / 100;
}
