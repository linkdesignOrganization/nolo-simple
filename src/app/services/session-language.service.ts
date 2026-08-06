import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, effect, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { Lang, LanguageService } from './language.service';

/**
 * Clave de sessionStorage (prefijo del proyecto) con el estado acumulado de la sesión.
 * sessionStorage vive por pestaña: recargas de la misma pestaña = misma sesión.
 */
const STORAGE_KEY = 'nolo-session-language';

/**
 * Ventana de interacción: sin eventos reales por 30 s la sesión deja de contar como activa.
 * Mismo criterio de «activo» de la telemetría del CRM (pestaña visible + interacción reciente).
 */
const IDLE_MS = 30_000;

/** Cadencia del único interval liviano que cierra el tramo activo si venció la ventana. */
const IDLE_CHECK_MS = 5_000;

// Topes del validador del CRM (recordSessionSchema): capamos client-side para que una sesión
// absurda no pierda el beacon entero por un 400.
const MAX_ACTIVE_MS = 8 * 60 * 60 * 1000; // 8 horas
const MAX_PAGES = 500;

/** Charset/largo del sessionId que exige el CRM — valida lo re-leído de sessionStorage. */
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * Eventos que cuentan como interacción real (pointer/scroll/tecla/touch) — el espejo moderno
 * de los del viewer del CRM (mousemove/scroll/keydown/click/touchstart). Listeners passive:
 * jamás bloquean el scroll.
 */
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'scroll', 'keydown', 'touchstart'] as const;

/**
 * Estado que sobrevive recargas de la pestaña. Los acumuladores continúan donde quedaron:
 * el upsert del CRM usa $max por campo, así que el beacon de la sesión debe mandar siempre
 * el acumulado COMPLETO (si la recarga arrancara de cero, el server ignoraría lo nuevo).
 */
interface StoredSessionState {
  id: string;
  entryLang: Lang;
  enteredViaEnUrl: boolean;
  activeMsEs: number;
  activeMsEn: number;
  pagesEs: number;
  pagesEn: number;
  usedToggle: boolean;
  hadInteraction: boolean;
  // — Atribución de entrada (beacon v2; fijada SOLO en el primer load, como entryLang) —
  // El CRM clasifica el canal (IA/pago/orgánico/…) al leer — acá va todo CRUDO.
  entryReferrer: string | null;
  entryPath: string;
  entryUtmSource: string | null;
  entryUtmMedium: string | null;
  entryUtmCampaign: string | null;
  entryGclid: string | null;
}

// Topes espejo del zod del CRM (payload fuera de rango → 400; mejor recortar acá).
const MAX_REFERRER_LEN = 2048;
const MAX_PATH_LEN = 512;
const MAX_UTM_LEN = 200;
const MAX_GCLID_LEN = 500;

/**
 * Referrer EXTERNO del primer load: null si viene vacío o del propio sitio
 * (navegación interna / recarga). El referrer de un clic desde ChatGPT/Claude/
 * Perplexity llega acá — es la señal principal de «vino de una IA».
 */
function externalReferrer(): string | null {
  const raw = (document.referrer || '').trim();
  if (!raw) return null;
  try {
    if (new URL(raw).hostname.toLowerCase() === location.hostname.toLowerCase()) {
      return null;
    }
  } catch {
    // raro pero posible (referrer no-URL): se manda igual, el CRM lo tolera
  }
  return raw.slice(0, MAX_REFERRER_LEN);
}

/** Parámetro de la URL de entrada, recortado; null si no viene. */
function entryParam(params: URLSearchParams, key: string, maxLen: number): string | null {
  const value = (params.get(key) || '').trim();
  return value ? value.slice(0, maxLen) : null;
}

function createSessionId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // seguir al fallback
  }
  // Contextos sin randomUUID (http sin secure context): token aleatorio con el mismo charset.
  return 's-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

/**
 * Sanea un acumulador re-leído de sessionStorage: entero ≥0 (corrupto/negativo → 0).
 * Entero porque el zod del CRM exige `int` en los contadores de páginas.
 */
function sanitizeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

