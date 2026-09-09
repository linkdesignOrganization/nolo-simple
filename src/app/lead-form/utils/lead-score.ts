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
 * Escala ×2 desde jul 2026 para ampliar el contraste contra SCROLL (value 1)
 * en Smart Bidding — cambio espejo del sitio LinkDesign.
 * - `suspicious` → null: NO disparar conversión (señales muy negativas).
 * - Techo (`hot` = 60) iguala al evento "Agendar" del sitio, considerado
 *   la conversión más caliente posible.
 */
export const LEAD_SCORE_ADS_VALUE: Record<LeadScoreCategory, number | null> = {
  suspicious: null,
  nurture: 30,
  cold: 36,
  warm: 48,
  hot: 60
};

const TIMING_OR_BUDGET_RE =
  /\b(mes|presupuesto|usd|colones|peso|pesos|julio|agosto|septiembre|octubre|noviembre|diciembre|enero|febrero|marzo|abril|mayo|junio|q1|q2|q3|q4|antes\s+de|para\s+el)\b/i;

/**
 * Línea de contexto que el SITIO antepone al mensaje, en su propia línea y entre
 * corchetes: `[Consulta desde la página del sistema: Demo Pulso (…)]`. La
 * escribe el sitio para que el CRM sepa de qué página vino el lead, no la
 * persona, así que no debe contar como mensaje.
 *
 * Se reconoce por la FORMA y no por el texto, a propósito: hoy hay cuatro
 * variantes (sistema e industria, en español e inglés), Link Design y Nolõ no
 * las redactan igual, el hub de Costa Rica reusa la de sistema con otro nombre,
 * y el bloque 2 puede cambiarlas. Un patrón atado a las palabras envejecería
 * igual que envejeció `detectLanding()`.
 *
 * Exige que los corchetes ocupen la línea entera. Un mensaje que empieza con
 * `[urgente] necesito…` no la dispara: ahí los corchetes van seguidos de texto
 * en la misma línea, forma que el sitio nunca produce.
 */
const LEAD_CONTEXT_PREFIX_RE = /^\s*\[[^\]\n]{1,200}\](\n+\s*|\s*$)/;

/**
 * Devuelve el mensaje sin la línea de contexto que antepone el sitio.
 *
 * Los dos factores de mensaje se miden sobre esto. Sin descontarlo, el prefijo
 * de una ficha de demo mide hasta 105 caracteres y cobra él solo los doce
 * puntos de «mensaje detallado» con el campo vacío; y basta que alguien nombre
 * un sistema «Mantenimiento mensual» para que todos sus leads cobren además los
 * diez de «menciona plazos o presupuesto».
 *
 * DESDE LA v1.6.0 ESTA FUNCIÓN NO ACTÚA SOBRE NADA NUEVO. El contexto dejó de
 * anteponerse al mensaje y viaja en su propio campo, `source.page_context`, así
 * que los envíos de hoy llegan sin prefijo y esto los devuelve intactos. No se
 * borra porque los leads guardados SÍ lo llevan dentro del mensaje y el CRM los
 * recalcula con esta misma fórmula: quitarla les cambiaría el puntaje.
 *
 * Si algún día el prefijo cambia de forma (deja de ser una línea entera entre
 * corchetes), hay que actualizar el patrón en los tres repos a la vez.
 */
