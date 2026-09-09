/**
 * Lead form options — chips de selección única.
 * Centraliza los valores que se mandan al CRM para no tener strings sueltos.
 */

export type NeedOption =
  | 'software_a_medida'
  | 'sitio_web'
  | 'ecommerce'
  | 'otro';

export type PreferredContactOption =
  | 'correo'
  | 'whatsapp'
  | 'llamada';

/**
 * Origen del lead: el brazo del negocio al que pertenece la página desde la que
 * escribió. Nombra brazos, no páginas, y por eso una página nueva dentro de un
 * brazo que ya existe entra sola.
 *
 * `corporate` y `weblab` salieron el 2026-09-08. `weblab` era del sitio
 * anterior, apagado desde junio de 2026, y ningún sitio podía producirlo.
 * `corporate` nombraba al brazo web Y hacía de cajón por defecto a la vez, así
 * que la etiqueta no distinguía `/web` de una URL inexistente. El CRM los
 * sigue aceptando por el histórico; los sitios ya no los producen y no suman
 * puntos.
 */
export type SourceLanding =
  | 'software'
  | 'web'
  | 'industries'
  | 'contact'
  | 'other';

/**
 * Segmentos que el árbol de rutas usa como prefijo de idioma: el español va sin
 * prefijo (`/software`) y el inglés bajo `/en` (`/en/software`).
 *
 * El idioma es una decisión de presentación, no de intención comercial: la
 * misma página vale lo mismo en los dos. La clasificación lo descarta antes de
 * mirar nada. Hasta el 2026-09-08 no lo hacía, y las ocho rutas en inglés con
 * formulario caían todas en el cajón por defecto.
 */
export const LANGUAGE_PATH_PREFIXES: readonly string[] = ['en'];

/**
 * PRIMER segmento del path (ya sin el prefijo de idioma) → brazo del negocio.
 *
 * La clasificación mira solo ese primer segmento, así que una página nueva
 * dentro de una sección que ya está acá —`/software/lo-que-sea`,
 * `/industrias/lo-que-sea`— se clasifica sola, sin tocar esta tabla. Lo que no
 * aparezca acá es `other`.
 *
 * Abrir una SECCIÓN nueva de primer nivel sí obliga a agregarla, y hay una red
 * que lo recuerda: `services/lead-tracking.landing.spec.ts` recorre el árbol
 * real de rutas y se pone roja sola si aparece una página con formulario sin
 * expectativa declarada.
 */
export const LANDING_BY_PATH_SEGMENT: Readonly<Record<string, SourceLanding>> = {
  software: 'software',
  industrias: 'industries',
  web: 'web',
  contacto: 'contact'
};

export type FormLocation = 'footer' | 'contact_page';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type EmailDomainType = 'personal' | 'corporate';

export type Language = 'es' | 'en';

/**
 * Opciones de chips para "¿Qué necesitás?"
 */
export const NEED_OPTIONS: Array<{
  value: NeedOption;
  labelKey: string;
}> = [
  { value: 'software_a_medida', labelKey: 'LEAD_FORM.NEED_OPTIONS.SOFTWARE_A_MEDIDA' },
  { value: 'sitio_web',         labelKey: 'LEAD_FORM.NEED_OPTIONS.SITIO_WEB' },
  { value: 'ecommerce',         labelKey: 'LEAD_FORM.NEED_OPTIONS.ECOMMERCE' },
  { value: 'otro',              labelKey: 'LEAD_FORM.NEED_OPTIONS.OTRO' }
];

/**
 * Opciones de chips para "¿Cómo preferís que te contactemos?"
 */
export const CONTACT_OPTIONS: Array<{
  value: PreferredContactOption;
  labelKey: string;
  icon: string;
}> = [
  { value: 'correo',   labelKey: 'LEAD_FORM.CONTACT_OPTIONS.CORREO',   icon: 'bi-envelope' },
  { value: 'whatsapp', labelKey: 'LEAD_FORM.CONTACT_OPTIONS.WHATSAPP', icon: 'bi-whatsapp' },
  { value: 'llamada',  labelKey: 'LEAD_FORM.CONTACT_OPTIONS.LLAMADA',  icon: 'bi-telephone' }
];