/**
 * SessionLanguageService — beacon de sesiones por idioma (plan de medición ES/EN).
 *
 * Mide, con datos CRUDOS y sin PII, cuánto de la sesión transcurre en cada idioma:
 * dos relojes de tiempo activo (bolsillos ES/EN) particionados por `LanguageService.lang()`,
 * páginas por idioma, puerta de entrada (URL /en directa vs toggle) e idioma del navegador.
 * La calificación («usó inglés», «mayormente EN») la computa el CRM al consultar — acá no.
 *
 * «Activo» = pestaña visible Y interacción real en los últimos 30 s (mismo criterio del
 * sistema de telemetría de leads). Implementado con TRAMOS por timestamps, no con timers
 * densos: se abre un tramo cuando hay visibilidad + actividad y se cierra (sumando al
 * bolsillo del idioma del tramo) al cambiar visibilidad/idioma, vencer la ventana de 30 s
 * o irse la página. Un único interval liviano detecta la inactividad.
 *
 * Envío: POST /api/public/sessions en `pagehide` y `visibilitychange→hidden` con el
 * acumulado total (el server upsertea por sessionId con $max — los re-envíos colapsan).
 * SOLO se envía si hubo ≥1 interacción real en la sesión: los renders de bots/crawlers
 * ni aparecen. Mismo patrón del contador de clicks del portafolio: fetch keepalive +
 * credentials 'omit' (el CORS del CRM responde wildcard), silencioso ante cualquier error.
 *
 * SSR-safe total: en server/prerender el constructor retorna antes de tocar el browser.
 */
