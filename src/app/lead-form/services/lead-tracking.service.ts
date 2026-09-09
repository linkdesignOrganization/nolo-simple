import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { LanguageService } from '../../services/language.service';

import {
  cookieGet,
  lsGetJsonWithTtl,
  lsSetJsonWithTtl,
  ssGet,
  ssSet
} from '../utils/storage-safe';
import { getCountryFromTimezone } from '../utils/country-from-timezone';
import { SectionTrackingService } from './section-tracking.service';
import { ClickTrackingService } from './click-tracking.service';
import { TimelineService } from './timeline.service';
import {
  STORAGE_KEYS,
  UTM_TTL_MS,
  DeviceType,
  EmailDomainType,
  Language,
  SourceLanding,
  FormLocation
} from '../models/lead-form-options';
import { classifyEmailDomain } from '../utils/email-domain';
import { landingFromPath } from '../utils/landing-from-path';
import {
  LeadAttribution,
  LeadPageContext,
  LeadSession,
  LeadSource,
  TrackingContext
} from '../models/lead-payload.model';
import { SessionSignals } from '../utils/lead-score';

interface StoredUtm {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
}

/**
 * LeadTrackingService — captura automática del contexto del lead.
 *
 * Toda la lógica de acceso a `window`, `document`, `localStorage`, cookies, etc.
 * está protegida con `isPlatformBrowser` para no romper SSR.
 *
 * En server: devuelve valores por defecto / null, sin lanzar errores.
 */
/** Máximo de paths a guardar en el recorrido (evitar arrays gigantes). */
const MAX_VISITED_PATHS = 30;

@Injectable({ providedIn: 'root' })
export class LeadTrackingService {
  private isBrowser: boolean;
  private firstLoadAt: number = Date.now();
  private pagesVisited: number = 0;
  /** Recorrido de paths visitados en orden cronológico. */
  private visitedPaths: string[] = [];

  // Tiempo ACTIVO (Page Visibility): acumula solo el rato con la pestaña visible.
  private activeMs = 0;
  private lastResumeAt = Date.now();
  private visible = true;

  /**
   * ¿El router todavía no había resuelto su navegación inicial cuando nació este
   * servicio? Si es así, su primera `NavigationEnd` es esa misma carga, que el
   * constructor ya contó: no debe sumar una página más.
   *
   * Esto es lo que se rompió el 2026-06-28. Hasta entonces al servicio lo
   * inyectaba solo el formulario, que se construye después de que el router
   * resolvió la ruta, y la primera navegación no se veía. Ese día `AdsService`
   * pasó a inyectarlo, y como `AdsService` vive en el componente raíz, el
   * servicio empezó a nacer en el arranque, antes de navegar: desde entonces la
   * página inicial se contaba dos veces y el envío se contradecía a sí mismo
   * (decía dos páginas y adjuntaba un recorrido de una).
   *
   * Preguntarle al router en vez de asumir un orden hace que el conteo deje de
   * depender de quién inyecte primero.
   */
  private initialNavigationPending = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private i18n: LanguageService,
    private sectionTracking: SectionTrackingService,
    private clickTracking: ClickTrackingService,
    private timeline: TimelineService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.firstLoadAt = Date.now();
      this.lastResumeAt = Date.now();
      this.visible = this.document.visibilityState !== 'hidden';
      this.trackVisibility();

      // Registrar la página inicial en el recorrido. El contador va con el
      // recorrido, no aparte: cada página que entra al array suma uno.
      const initialPath = this.cleanPath(this.document.location.pathname);
      this.visitedPaths.push(initialPath);
      this.pagesVisited = 1;
      this.timeline.log('page', initialPath);

      // Si el router aún no navegó, la NavigationEnd que viene es esta misma carga.
      this.initialNavigationPending = !this.router.navigated;

      // Capturar UTM al cargar (incluye la primera visita)
      this.persistUtmParams();
      // Capturar el referrer first-touch (v1.5.0): document.referrer solo es confiable
      // en el primer load — persistirlo antes de que un F5 lo borre.
      this.persistEntryReferrer();

      // Contar páginas visitadas + acumular recorrido
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const nextPath = this.cleanPath(event.urlAfterRedirects || event.url);

          if (this.initialNavigationPending) {
            // Es la carga inicial, ya contada arriba. Si el router resolvió otra
            // ruta (una redirección), se corrige el recorrido sin sumar página.
            this.initialNavigationPending = false;
            this.replaceInitialPath(nextPath);
            this.persistUtmParams();
            return;
          }

