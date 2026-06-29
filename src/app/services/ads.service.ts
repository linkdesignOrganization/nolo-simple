import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ClickTrackingService } from '../lead-form/services/click-tracking.service';
import { LeadTrackingService } from '../lead-form/services/lead-tracking.service';
import { modulateValueBySession } from '../lead-form/utils/lead-score';

declare var gtag: Function;

/**
 * Conversion actions de Google Ads de SOWE (cuenta AW-16767245191, compartida con LinkDesign).
 *
 * Acciones PROPIAS de SOWE ("Contacto Argentina" y "Scroll Argentina"), separadas de las de
 * LinkDesign para no mezclar las conversiones de Argentina con las de Costa Rica. El label (lo
 * que va después de la `/`) se copió del tag de cada conversion action en Google Ads.
 * El send_to de CONTACTO se usa también en lead-form/models/lead-form-options.ts (form submit).
 *
 * Mismo modelo que LinkDesign: solo DOS acciones de conversión vienen del sitio:
 *   - CONTACTO: WhatsApp, copiar correo, agendar reunión y formulario (value variable).
 *   - SCROLL: scroll al 50% de la página (value 1).
 */
export const ADS_CONVERSIONS = {
  /** "Contacto Argentina" en Ads: WhatsApp, copiar correo, agendar reunión y formulario. */
  CONTACTO: 'AW-16767245191/-7YECOqL7b8cEIe3n7s-',
  /** "Scroll Argentina" en Ads: scroll al 50% de la página. */
  SCROLL: 'AW-16767245191/P_8YCIf4878cEIe3n7s-'
} as const;

/**
 * Values base (USD) de cada click de contacto, ANTES de modular por calidad de
 * sesión. Reflejan la intención intrínseca del canal:
 *   agendar (30) > copiar correo (25) > WhatsApp (5).
 * El value final se multiplica por `sessionQualityFactor` (0.7–1.0): una sesión
 * floja baja el value, una excelente lo deja en el base (techo = base, para que
 * el formulario siga siendo el techo del sitio). Ver utils/lead-score.ts.
 */
export const CONTACTO_BASE_VALUE = {
  whatsapp: 5,
  emailCopy: 25,
  scheduleMeeting: 30
} as const;

/**
 * AdsService — dispara conversiones de Google Ads para los clicks y el scroll del sitio.
 *
 * Los clicks de contacto (WhatsApp, copiar correo, agendar) reportan un value
 * MODULADO por la calidad de la sesión actual (no un fijo): la misma señal de
 * sesión que usa el lead scoring, normalizada a un factor 0.7–1.0. Así Smart
 * Bidding distingue un click de una sesión profunda de uno de un rebote.
 * (La conversión del envío del formulario se dispara desde LeadFormService, con
 *  value por scoring completo, también a CONTACTO.)
 * No-op seguro si gtag no está disponible (SSR, dev sin script, ad-blocker).
 */
@Injectable({ providedIn: 'root' })
export class AdsService {
  private readonly isBrowser: boolean;
  private readonly clicks = inject(ClickTrackingService);
  private readonly tracking = inject(LeadTrackingService);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  fireConversion(sendTo: string, value: number, currency = 'USD'): void {
    if (!this.isBrowser || typeof gtag !== 'function') return;
    try {
      gtag('event', 'conversion', { send_to: sendTo, value, currency });
    } catch {
      // silencioso — el tracking no debe romper la UX
    }
  }

  /**
   * Modula un value base por la calidad de la sesión actual (Opción A: solo
   * penaliza sesiones flojas; techo en el value base). Devuelve el value listo
   * para reportar a Ads, redondeado a 2 decimales.
   */
  private modulatedValue(base: number): number {
    return modulateValueBySession(base, this.tracking.getSessionSignals());
  }

  /** Click en WhatsApp (value base 5, modulado por calidad de sesión). */
  whatsapp(): void {
    this.clicks.record('WhatsApp');
    this.fireConversion(ADS_CONVERSIONS.CONTACTO, this.modulatedValue(CONTACTO_BASE_VALUE.whatsapp));
  }

  /** Copiar el correo (value base 25, modulado por calidad de sesión). */
  emailCopy(): void {
    this.clicks.record('Copiar correo');
    this.fireConversion(ADS_CONVERSIONS.CONTACTO, this.modulatedValue(CONTACTO_BASE_VALUE.emailCopy));
  }

  /** Click en "Agendar reunión" (value base 30, modulado por calidad de sesión). */
  scheduleMeeting(): void {
    this.clicks.record('Agendar reunión');
    this.fireConversion(ADS_CONVERSIONS.CONTACTO, this.modulatedValue(CONTACTO_BASE_VALUE.scheduleMeeting));
  }

  /**
   * Scroll al 50% de la página (value 1, una sola vez por página).
   * No se modula: señal de engagement débil y es OTRA acción de conversión (SCROLL).
   */
  scroll(): void {
    this.fireConversion(ADS_CONVERSIONS.SCROLL, 1);
  }
}