/**
 * PROVEEDORES de correo personal (consumer), identificados por su **etiqueta
 * registrable**: la parte propia del dominio, sin el sufijo público.
 *
 * Comparar por etiqueta y no por el dominio completo hace que el país y el
 * sufijo dejen de importar: `hotmail.com`, `hotmail.es`, `hotmail.com.ar` y
 * `hotmail.com.mx` son el mismo proveedor y entran con una sola línea.
 * Todo lo que no esté acá se clasifica como "corporate" y cobra sus puntos,
 * venga del país que venga. Criterio de Robert, 2026-09-08.
 *
 * Hasta esa fecha esto era una lista de catorce dominios exactos: tenía
 * `hotmail.com` y `hotmail.es` pero no `hotmail.com.ar`, muy común en
 * Argentina. Cada variante que faltaba valía veinte puntos de más en el CRM
 * (+15 de "corporativo" en vez de −5 de "personal"), el desvío más grande que
 * puede producir un solo factor.
 *
 * La clasificación vive en `utils/email-domain.ts`.
 */
export const PERSONAL_EMAIL_PROVIDERS = [
  // Google
  'gmail',
  'googlemail',
  // Microsoft — todas sus marcas de correo de consumo
  'hotmail',
  'outlook',
  'live',
  'msn',
  'windowslive',
  // Yahoo
  'yahoo',
  'ymail',
  'rocketmail',
  // Apple
  'icloud',
  'me',
  'mac',
  // AOL
  'aol',
  'aim',
  // Proton (proton.me, protonmail.com, pm.me)
  'proton',
  'protonmail',
  'pm',
  // GMX / United Internet — incluye web.de, mail.com y mail.ru
  'gmx',
  'web',
  'mail',
  // Zoho — solo su buzón personal (zoho.com). Los dominios propios que una
  // empresa aloja en Zoho llegan con SU dominio, así que no pasan por acá.
  'zoho',
  'zohomail',
  // Yandex
  'yandex',
  // Tutanota / Tuta
  'tutanota',
  'tutamail',
  'tuta',
  // Fastmail
  'fastmail',
  // HEY
  'hey',
  // América Latina — portales e ISP de uso masivo
  'terra',
  'uol',
  'bol',
  'ig',
  'globo',
  'globomail',
  'prodigy',
  'latinmail',
  'speedy',
  'fibertel',
  'arnet',
  'ciudad',
  'racsa'
];

/**
 * Etiquetas de segundo nivel que forman parte del **sufijo público** cuando el
 * dominio termina en un ccTLD de dos letras: en `hotmail.com.ar` el sufijo es
 * `com.ar` y la etiqueta registrable es `hotmail`.
 *
 * Sin esto, `mail.empresa.com` se confundiría con `mail.com` y un correo de
 * empresa perdería veinte puntos. Es un recorte deliberado de la Public Suffix
 * List: no hace falta la lista entera, solo lo suficiente para que la etiqueta
 * registrable no se equivoque en los sufijos que este negocio ve
 * (`com.ar`, `com.mx`, `co.cr`, `go.cr`, `com.br`, `co.uk`, `com.co`,
 * `com.pe`, `com.es`…). Errar de más acá es inofensivo: solo produce un
 * "corporate" cuando ya iba a serlo.
 */
export const PUBLIC_SUFFIX_SECOND_LEVEL = [
  'com',
  'co',
  'net',
  'org',
  'edu',
  'gov',
  'gob',
  'go',
  'mil',
  'ac',
  'or',
  'ne',
  'ed',
  'sch',
  'nom',
  'info',
  'web',
  'gen',
  'ind',
  'art',
  'tur',
  'biz',
  'in',
  'id',
  'sa',
  'fi'
];

/**
 * Dominios de email "throwaway" / desechables — se rechazan.
 */
export const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  'sharklasers.com',
  '10minutemail.com',
  'trashmail.com',
  'yopmail.com',
  'fakeinbox.com',
  'maildrop.cc',
  'dispostable.com'
];

/**
 * Configuración de rate limiting client-side.
 * NOTA: esto es solo UX/anti-spam casual. El rate limit real vive en el CRM.
 */