          // Evitar duplicados consecutivos (navegaciones internas a la misma ruta)
          const lastPath = this.visitedPaths[this.visitedPaths.length - 1];
          if (nextPath !== lastPath) {
            this.pagesVisited += 1;
            this.visitedPaths.push(nextPath);
            this.timeline.log('page', nextPath);
            // Mantener tamaño acotado
            if (this.visitedPaths.length > MAX_VISITED_PATHS) {
              this.visitedPaths = this.visitedPaths.slice(-MAX_VISITED_PATHS);
            }
          }

          // Capturar UTM de la nueva URL también (por si llega con UTM nuevo)
          this.persistUtmParams();
        }
      });
    }
  }

  /**
   * Normaliza un path: quita query string y hash para que el array de recorrido
   * sea más legible para el CRM.
   */
  private cleanPath(url: string): string {
    if (!url) return '/';
    return url.split('?')[0].split('#')[0] || '/';
  }

  /**
   * Sustituye la ruta inicial del recorrido por la que el router resolvió de
   * verdad. Es la misma visita, no una página nueva: la carga inicial se anota
   * con lo que muestra el navegador (`/software/`, con barra) y el router puede
   * resolver otra cosa (`/software`, o la home si la URL no existía).
   */
  private replaceInitialPath(path: string): void {
    const lastIndex = this.visitedPaths.length - 1;
    if (lastIndex < 0 || this.visitedPaths[lastIndex] === path) return;
    this.visitedPaths[lastIndex] = path;
    this.timeline.replaceLastPage(path);
  }

  /**
   * Devuelve el snapshot completo de tracking en este instante.
   * Llamado por LeadFormService al armar el payload.
   *
   * `pageContext` no lo captura este servicio: lo trae el componente del
   * formulario, que es el único que sabe qué sistema o industria está mostrando
   * la página. Entra por acá para que `LeadSource` se arme entero en un solo
   * lugar.
   */
  getTrackingContext(
    formLocation: FormLocation,
    pageContext: LeadPageContext | null = null
  ): TrackingContext {
    return {
      source: this.getSource(formLocation, pageContext),
      attribution: this.getAttribution(),
      session: this.getSessionPartial()
    };
  }

  /**
   * Snapshot mínimo de señales de sesión para modular conversiones de click
   * (WhatsApp, copiar correo, agendar) sin requerir formLocation ni datos de
   * formulario. Lo consume AdsService vía `scoreSessionSignals()`. Reusa los
   * mismos getters que el payload del form, así un click "ve" exactamente la
   * misma sesión que vería un submit en ese instante. SSR-safe: en server
   * devuelve defaults inertes (igual no se disparan conversiones).
   */
  getSessionSignals(): SessionSignals {
    const tz = this.getTimezone();
    const locale = this.getLocale();
    const countryInfo = this.getCountry(locale, tz);
    const stored = this.getStoredUtm();
    return {
      landing: this.detectLanding(),
      utm_medium: stored ? stored.utm_medium : null,
      gclid: stored ? stored.gclid : null,
      time_on_site_ms: this.getTimeOnSite(),
      time_on_site_active_ms: this.getActiveTimeOnSite(),
      pages_visited: this.pagesVisited,
      country: countryInfo.country,
      country_source: countryInfo.source
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Source
  // ──────────────────────────────────────────────────────────────────────────

  private getSource(
    formLocation: FormLocation,
    pageContext: LeadPageContext | null
  ): LeadSource {
    return {
      landing: this.detectLanding(),
      page_context: pageContext,
      form_location: formLocation,
      page_url: this.isBrowser ? this.document.location.href : '',
      referrer: this.isBrowser ? (this.document.referrer || null) : null,
      entry_referrer: this.getEntryReferrer(),
      language: this.getLanguage()
    };
  }

  /**
   * Brazo de negocio de la página desde la que se está enviando el lead. La
   * regla vive en `utils/landing-from-path.ts`, que es pura: acá solo se le pasa
   * el path.
   */
  detectLanding(): SourceLanding {
    // En SSR no hay página real y el envío se arma siempre en el navegador, así
    // que este valor no llega a viajar. `other` es el honesto: no se sabe.
    if (!this.isBrowser) return 'other';
    return landingFromPath(this.document.location.pathname);
  }

  getLanguage(): Language {
    return this.i18n.lang();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Attribution (UTM, gclid, GA client_id)
  // ──────────────────────────────────────────────────────────────────────────

  private getAttribution(): LeadAttribution {
    const stored = this.getStoredUtm();
    const firstTouch = this.getFirstTouchUtm();

    return {
      utm_source:   stored ? stored.utm_source : null,
      utm_medium:   stored ? stored.utm_medium : null,
      utm_campaign: stored ? stored.utm_campaign : null,
      utm_term:     stored ? stored.utm_term : null,
      utm_content:  stored ? stored.utm_content : null,
      gclid:        stored ? stored.gclid : null,
      ga_client_id: this.getGaClientId(),
      first_touch_utm: firstTouch
    };
  }

  /**
   * Lee UTM/gclid de la URL actual y los persiste en localStorage.
   * Si ya hay un "first touch" guardado, no lo sobreescribe (atribución first-touch).
   * El "last touch" sí se actualiza con cada visita que traiga UTM.
   */
  private persistUtmParams(): void {
    if (!this.isBrowser) return;

    const params = new URLSearchParams(this.document.location.search);
    const utm = {
      utm_source:   params.get('utm_source'),
      utm_medium:   params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term:     params.get('utm_term'),
      utm_content:  params.get('utm_content'),
      gclid:        params.get('gclid')
    };

    // Si la URL no tiene NADA de UTM, no sobreescribir lo que ya hay guardado
    const hasAnyUtm = Object.values(utm).some((v) => v !== null);
    if (!hasAnyUtm) return;

    // Last-touch: siempre actualizar
    lsSetJsonWithTtl(STORAGE_KEYS.UTM, utm, UTM_TTL_MS);

    // First-touch: solo si no existe
    const existingFirst = lsGetJsonWithTtl(STORAGE_KEYS.FIRST_TOUCH_UTM);
    if (!existingFirst) {
      lsSetJsonWithTtl(STORAGE_KEYS.FIRST_TOUCH_UTM, utm, UTM_TTL_MS);
    }
  }

  /**
   * Persiste el referrer EXTERNO del primer load (first-touch, mismo criterio que
   * FIRST_TOUCH_UTM: solo si no existe ya uno vigente). Los referrers del propio
   * sitio (navegación interna / recarga) no cuentan.
   */
  private persistEntryReferrer(): void {
    if (!this.isBrowser) return;

    const raw = (this.document.referrer || '').trim();
    if (!raw) return;
    try {
      const host = new URL(raw).hostname.toLowerCase();
      if (host === this.document.location.hostname.toLowerCase()) return;
    } catch {
      // referrer no parseable como URL: raro, pero es señal externa — se guarda igual
    }

    const existing = lsGetJsonWithTtl<string>(STORAGE_KEYS.ENTRY_REFERRER);
    if (!existing) {
      lsSetJsonWithTtl(STORAGE_KEYS.ENTRY_REFERRER, raw.slice(0, 2048), UTM_TTL_MS);
    }
  }

  /** Referrer first-touch persistido; fallback al document.referrer vivo si no hay. */
  private getEntryReferrer(): string | null {
    if (!this.isBrowser) return null;
    const stored = lsGetJsonWithTtl<string>(STORAGE_KEYS.ENTRY_REFERRER);
    if (stored) return stored;
    return this.document.referrer || null;
  }

  private getStoredUtm(): StoredUtm | null {
    return lsGetJsonWithTtl<StoredUtm>(STORAGE_KEYS.UTM);
  }

  private getFirstTouchUtm(): Partial<LeadAttribution> | null {
    return lsGetJsonWithTtl<Partial<LeadAttribution>>(STORAGE_KEYS.FIRST_TOUCH_UTM);
  }

  /**
   * Parsea la cookie _ga de Google Analytics.
   * Formato típico: "GA1.1.1234567890.1234567890"
   * Devuelve "1234567890.1234567890" (los últimos dos segmentos = client_id).
   */
  getGaClientId(): string | null {
    const raw = cookieGet('_ga');
    if (!raw) return null;
    // Formato: GA1.X.<clientId>.<sessionId> — el clientId son los segmentos 3 y 4
    const parts = raw.split('.');
    if (parts.length < 4) return null;
    return `${parts[2]}.${parts[3]}`;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Session
  // ──────────────────────────────────────────────────────────────────────────

  private getSessionPartial(): Omit<
    LeadSession,
    'form_load_to_submit_ms' | 'interaction_count' | 'form_first_interaction_to_submit_ms'
  > {
    const tz = this.getTimezone();
    const locale = this.getLocale();
    const countryInfo = this.getCountry(locale, tz);

    return {
      user_agent: this.isBrowser ? navigator.userAgent : '',
      device_type: this.getDeviceType(),
      time_on_site_ms: this.getTimeOnSite(),
      time_on_site_active_ms: this.getActiveTimeOnSite(),
      pages_visited: this.pagesVisited,
      pages_visited_paths: [...this.visitedPaths],
      screen_resolution: this.getScreenResolution(),
      timezone: tz,
      locale,
      country: countryInfo.country,
      country_source: countryInfo.source,
      sections: this.sectionTracking.getSnapshot(),
      clicks: this.clickTracking.getSnapshot(),
      timeline: this.timeline.getSnapshot()
    };
  }

  getDeviceType(): DeviceType {
    if (!this.isBrowser) return 'desktop';
    const ua = navigator.userAgent;
    if (/iPad|Android.+(?!Mobile)|Tablet/i.test(ua)) return 'tablet';
    if (/Mobile|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  getTimeOnSite(): number {
    if (!this.isBrowser) return 0;
    return Date.now() - this.firstLoadAt;
  }

  /**
   * Tiempo ACTIVO en el sitio: descuenta los lapsos con la pestaña en segundo plano
   * (Page Visibility API). Refleja mejor cuánto estuvo realmente prestando atención.
   */
  getActiveTimeOnSite(): number {
    if (!this.isBrowser) return 0;
    return this.visible
      ? this.activeMs + (Date.now() - this.lastResumeAt)
      : this.activeMs;
  }

  /** Suscribe a visibilitychange para acumular solo el tiempo con la pestaña visible. */
  private trackVisibility(): void {
    if (!this.isBrowser) return;
    this.document.addEventListener('visibilitychange', () => {
      const hidden = this.document.visibilityState === 'hidden';
      if (hidden && this.visible) {
        this.activeMs += Date.now() - this.lastResumeAt;
        this.visible = false;
      } else if (!hidden && !this.visible) {
        this.lastResumeAt = Date.now();
        this.visible = true;
      }
    });
  }

  private getScreenResolution(): string | null {
    if (!this.isBrowser) return null;
    return `${window.screen.width}x${window.screen.height}`;
  }

  private getTimezone(): string | null {
    if (!this.isBrowser) return null;
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {
      return null;
    }
  }

  /**
   * Locale completo del navegador (ej: "es-CR", "en-US", "pt-BR").
   */
  private getLocale(): string | null {
    if (!this.isBrowser) return null;
    return navigator.language || null;
  }

  /**
   * Extrae el código de país del locale del navegador.
   * Ej: "es-CR" → "CR", "en-US" → "US", "pt" → null (sin región)
   */
  private getLocaleCountry(locale: string | null): string | null {
    if (!locale) return null;
    const parts = locale.split('-');
    if (parts.length >= 2 && parts[1].length === 2) {
      return parts[1].toUpperCase();
    }
    return null;
  }

  /**
   * Detecta el país combinando timezone y locale del browser.
   * Estrategia:
   *   - Si ambos coinciden → 'both' (alta confianza)
   *   - Si solo uno está disponible → ese
   *   - Si difieren → preferir timezone (más confiable que locale,
   *     porque el locale puede ser "es-MX" en un user que vive en CR)
   *   - Si ninguno → null
   */
  private getCountry(
    locale: string | null,
    timezone: string | null
  ): { country: string | null; source: 'timezone' | 'locale' | 'both' | null } {
    const fromLocale = this.getLocaleCountry(locale);
    const fromTimezone = getCountryFromTimezone(timezone);

    if (fromLocale && fromTimezone) {
      if (fromLocale === fromTimezone) {
        return { country: fromLocale, source: 'both' };
      }
      // Conflicto: el timezone es más confiable (refleja dónde está físicamente)
      return { country: fromTimezone, source: 'timezone' };
    }
    if (fromTimezone) return { country: fromTimezone, source: 'timezone' };
    if (fromLocale) return { country: fromLocale, source: 'locale' };
    return { country: null, source: null };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Helpers expuestos para el form component
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Clasifica un email como personal o corporate según el proveedor del dominio.
   * La lógica (etiqueta registrable + sufijos compuestos) vive en
   * `utils/email-domain.ts`, que es pura y se prueba sin montar el servicio.
   */
  getEmailDomainType(email: string): EmailDomainType {
    return classifyEmailDomain(email);
  }
}