@Injectable({ providedIn: 'root' })
export class SessionLanguageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly i18n = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // — Identidad y puerta de entrada (fijadas en el PRIMER load de la sesión; sobreviven recargas) —
  private sessionId = '';
  private entryLang: Lang = 'es';
  private enteredViaEnUrl = false;
  // — Atribución de entrada (beacon v2; crudos, fijados SOLO en el primer load) —
  private entryReferrer: string | null = null;
  private entryPath = '/';
  private entryUtmSource: string | null = null;
  private entryUtmMedium: string | null = null;
  private entryUtmCampaign: string | null = null;
  private entryGclid: string | null = null;

  // — Acumuladores crudos (los «bolsillos» por idioma) —
  private activeMsEs = 0;
  private activeMsEn = 0;
  private pagesEs = 0;
  private pagesEn = 0;
  /** true si `lang()` cambió en algún momento de la sesión (pegajoso, igual que en el CRM). */
  private usedToggle = false;
  /** Anti-bot: sin al menos una interacción real, jamás se envía el beacon. */
  private hadInteraction = false;

  // — Tramo activo abierto (timestamps de tramos, no intervals densos) —
  private segmentStartedAt: number | null = null;
  /** Idioma del tramo abierto: a ese bolsillo suma al cerrarse (no al idioma del cierre). */
  private segmentLang: Lang = 'es';

  // — Ventana de interacción —
  /** -Infinity hasta la primera interacción real: el reloj NO corre antes (bots no acumulan). */
  private lastActivityAt = Number.NEGATIVE_INFINITY;
  private visible = true;
  /** Último idioma procesado por el effect — detecta el cambio y reparte el tramo. */
  private trackedLang: Lang = 'es';

  constructor() {
    // SSR/prerender (SSG): el servicio queda totalmente inerte — nada corre fuera del browser.
    if (!this.isBrowser) {
      return;
    }

    this.restoreOrInitState();
    this.trackedLang = this.i18n.lang();
    this.visible = document.visibilityState !== 'hidden';

    // usedToggle + partición del reloj: al cambiar `lang()` (toggle del nav, langGuard al
    // navegar entre árboles /en) se cierra el tramo del idioma anterior y se abre el del nuevo.
    effect(() => {
      const lang = this.i18n.lang();
      if (lang === this.trackedLang) {
        return;
      }
      this.closeSegment(Date.now());
      this.trackedLang = lang;
      this.usedToggle = true;
      this.maybeOpenSegment();
    });

    // Páginas por idioma (idioma de la URL DESTINO). Si la navegación inicial ya terminó
    // cuando nos construyen (initial navigation bloqueante), contarla acá; si no, llega como
    // primer NavigationEnd de la suscripción. La carga inicial cuenta como página 1 del entryLang.
    if (this.router.navigated) {
      this.countPage(this.router.url);
    }
    const navSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.countPage(event.urlAfterRedirects || event.url);
      }
    });

    // Interacción real → refresca la ventana de 30 s y (re)abre el tramo si aplica.
    const onActivity = (): void => this.onActivity();
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, onActivity, { passive: true });
    }

    // Visibilidad: oculto → cerrar tramo y ENVIAR (puede dispararse varias veces; el upsert
    // del CRM lo tolera). Visible de nuevo → reabrir solo si la ventana de interacción sigue viva.
    const onVisibility = (): void => {
      if (document.visibilityState === 'hidden') {
        this.visible = false;
        this.closeSegment(Date.now());
        this.send();
      } else {
        this.visible = true;
        this.maybeOpenSegment();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Cierre real de la pestaña / navegación fuera del sitio (pagehide es fiable en iOS Safari).
    const onPageHide = (): void => {
      this.closeSegment(Date.now());
      this.send();
    };
    window.addEventListener('pagehide', onPageHide);

    // Único interval liviano: si la ventana venció, cierra el tramo (capado a la última
    // interacción + 30 s — ver closeSegment). La próxima interacción lo reabre.
    const idleTimer = window.setInterval(() => {
      if (this.segmentStartedAt !== null && Date.now() - this.lastActivityAt >= IDLE_MS) {
        this.closeSegment(Date.now());
      }
    }, IDLE_CHECK_MS);

    // El root injector no se destruye en producción; esto limpia en tests (Vitest/TestBed).
    this.destroyRef.onDestroy(() => {
      navSub.unsubscribe();
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, onActivity);
      }
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.clearInterval(idleTimer);
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Estado de sesión (sessionStorage)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Retoma la sesión de la pestaña si existe (recarga → mismo sessionId y acumuladores
   * donde quedaron) o inicia una nueva: id aleatorio anónimo + puerta de entrada leída
   * del pathname inicial (/en o /en/... → 'en').
   */
  private restoreOrInitState(): void {
    let stored: Partial<StoredSessionState> | null = null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      stored = raw ? (JSON.parse(raw) as Partial<StoredSessionState>) : null;
    } catch {
      stored = null; // sessionStorage bloqueado o JSON corrupto → sesión nueva
    }

    if (stored && typeof stored.id === 'string' && SESSION_ID_PATTERN.test(stored.id)) {
      this.sessionId = stored.id;
      this.entryLang = stored.entryLang === 'en' ? 'en' : 'es';
      this.enteredViaEnUrl = stored.enteredViaEnUrl === true;
      this.activeMsEs = sanitizeCount(stored.activeMsEs);
      this.activeMsEn = sanitizeCount(stored.activeMsEn);
      this.pagesEs = sanitizeCount(stored.pagesEs);
      this.pagesEn = sanitizeCount(stored.pagesEn);
      this.usedToggle = stored.usedToggle === true;
      this.hadInteraction = stored.hadInteraction === true;
      // Retrocompat: blobs de sesiones que arrancaron antes de este deploy no traen los
      // campos de atribución — quedan en sus defaults (entryPath '/' los marca v2 igual:
      // la sesión ES de la era medida, solo que su primer load fue pre-deploy).
      this.entryReferrer = typeof stored.entryReferrer === 'string' ? stored.entryReferrer : null;
      this.entryPath = typeof stored.entryPath === 'string' && stored.entryPath.startsWith('/')
        ? stored.entryPath
        : '/';
      this.entryUtmSource = typeof stored.entryUtmSource === 'string' ? stored.entryUtmSource : null;
      this.entryUtmMedium = typeof stored.entryUtmMedium === 'string' ? stored.entryUtmMedium : null;
      this.entryUtmCampaign =
        typeof stored.entryUtmCampaign === 'string' ? stored.entryUtmCampaign : null;
      this.entryGclid = typeof stored.entryGclid === 'string' ? stored.entryGclid : null;
      return;
    }

    this.sessionId = createSessionId();
    this.entryLang = /^\/en(?=\/|$)/.test(location.pathname) ? 'en' : 'es';
    this.enteredViaEnUrl = this.entryLang === 'en';
    // Atribución de entrada: SOLO acá (primer load de la sesión) — un clic desde una IA,
    // un buscador o un anuncio trae acá su referrer/UTM; las navegaciones internas no pisan.
    this.entryReferrer = externalReferrer();
    this.entryPath = (location.pathname || '/').slice(0, MAX_PATH_LEN);
    const params = new URLSearchParams(location.search);
    this.entryUtmSource = entryParam(params, 'utm_source', MAX_UTM_LEN);
    this.entryUtmMedium = entryParam(params, 'utm_medium', MAX_UTM_LEN);
    this.entryUtmCampaign = entryParam(params, 'utm_campaign', MAX_UTM_LEN);
    this.entryGclid = entryParam(params, 'gclid', MAX_GCLID_LEN);
    this.persistState();
  }

  /** Persiste el acumulado (se llama al enviar: pagehide/hidden — cubre la recarga). */
  private persistState(): void {
    try {
      const state: StoredSessionState = {
        id: this.sessionId,
        entryLang: this.entryLang,
        enteredViaEnUrl: this.enteredViaEnUrl,
        activeMsEs: this.activeMsEs,
        activeMsEn: this.activeMsEn,
        pagesEs: this.pagesEs,
        pagesEn: this.pagesEn,
        usedToggle: this.usedToggle,
        hadInteraction: this.hadInteraction,
        entryReferrer: this.entryReferrer,
        entryPath: this.entryPath,
        entryUtmSource: this.entryUtmSource,
        entryUtmMedium: this.entryUtmMedium,
        entryUtmCampaign: this.entryUtmCampaign,
        entryGclid: this.entryGclid
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage puede fallar (modo privado): la sesión sigue viva en memoria.
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Relojes por idioma (tramos por timestamps)
  // ──────────────────────────────────────────────────────────────────────────

  /** Interacción real: refresca la ventana, marca la sesión como humana y (re)abre el tramo. */
  private onActivity(): void {
    const now = Date.now();
    this.hadInteraction = true;
    // Si el interval todavía no cerró un tramo ya vencido, cerrarlo acá (capado): el hueco
    // muerto entre la ventana vencida y esta interacción no debe contar.
    if (this.segmentStartedAt !== null && now - this.lastActivityAt >= IDLE_MS) {
      this.closeSegment(now);
    }
    this.lastActivityAt = now;
    this.maybeOpenSegment();
  }

  /** Abre un tramo si no hay uno y se cumple el criterio: visible + interacción en <30 s. */
  private maybeOpenSegment(): void {
    if (this.segmentStartedAt !== null || !this.visible) {
      return;
    }
    if (Date.now() - this.lastActivityAt >= IDLE_MS) {
      return; // ventana vencida (o sin interacción todavía): el reloj no corre
    }
    this.segmentStartedAt = Date.now();
    this.segmentLang = this.trackedLang;
  }

  /**
   * Cierra el tramo abierto sumándolo al bolsillo de SU idioma. El fin se capa a
   * `última interacción + 30 s`: un cierre tardío (interval de chequeo, pestaña que vuelve)
   * no cuenta el tiempo muerto posterior a la ventana.
   */
  private closeSegment(endAt: number): void {
    if (this.segmentStartedAt === null) {
      return;
    }
    const cappedEnd = Math.min(endAt, this.lastActivityAt + IDLE_MS);
    const elapsed = Math.max(0, cappedEnd - this.segmentStartedAt);
    if (this.segmentLang === 'en') {
      this.activeMsEn += elapsed;
    } else {
      this.activeMsEs += elapsed;
    }
    this.segmentStartedAt = null;
  }

  /** Clasifica una navegación por el idioma de la URL destino (/en o /en/... → EN). */
  private countPage(url: string): void {
    const path = url.split('#')[0].split('?')[0] || '/';
    if (/^\/en(?=\/|$)/.test(path)) {
      this.pagesEn += 1;
    } else {
      this.pagesEs += 1;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Envío
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Envía el ACUMULADO total de la sesión al CRM (payload del recordSessionSchema de L1).
   * Puede llamarse varias veces (hidden repetidos + pagehide): el upsert por sessionId con
   * $max server-side colapsa los re-envíos. Silencioso ante cualquier error: el beacon
   * jamás interfiere con la navegación ni el cierre.
   */
  private send(): void {
    if (!this.hadInteraction) {
      return; // anti-bot/render: sin interacción real la sesión ni aparece
    }

    this.persistState();

    const payload = {
      sessionId: this.sessionId,
      entryLang: this.entryLang,
      exitLang: this.i18n.lang(),
      activeMsEs: Math.min(Math.round(this.activeMsEs), MAX_ACTIVE_MS),
      activeMsEn: Math.min(Math.round(this.activeMsEn), MAX_ACTIVE_MS),
      pagesEs: Math.min(this.pagesEs, MAX_PAGES),
      pagesEn: Math.min(this.pagesEn, MAX_PAGES),
      enteredViaEnUrl: this.enteredViaEnUrl,
      usedToggle: this.usedToggle,
      browserLang: (navigator.language || '').slice(0, 16),
      // Atribución de entrada (crudos; el CRM clasifica el canal al leer).
      // `entryPath` va SIEMPRE (mínimo '/'): es el marcador de beacon v2 — sin él, el CRM
      // trata el doc como anterior a la medición («untracked») y no como tráfico directo.
      entryReferrer: this.entryReferrer,
      entryPath: this.entryPath,
      entryUtmSource: this.entryUtmSource,
      entryUtmMedium: this.entryUtmMedium,
      entryUtmCampaign: this.entryUtmCampaign,
      entryGclid: this.entryGclid
    };

    if (!environment.crmEndpoint) {
      // Dev sin CRM: no se envía nada, pero el payload queda visible para poder probar.
      if (!environment.production) {
        console.debug('[SessionLanguage] beacon (dev, sin crmEndpoint — no se envía):', payload);
      }
      return;
    }
    if (typeof fetch !== 'function') {
      return;
    }

    try {
      // Mismo patrón del contador de clicks del portafolio: origin del CRM derivado del
      // endpoint de leads; keepalive despacha en segundo plano sin bloquear el cierre.
      // ⚠️ No usar navigator.sendBeacon: siempre manda credenciales y el CORS wildcard
      // del CRM las rechaza; con credentials 'omit' el wildcard es válido.
      const crmOrigin = new URL(environment.crmEndpoint).origin;
      fetch(`${crmOrigin}/api/public/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
        credentials: 'omit',
        mode: 'cors'
      }).catch(() => {});
    } catch {
      // Nunca romper nada por el beacon.
    }
  }
}
