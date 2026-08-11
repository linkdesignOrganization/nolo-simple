/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VECTORES DEL LEAD SCORING — ARCHIVO COMPARTIDO ENTRE LOS TRES REPOS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este archivo existe IDÉNTICO (byte a byte) en:
 *   · crm/server/src/modules/web-leads/lead-score-vectors.shared.ts
 *   · LinkDesign-simple/src/app/lead-form/utils/lead-score-vectors.shared.ts
 *   · nolo-simple/src/app/lead-form/utils/lead-score-vectors.shared.ts
 *
 * La fórmula de scoring vive copiada a mano en los tres repos. Cada repo tiene
 * un spec que corre ESTOS vectores contra SU copia: si alguien cambia la
 * fórmula en un solo lado, su test se pone rojo; al actualizar los vectores,
 * los otros dos repos quedan rojos hasta sincronizarse. La deriva entre copias
 * deja de ser silenciosa.
 *
 * ⚠️ REGLA DE ORO (Robert, 2026-08-11) — LA PRIORIDAD #1 ES GOOGLE ADS.
 * El score de los SITIOS alimenta el value de conversión que Google Ads usa
 * para optimizar (Smart Bidding): de ahí vienen los clientes. El del CRM es
 * uso interno. Por lo tanto:
 *   · La copia de los SITIOS es la fuente de verdad, no la del CRM.
 *   · Si un vector falla en un sitio, NO se «corrige» el sitio: se investiga,
 *     y si hay divergencia real se alinea el CRM (o no se toca nada).
 *   · Cambiar la fórmula o estos vectores exige tocar LOS TRES repos en el
 *     mismo cambio — o ninguno. Si eso altera el value de Ads, no se hace.
 *
 * Al editar: copiar el archivo completo a las otras dos rutas y verificar
 * identidad con `shasum -a 256` sobre los tres.
 */

/** Subconjunto del payload que la fórmula LEE. Estructural a propósito:
 *  cada repo lo castea a su propio tipo de payload. */
export interface ScoreVectorPayload {
  contact: { email_domain_type: string; company: string | null };
  intent: {
    need: string[];
    preferred_contact: string[];
    message: string | null;
  };
  source: { landing: string };
  attribution: { utm_medium: string | null; gclid: string | null };
  session: {
    time_on_site_ms: number;
    pages_visited: number;
    interaction_count: number;
    form_load_to_submit_ms: number;
    country: string | null;
    country_source: 'timezone' | 'locale' | 'both' | null;
  };
  anti_spam: {
    passed_honeypot: boolean;
    passed_time_check: boolean;
    passed_interaction_check: boolean;
  };
}

export interface ScoreVector {
  name: string;
  /** Override parcial sobre BASE_PAYLOAD (merge profundo por sección). */
  over: Partial<{
    contact: Partial<ScoreVectorPayload['contact']>;
    intent: Partial<ScoreVectorPayload['intent']>;
    source: Partial<ScoreVectorPayload['source']>;
    attribution: Partial<ScoreVectorPayload['attribution']>;
    session: Partial<ScoreVectorPayload['session']>;
    anti_spam: Partial<ScoreVectorPayload['anti_spam']>;
  }>;
  expected: {
    score: number;
    category: 'hot' | 'warm' | 'cold' | 'nurture' | 'suspicious';
  };
}

/**
 * Payload NEUTRO: cada valor está elegido para caer entre umbrales y no sumar
 * ni restar — salvo los dos inevitables, que se cancelan: email personal (-5)
 * y anti-spam todo OK (+5). Score = 0, categoría `nurture`. Es el ancla: si
 * este vector falla, cambió la fórmula base.
 */
export const BASE_PAYLOAD: ScoreVectorPayload = {
  contact: { email_domain_type: 'personal', company: null },
  intent: { need: [], preferred_contact: ['correo'], message: null },
  source: { landing: 'weblab' },
  attribution: { utm_medium: null, gclid: null },
  session: {
    time_on_site_ms: 60_000, // entre <30s y >2min: neutro
    pages_visited: 2, // ni ==1 ni >=3: neutro
    interaction_count: 5, // >=3: no penaliza
    form_load_to_submit_ms: 30_000, // >=10s: no penaliza
    country: null,
    country_source: null,
  },
  anti_spam: {
    passed_honeypot: true,
    passed_time_check: true,
    passed_interaction_check: true,
  },
};

/** Merge de un vector sobre la base. Sin dependencias, idéntico en los tres. */
export function buildVectorPayload(v: ScoreVector): ScoreVectorPayload {
  const b = BASE_PAYLOAD;
  return {
    contact: { ...b.contact, ...v.over.contact },
    intent: { ...b.intent, ...v.over.intent },
    source: { ...b.source, ...v.over.source },
    attribution: { ...b.attribution, ...v.over.attribution },
    session: { ...b.session, ...v.over.session },
    anti_spam: { ...b.anti_spam, ...v.over.anti_spam },
  };
}