export const RATE_LIMIT_CONFIG = {
  MIN_INTERVAL_MS: 60_000,        // 1 envío cada 60 segundos
  MAX_PER_HOUR: 3,                // máximo 3 envíos por hora
  HISTORY_WINDOW_MS: 60 * 60 * 1000, // ventana de historia: 1 hora
};

/**
 * Configuración anti-spam.
 */
export const ANTI_SPAM_CONFIG = {
  MIN_TIME_TO_SUBMIT_MS: 5000,    // 5 segundos mínimos entre carga y envío
  MIN_INTERACTIONS: 1,             // al menos 1 interacción (focus/input/keydown)
};

/**
 * TTL del UTM persistido en localStorage.
 */
export const UTM_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

/**
 * Storage keys con prefijo namespaced para evitar colisiones.
 */
export const STORAGE_KEYS = {
  UTM: 'ld_utm',
  FIRST_TOUCH_UTM: 'ld_first_touch_utm',
  SUBMIT_HISTORY: 'ld_submit_history',
  LAST_SUBMIT: 'ld_last_submit',
  FIRST_LOAD: 'ld_first_load_at',
  // Referrer first-touch (v1.5.0): document.referrer se pierde con un F5 —
  // este se captura en el primer load externo y persiste como el first-touch UTM.
  ENTRY_REFERRER: 'ld_entry_referrer',
};

/**
 * Schema version del payload — bumpear cuando haya breaking changes.
 * 1.5.0: + source.entry_referrer (referrer first-touch persistido).
 * 1.6.0: + source.page_context (el sistema o la industria de la página, que
 *        hasta ahora viajaba pegado al principio del mensaje) y vocabulario
 *        nuevo de source.landing: software · web · industries · contact · other.
 *        REGLA DE ORO: el CRM se despliega ANTES que los sitios — rechaza con
 *        400 las versiones de schema que no conoce y el lead se pierde.
 */
export const PAYLOAD_SCHEMA_VERSION = '1.6.0' as const;

/**
 * Configuración del evento de conversión de Google Ads que se dispara
 * cuando se envía el form de leads exitosamente.
 *
 * ── VALUE DINÁMICO BASADO EN LEAD SCORING ─────────────────────────────────
 * Antes el form disparaba un value fijo de 100 USD, lo cual distorsionaba
 * Smart Bidding (los forms "fríos" valían lo mismo que los calientes) y
 * sobrevaloraba el form respecto de "Agendar" (30).
 *
 * Ahora se usa la categoría del lead (calculada por `computeLeadScore` con
 * la MISMA fórmula que el CRM aplica en server). El value se mapea según
 * `LEAD_SCORE_ADS_VALUE` en `utils/lead-score.ts`:
 *
 *   hot        → 30  (score ≥ 80)  — igual a "Agendar"
 *   warm       → 24  (50-79)
 *   cold       → 18  (20-49)
 *   nurture    → 15  (0-19)        — piso, ≈ phone click
 *   suspicious → conversión NO se dispara (señales muy negativas)
 *
 * ── PRIORIDAD vs OTROS EVENTOS DEL SITIO ──────────────────────────────────
 *   - Submit form (hot)   → 30   ← top del sitio, junto con "Agendar"
 *   - Click "Agendar"     → 30
 *   - Copy de email       → 25
 *   - Submit form (warm)  → 24
 *   - Submit form (cold)  → 18
 *   - Submit form (nurt)  → 15
 *   - Click teléfono      → 15
 *   - Click WhatsApp      → 5
 *   - Scroll 50%          → 1
 *
 * ── ACCIÓN DEDICADA (hecho el 13 ago 2026) ────────────────────────────────
 * El envío del formulario tiene su propia conversion action en Ads
 * ("Contacto Formulario Argentina"), separada de los clicks de WhatsApp, correo
 * y agendar. Antes las cuatro compartían el send_to de "Contacto Argentina".
 * Cambio espejo del sitio LinkDesign — ver docs/bitacora-ads.md.
 */
export const GA_CONVERSION = {
  /** "Contacto Formulario Argentina" — mismo label que ADS_CONVERSIONS.CONTACTO_FORMULARIO. */
  SEND_TO: 'AW-16767245191/ZAj_CMqXquEcEIe3n7s-',
  CURRENCY: 'USD',
  EVENT_NAME: 'conversion' as const
};
