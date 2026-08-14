import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ClickTrackingService } from '../lead-form/services/click-tracking.service';
import { LeadTrackingService } from '../lead-form/services/lead-tracking.service';
import { modulateValueBySession } from '../lead-form/utils/lead-score';

declare var gtag: Function;

/**
 * Conversion actions de Google Ads de Nolo (cuenta AW-16767245191, compartida con LinkDesign;
 * la cuenta se creó históricamente bajo la marca anterior, Sowe).
 *
 * Acciones PROPIAS de Nolo, separadas de las de LinkDesign para no mezclar las conversiones de
 * Argentina con las de Costa Rica. El label (lo que va después de la `/`) sale del tag de cada
 * conversion action en Google Ads.
 *
 * Un canal, una acción. Hasta el 13 ago 2026 los cuatro canales de contacto compartían una sola
 * acción ("Contacto Argentina"), así que ningún informe podía decir si un contacto era un WhatsApp
 * o un formulario — ni Smart Bidding distinguirlos al pujar. Cambio espejo del sitio LinkDesign,
 * donde esa mezcla escondió que la campaña de Costa Rica había dejado de traer formularios.
 * Ver docs/bitacora-ads.md acá y docs/bitacora-ads-values-troas.md en LinkDesign-simple.
 *
 * Las cuatro nuevas son DEFAULT/WEBSITE igual que la vieja: las campañas argentinas usan los
 * objetivos de conversión de la cuenta, donde DEFAULT/WEBSITE sí puja. Cambiar la categoría las
 * habría dejado fuera de la puja sin ningún aviso.
 *
 * "Contacto Argentina" queda ENABLED en la cuenta pero ya no se dispara desde acá: conserva su
 * histórico en los informes y deja de acumular.
 */
export const ADS_CONVERSIONS = {
  /** "Contacto WhatsApp Argentina": click en WhatsApp (value base 10, modulado). */
  CONTACTO_WHATSAPP: 'AW-16767245191/zxm7CMGXquEcEIe3n7s-',
  /** "Contacto Correo Argentina": click en copiar el correo (value base 50, modulado). */
  CONTACTO_CORREO: 'AW-16767245191/tU5ZCMSXquEcEIe3n7s-',
  /** "Contacto Reunión Argentina": click en agendar reunión (value base 60, modulado). */
  CONTACTO_REUNION: 'AW-16767245191/GPuTCMeXquEcEIe3n7s-',
  /** "Contacto Formulario Argentina": envío del formulario (lo dispara LeadFormService). */
  CONTACTO_FORMULARIO: 'AW-16767245191/ZAj_CMqXquEcEIe3n7s-',
  /** "Scroll Argentina" en Ads: scroll al 50% de la página. */
  SCROLL: 'AW-16767245191/P_8YCIf4878cEIe3n7s-'
} as const;

/**
 * Values base (USD) de cada click de contacto, ANTES de modular por calidad de
 * sesión. Reflejan la intención intrínseca del canal:
 *   agendar (60) > copiar correo (50) > WhatsApp (10).
 * Escala ×2 desde jul 2026 para ampliar el contraste contra SCROLL (value 1)
 * en Smart Bidding — cambio espejo del sitio LinkDesign.
 * El value final se multiplica por `sessionQualityFactor` (0.7–1.0): una sesión
 * floja baja el value, una excelente lo deja en el base (techo = base, para que
 * el formulario siga siendo el techo del sitio). Ver utils/lead-score.ts.
 */
export const CONTACTO_BASE_VALUE = {
  whatsapp: 10,
  emailCopy: 50,
  scheduleMeeting: 60
} as const;

/**
 * AdsService — dispara conversiones de Google Ads para los clicks y el scroll del sitio.
 *
 * Los clicks de contacto (WhatsApp, copiar correo, agendar) reportan un value
 * MODULADO por la calidad de la sesión actual (no un fijo): la misma señal de
 * sesión que usa el lead scoring, normalizada a un factor 0.7–1.0. Así Smart
 * Bidding distingue un click de una sesión profunda de uno de un rebote.
 * (La conversión del envío del formulario se dispara desde LeadFormService, con
 *  value por scoring completo, a CONTACTO_FORMULARIO.)
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

  /** Click en WhatsApp (value base 10, modulado por calidad de sesión). */
  whatsapp(): void {
    this.clicks.record('WhatsApp');
    this.fireConversion(
      ADS_CONVERSIONS.CONTACTO_WHATSAPP,
      this.modulatedValue(CONTACTO_BASE_VALUE.whatsapp)
    );
  }

  /** Copiar el correo (value base 50, modulado por calidad de sesión). */
  emailCopy(): void {
    this.clicks.record('Copiar correo');
    this.fireConversion(
      ADS_CONVERSIONS.CONTACTO_CORREO,
      this.modulatedValue(CONTACTO_BASE_VALUE.emailCopy)
    );
  }

  /** Click en "Agendar reunión" (value base 60, modulado por calidad de sesión). */
  scheduleMeeting(): void {
    this.clicks.record('Agendar reunión');
    this.fireConversion(
      ADS_CONVERSIONS.CONTACTO_REUNION,
      this.modulatedValue(CONTACTO_BASE_VALUE.scheduleMeeting)
    );
  }

  /**
   * Scroll al 50% de la página (value 1, una sola vez por página).
   * No se modula: señal de engagement débil y es OTRA acción de conversión (SCROLL).
   */
  scroll(): void {
    this.fireConversion(ADS_CONVERSIONS.SCROLL, 1);
  }
}