export const SCORE_VECTORS: ScoreVector[] = [
  {
    name: 'neutro — el ancla (email personal -5 + anti-spam +5 = 0)',
    over: {},
    expected: { score: 0, category: 'nurture' },
  },
  {
    name: 'corporativo con empresa (+15 sustituye al -5, +10 empresa)',
    over: { contact: { email_domain_type: 'corporate', company: 'Acme SA' } },
    expected: { score: 30, category: 'cold' },
  },
  {
    name: 'pide software a medida (+20)',
    over: { intent: { need: ['software_a_medida'] } },
    expected: { score: 20, category: 'cold' },
  },
  {
    name: 'ecommerce + sitio web = multi servicio (12+8+5)',
    over: { intent: { need: ['ecommerce', 'sitio_web'] } },
    expected: { score: 25, category: 'cold' },
  },
  {
    name: 'prefiere llamada y whatsapp (12+8)',
    over: { intent: { preferred_contact: ['llamada', 'whatsapp'] } },
    expected: { score: 20, category: 'cold' },
  },
  {
    name: 'mensaje largo (>100) que menciona presupuesto (12+10)',
    over: {
      intent: {
        message:
          'Tenemos presupuesto aprobado y necesitamos arrancar cuanto antes con un sistema para controlar inventario y ventas.',
      },
    },
    expected: { score: 22, category: 'cold' },
  },
  {
    name: 'mensaje corto con keyword de tiempo («mes») (+10)',
    over: { intent: { message: 'Lo ocupo para el otro mes' } },
    expected: { score: 10, category: 'nurture' },
  },
  {
    name: 'aterrizó en la landing de software (+10)',
    over: { source: { landing: 'software' } },
    expected: { score: 10, category: 'nurture' },
  },
  {
    name: 'aterrizó en la landing corporate (+5)',
    over: { source: { landing: 'corporate' } },
    expected: { score: 5, category: 'nurture' },
  },
  {
    name: 'vino de Ads: cpc + gclid (8+5)',
    over: { attribution: { utm_medium: 'cpc', gclid: 'abc' } },
    expected: { score: 13, category: 'nurture' },
  },
  {
    name: 'sesión larga >2min (+10)',
    over: { session: { time_on_site_ms: 120_001 } },
    expected: { score: 10, category: 'nurture' },
  },
  {
    name: 'rebote <30s (-10) → único factor negativo → suspicious',
    over: { session: { time_on_site_ms: 29_999 } },
    expected: { score: -10, category: 'suspicious' },
  },
  {
    name: 'los umbrales exactos NO disparan (30s y 2min justos)',
    over: { session: { time_on_site_ms: 30_000 } },
    expected: { score: 0, category: 'nurture' },
  },
  {
    name: '5 páginas acumula los dos bonus (8+5)',
    over: { session: { pages_visited: 5 } },
    expected: { score: 13, category: 'nurture' },
  },
  {
    name: 'una sola página (-8) → suspicious',
    over: { session: { pages_visited: 1 } },
    expected: { score: -8, category: 'suspicious' },
  },
  {
    name: 'pocas interacciones y form llenado en 5s (-5-5)',
    over: { session: { interaction_count: 2, form_load_to_submit_ms: 5_000 } },
    expected: { score: -10, category: 'suspicious' },
  },
  {
    name: 'Costa Rica con confianza alta (8+2)',
    over: { session: { country: 'CR', country_source: 'both' } },
    expected: { score: 10, category: 'nurture' },
  },
  {
    name: 'Argentina NO recibe el bonus de país',
    over: { session: { country: 'AR', country_source: 'both' } },
    expected: { score: 2, category: 'nurture' },
  },
  {
    name: 'honeypot fallido: -50 y pierde el +5 → suspicious',
    over: { anti_spam: { passed_honeypot: false } },
    expected: { score: -55, category: 'suspicious' },
  },
  {
    name: 'borde exacto warm = 50 (corp+empresa+sitio_web+llamada)',
    over: {
      contact: { email_domain_type: 'corporate', company: 'Acme SA' },
      intent: { need: ['sitio_web'], preferred_contact: ['llamada'] },
    },
    expected: { score: 50, category: 'warm' },
  },
  {
    name: 'borde exacto hot = 80 (corp+empresa+software+llamada+landing+cpc)',
    over: {
      contact: { email_domain_type: 'corporate', company: 'Acme SA' },
      intent: { need: ['software_a_medida'], preferred_contact: ['llamada'] },
      source: { landing: 'software' },
      attribution: { utm_medium: 'cpc' },
    },
    expected: { score: 80, category: 'hot' },
  },
  {
    name: 'el lead ideal completo (todo lo positivo junto)',
    over: {
      contact: { email_domain_type: 'corporate', company: 'Acme SA' },
      intent: {
        need: ['software_a_medida', 'ecommerce', 'sitio_web'],
        preferred_contact: ['llamada', 'whatsapp'],
        message:
          'Necesitamos un ERP a medida para la planta, hay presupuesto aprobado y queremos arrancar antes de octubre con la primera fase del proyecto.',
      },
      source: { landing: 'software' },
      attribution: { utm_medium: 'cpc', gclid: 'x' },
      session: {
        time_on_site_ms: 300_000,
        pages_visited: 6,
        country: 'CR',
        country_source: 'both',
      },
    },
    expected: { score: 173, category: 'hot' },
  },
];