export function stripLeadContextPrefix(
  message: string | null | undefined
): string {
  if (!message) return '';
  return message.replace(LEAD_CONTEXT_PREFIX_RE, '');
}

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

  // Solo lo que escribió la persona: sin la línea de contexto del sitio.
  const msg = stripLeadContextPrefix(payload.intent.message);
  if (msg.length > 100) {
    add('mensaje_largo', 12);
  }
  if (msg && TIMING_OR_BUDGET_RE.test(msg)) {
    add('mensaje_menciona_tiempo_o_presupuesto', 10);
  }

  // ----- Source landing -----
  // Vocabulario nuevo (2026-09-08). Cada página real conserva los puntos que ya
  // tenía: el brazo web sigue valiendo 5 con su nombre propio, y las industrias
  // los 5 que cobraban por caer en el cajón. `contact`, `other` y los heredados
  // `corporate` y `weblab` no suman: el cajón por defecto dejó de dar puntos.
  if (payload.source.landing === 'software') add('landing_software', 10);
  if (payload.source.landing === 'web') add('landing_web', 5);
  if (payload.source.landing === 'industries') add('landing_industries', 5);

  // ----- Attribution -----
  if (payload.attribution.utm_medium === 'cpc') add('utm_cpc', 8);
  if (payload.attribution.gclid) add('tiene_gclid', 5);

  // ----- Session -----
  // Tiempo ACTIVO: descuenta la pestaña en segundo plano. Sin esto, una pestaña
  // abierta y olvidada media hora cobra el bono de «estuvo más de dos minutos».
  // El campo viaja en cada envío desde junio de 2026 y no lo leía nadie.
  // Un 0 se trata como ausente y cae al reloj de pared: el CRM completa con 0
  // los payloads anteriores a la v1.1.0, y ahí no hay forma de distinguir un
  // cero de un campo que nunca vino. En un envío real no es 0 nunca, porque el
  // anti-spam exige cinco segundos entre carga y envío.
  const timeMs =
    payload.session.time_on_site_active_ms || payload.session.time_on_site_ms || 0;
  if (timeMs > 120_000) add('time_on_site_>2min', 10);
  if (timeMs < 30_000) add('time_on_site_<30s', -10);

  const pages = payload.session.pages_visited ?? 0;
  if (pages >= 3) add('pages_visited_>=3', 8);
  if (pages >= 5) add('pages_visited_>=5', 5);
  if (pages === 1) add('pages_visited_==1', -8);

  // El factor `interaction_<3` (-5) salió el 2026-09-08. Era inalcanzable: el
  // llenado mínimo que el formulario acepta para enviarse ya produce CUATRO
  // interacciones (los tres campos requeridos más un chip de contacto), y un
  // humano escribiendo genera una por tecla. Quitarlo no mueve a ningún lead,
  // ni pasado ni futuro, así que no desplaza el eje. El dato
  // `interaction_count` se sigue recibiendo y guardando: lo que sale son los
  // puntos, no la información.
  //
  // Tiempo de llenado desde el PRIMER foco de la persona, no desde que cargó la
  // página. El pie de página está en el DOM desde el primer instante, así que
  // `form_load_to_submit_ms` medía «cuánto lleva abierta la página». Mismo
  // criterio del 0 que arriba.
  const fillMs =
    payload.session.form_first_interaction_to_submit_ms ||
    payload.session.form_load_to_submit_ms ||
    0;
  if (fillMs < 10_000) {
    add('form_llenado_<10s', -5);
  }

  // El país NO da puntos a nadie (Robert, 2026-09-08). Salieron los dos
  // factores que lo usaban: `pais_CR` (+8) y `pais_alta_confianza` (+2).
  // Es el único cambio del plan que mueve el eje a propósito: los leads
  // costarricenses valen hasta diez puntos menos. Decisión de negocio, no
  // corrección de medición.
  //
  // El DATO del país sigue intacto: se deduce igual (`getCountry`), viaja en el
  // envío, el CRM lo guarda, se muestra con su bandera y decide a qué casilla
  // va el correo de aviso. Lo que se quitó son los puntos.

  // ----- Anti-spam -----
  // Los dos factores de acá no distinguen a nadie cuando el lead viene de estos
  // sitios: el envío se corta antes de armarse si el anti-spam falla, así que
  // `anti_spam_fallido` no se ve nunca y `anti_spam_pasa_todo` lo cobran todos.
  // Se conservan a propósito, y por dos razones distintas. El +5 constante no
  // se puede quitar sin bajarle cinco puntos a TODOS los leads en bloque, que
  // es justo lo que la decisión 5 del plan prohíbe. Y el -50 sí es alcanzable
  // desde el CRM, que expone un endpoint público y tiene que puntuar envíos que
  // no armó ningún sitio.
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
  /**
   * Tiempo ACTIVO (descuenta la pestaña en segundo plano). Es el que puntúa;
   * `time_on_site_ms` queda de respaldo. Opcional para no romper a quien arme
   * estas señales a mano.
   */
  time_on_site_active_ms?: number;
  pages_visited: number;
  /**
   * País deducido del navegador. Desde el 2026-09-08 NO puntúa (ver
   * `computeLeadScore`); se conserva en el snapshot porque es el mismo dato que
   * viaja en el envío y lo usa el CRM.
   */
  country: string | null;
  country_source: 'timezone' | 'locale' | 'both' | null;
}

/**
 * Puntúa SOLO las señales de sesión/atribución/landing — el subconjunto de
 * factores de `computeLeadScore` que existe aunque no haya formulario.
 * Función pura. Rango efectivo aprox: -18 (sesión muy pobre) … +46 (ideal).
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
  if (s.landing === 'web') add('landing_web', 5);
  if (s.landing === 'industries') add('landing_industries', 5);

  // ----- Attribution -----
  if (s.utm_medium === 'cpc') add('utm_cpc', 8);
  if (s.gclid) add('tiene_gclid', 5);

  // ----- Session -----
  // Mismo criterio que `computeLeadScore`: manda el tiempo activo, el de reloj
  // de pared queda de respaldo. Si no, el mismo factor mediría cosas distintas
  // según el evento (un clic de WhatsApp y un envío de formulario).
  const timeMs = s.time_on_site_active_ms || s.time_on_site_ms || 0;
  if (timeMs > 120_000) add('time_on_site_>2min', 10);
  if (timeMs < 30_000) add('time_on_site_<30s', -10);

  const pages = s.pages_visited ?? 0;
  if (pages >= 3) add('pages_visited_>=3', 8);
  if (pages >= 5) add('pages_visited_>=5', 5);
  if (pages === 1) add('pages_visited_==1', -8);

  // Sin factores de país, igual que `computeLeadScore`: el mismo concepto no
  // puede medirse de dos formas según el evento.

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
