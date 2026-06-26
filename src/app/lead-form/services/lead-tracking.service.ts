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
  PERSONAL_EMAIL_DOMAINS,
  DeviceType,
  EmailDomainType,
  Language,
  SourceLanding,
  FormLocation
} from '../models/lead-form-options';
import {
  LeadAttribution,
  LeadSession,
  LeadSource,
  TrackingContext
} from '../models/lead-payload.model';

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
      this.pagesVisited = 1; // página inicial cuenta

      // Registrar la página inicial en el recorrido
      const initialPath = this.cleanPath(this.document.location.pathname);
      this.visitedPaths.push(initialPath);
      this.timeline.log('page', initialPath);

      // Capturar UTM al cargar (incluye la primera visita)
      this.persistUtmParams();

      // Contar páginas visitadas + acumular recorrido
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.pagesVisited += 1;

          const nextPath = this.cleanPath(event.urlAfterRedirects || event.url);
          // Evitar duplicados consecutivos (navegaciones internas a la misma ruta)
          const lastPath = this.visitedPaths[this.visitedPaths.length - 1];
          if (nextPath !== lastPath) {
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
   * Devuelve el snapshot completo de tracking en este instante.
   * Llamado por LeadFormService al armar el payload.
   */
  getTrackingContext(formLocation: FormLocation): TrackingContext {
    return {
      source: this.getSource(formLocation),
      attribution: this.getAttribution(),
      session: this.getSessionPartial()
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Source
  // ──────────────────────────────────────────────────────────────────────────

  private getSource(formLocation: FormLocation): LeadSource {
    return {
      landing: this.detectLanding(),
      form_location: formLocation,
      page_url: this.isBrowser ? this.document.location.href : '',
      referrer: this.isBrowser ? (this.document.referrer || null) : null,
      language: this.getLanguage()
    };
  }

  detectLanding(): SourceLanding {
    if (!this.isBrowser) return 'corporate'; // default arbitrario en SSR
    const path = this.document.location.pathname.toLowerCase();
    if (path.startsWith('/software')) return 'software';
    if (path.startsWith('/contacto')) return 'contact';
    if (path.startsWith('/web')) return 'corporate';
    // home y resto → corporate
    return 'corporate';
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
   * Clasifica un email como personal o corporate según el dominio.
   */
  getEmailDomainType(email: string): EmailDomainType {
    const domain = (email.split('@')[1] || '').toLowerCase().trim();
    return PERSONAL_EMAIL_DOMAINS.includes(domain) ? 'personal' : 'corporate';
  }
}
