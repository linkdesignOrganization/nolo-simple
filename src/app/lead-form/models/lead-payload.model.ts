/**
 * Schema del payload que el CRM recibirá cuando esté implementado el endpoint.
 *
 * IMPORTANTE PARA EL EQUIPO DE CRM:
 * Esta interfaz es la fuente de verdad del contrato CRM↔Sitio.
 * Cuando se cambie algo, bumpear `schema_version` y mantener compatibilidad.
 *
 * @see PAYLOAD_SCHEMA_VERSION en lead-form-options.ts
 */

import {
  NeedOption,
  PreferredContactOption,
  SourceLanding,
  FormLocation,
  DeviceType,
  EmailDomainType,
  Language
} from './lead-form-options';

/**
 * Bloque de identificación del lead.
 */
export interface LeadIdentification {
  /** UUID v4 generado client-side para deduplicación. */
  lead_id: string;
  /** Timestamp ISO 8601 del momento del submit. */
  submitted_at: string;
  /** Versión del schema — el CRM debe validar contra esto. */
  schema_version: string;
}

/**
 * Datos de contacto del lead.
 */
export interface LeadContact {
  /** Nombre. Sanitizado, sin HTML. Min 2 / max 80 chars. */
  name: string;
  /** Empresa (opcional). Sanitizado. Max 120 chars. Null si no se completó. */
  company: string | null;
  /** Email. Validado y sanitizado. */
  email: string;
  /** Clasificación del dominio del email: corporativo o personal. */
  email_domain_type: EmailDomainType;
  /** Teléfono normalizado a E.164 (ej: '+50688881111'). */
  phone: string;
  /** Prefijo de país del teléfono (ej: '+506', '+1', '+52'). */
  phone_country_prefix: string;
}

/**
 * Intención del lead — qué quiere y cómo prefiere ser contactado.
 */
export interface LeadIntent {
  /**
   * Qué servicio(s) necesita.
   * Multi-select OPCIONAL: el lead puede seleccionar 0, 1 o varias opciones.
   * Si está vacío significa que el lead no marcó ninguna preferencia explícita
   * (probablemente "no lo tengo claro" / "quiero asesoramiento").
   */
  need: NeedOption[];
  /**
   * Canal(es) preferido(s) de contacto.
   * Multi-select REQUERIDO: mínimo 1, máximo 3 (correo, whatsapp, llamada).
   * Si trae varios, el lead acepta ser contactado por cualquiera de ellos.
   */
  preferred_contact: PreferredContactOption[];
  /** Mensaje libre opcional. Max 1000 chars. */
  message: string | null;
}

/**
 * Origen del lead — desde dónde llenó el form.
 */
export interface LeadSource {
  /**
   * Landing en la que estaba el usuario al enviar el form.
   *
   * Mapping para el equipo del CRM:
   *   - 'corporate' → Sitio Corporativo (línea de servicios corporativos)
   *   - 'weblab'    → WebLab / Creativo (proyectos creativos / experimentales)
   *   - 'software'  → Software a Medida (desarrollo a medida)
   *   - 'contact'   → Página de Contacto (entró directo a contacto)
   *
   * Este dato es crítico: indica desde qué oferta convirtió el lead,
   * lo que sugiere qué tipo de proyecto le interesó más.
   */
  landing: SourceLanding;
  /** Sección de la página donde está el form (footer | contact_page). */
  form_location: FormLocation;
  /** URL completa de la página al momento del submit. */
  page_url: string;
  /** Referrer (de dónde llegó al sitio). Null si es directo. */
  referrer: string | null;
  /** Idioma activo al momento del submit. */
  language: Language;
}

/**
 * Atribución de marketing — UTM, gclid, GA client_id.
 */
export interface LeadAttribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  /** Google Ads click ID. */
  gclid: string | null;
  /** Google Analytics client ID parseado de cookie _ga. */
  ga_client_id: string | null;
  /** Primer UTM capturado en la sesión (puede diferir del último). */
  first_touch_utm: Partial<LeadAttribution> | null;
}

/**
 * Tiempo que una sección estuvo "en foco" (cruzando la banda central del viewport).
 */
export interface SectionTime {
  /** Slug estable de la sección (p.ej. 'sistemas', 'casos', 'portfolio'). */
  id: string;
  /** Milisegundos que estuvo en foco (descuenta pestaña en segundo plano). */
  visible_ms: number;
}

/**
 * Veces que el lead tocó un botón/CTA nombrado durante la sesión.
 */
export interface ClickCount {
  /** Etiqueta legible del botón (p.ej. 'WhatsApp', 'Agendar reunión'). */
  label: string;
  count: number;
}

/**
 * Un hito de la sesión en orden cronológico (para la línea de tiempo).
 */
export interface TimelineEvent {
  /** Milisegundos desde la primera carga de la sesión. */
  at_ms: number;
  kind: 'page' | 'section' | 'click' | 'form';
  /** Path, slug de sección, etiqueta de botón o texto del hito. */
  label: string;
}

