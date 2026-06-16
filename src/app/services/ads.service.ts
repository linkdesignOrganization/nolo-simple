import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
 * AdsService — dispara conversiones de Google Ads para los clicks y el scroll del sitio.
 * (La conversión del envío del formulario se dispara desde LeadFormService, con value por
 *  scoring, también a CONTACTO.)
 * No-op seguro si gtag no está disponible (SSR, dev sin script, ad-blocker).
 */
@Injectable({ providedIn: 'root' })
export class AdsService {
  private readonly isBrowser: boolean;

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

  /** Click en WhatsApp (value 5). */
  whatsapp(): void {
    this.fireConversion(ADS_CONVERSIONS.CONTACTO, 5);
  }

  /** Copiar el correo (value 25). */
  emailCopy(): void {
    this.fireConversion(ADS_CONVERSIONS.CONTACTO, 25);
  }

  /** Click en "Agendar reunión" (value 30). */
  scheduleMeeting(): void {
    this.fireConversion(ADS_CONVERSIONS.CONTACTO, 30);
  }

  /** Scroll al 50% de la página (value 1, una sola vez por página). */
  scroll(): void {
    this.fireConversion(ADS_CONVERSIONS.SCROLL, 1);
  }
}