/**
 * Datos de sesión y telemetría.
 */
export interface LeadSession {
  user_agent: string;
  /**
   * Tipo de dispositivo detectado del user-agent.
   *   - 'mobile'  → teléfono
   *   - 'tablet'  → tablet
   *   - 'desktop' → computadora de escritorio o laptop
   */
  device_type: DeviceType;
  /** Milisegundos desde la primera carga del sitio en esta sesión. */
  time_on_site_ms: number;
  /** Número de páginas visitadas en esta sesión. */
  pages_visited: number;
  /**
   * Recorrido de rutas visitadas en orden cronológico durante la sesión.
   * Ej: ['/corporate', '/weblab', '/software', '/contact']
   *
   * Esto le da al CRM información sobre qué tanto exploró el sitio antes
   * de decidir contactarnos. Limitado a las últimas 30 páginas.
   */
  pages_visited_paths: string[];
  /** Eventos de interacción registrados en el form. */
  interaction_count: number;
  /** Tiempo entre carga del form y submit. */
  form_load_to_submit_ms: number;
  /**
   * v1.1.0 — Tiempo ACTIVO en el sitio (ms): descuenta el rato con la pestaña en segundo
   * plano (Page Visibility API). Más fiable que time_on_site_ms para saber cuánto estuvo
   * realmente prestando atención.
   */
  time_on_site_active_ms: number;
  /**
   * v1.1.0 — Tiempo de llenado del form desde el PRIMER foco/cambio del usuario hasta el
   * submit (no desde que el form se renderizó). Vive dentro del tiempo activo.
   */
  form_first_interaction_to_submit_ms: number;
  /** Resolución de pantalla "1920x1080". */
  screen_resolution: string | null;
  /** Timezone IANA del navegador (ej: "America/Costa_Rica"). */
  timezone: string | null;
  /**
   * Locale completo del navegador (navigator.language).
   * Ej: "es-CR", "en-US", "pt-BR".
   */
  locale: string | null;
  /**
   * Código ISO 3166-1 alpha-2 del país inferido del browser.
   * Se obtiene combinando timezone y locale (sin servicios externos).
   * Ej: "CR", "MX", "US", "ES". Null si no se pudo determinar.
   */
  country: string | null;
  /**
   * De dónde se infirió el país:
   *   - 'timezone' → solo del timezone
   *   - 'locale'   → solo del locale del browser
   *   - 'both'     → timezone y locale coinciden (alta confianza)
   *   - null       → no se pudo inferir
   */
  country_source: 'timezone' | 'locale' | 'both' | null;
  /**
   * v1.2.0 — Tiempo en foco por sección del sitio (las que el lead realmente miró).
   * Acotado; el CRM ordena por tiempo para el informe "Secciones que más miró".
   */
  sections: SectionTime[];
  /**
   * v1.3.0 — Botones/CTAs que el lead tocó durante la sesión, con su conteo.
   */
  clicks: ClickCount[];
  /**
   * v1.4.0 — Línea de tiempo de la sesión: hitos en orden (páginas, secciones, clics,
   * inicio del formulario) con su offset en ms. Acotado.
   */
  timeline: TimelineEvent[];
}

/**
 * Telemetría anti-spam — útil para el CRM para evaluar la calidad del lead.
 */
export interface LeadAntiSpam {
  passed_honeypot: boolean;
  passed_time_check: boolean;
  passed_interaction_check: boolean;
  /** Cuántos envíos le quedan al usuario en la ventana de rate limit. */
  rate_limit_remaining: number;
}

/**
 * Payload completo del lead — esto es lo que se manda al CRM.
 */
export interface LeadPayload {
  lead_id: string;
  submitted_at: string;
  schema_version: string;
  contact: LeadContact;
  intent: LeadIntent;
  source: LeadSource;
  attribution: LeadAttribution;
  session: LeadSession;
  anti_spam: LeadAntiSpam;
}

/**
 * Resultado del intento de submit (devuelto por LeadFormService.submit).
 */
export type LeadSubmitResult =
  | { status: 'success'; lead_id: string }
  | { status: 'rate_limited'; message: string }
  | { status: 'spam_detected' } // silencioso — no informar al usuario
  | { status: 'error'; message: string };

/**
 * Valores raw del FormGroup (lo que escribe el usuario antes de armar payload).
 */
export interface LeadFormRawValue {
  name: string;
  company: string;
  email: string;
  phone: string;
  need: NeedOption[];
  preferred_contact: PreferredContactOption[];
  message: string;
  // Honeypots
  website: string;
  url: string;
}

/**
 * Snapshot del contexto de tracking en el momento del submit.
 * Devuelto por LeadTrackingService.getTrackingContext().
 */
export interface TrackingContext {
  source: LeadSource;
  attribution: LeadAttribution;
  session: Omit<
    LeadSession,
    'form_load_to_submit_ms' | 'interaction_count' | 'form_first_interaction_to_submit_ms'
  >;
}
