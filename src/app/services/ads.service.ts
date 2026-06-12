import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare var gtag: Function;

/**
 * Conversion actions de Google Ads de Sowe.
 *
 * ⚠️ PLACEHOLDERS — reemplazar cuando el encargado tenga la cuenta de Google Ads de Sowe:
 *   1. El ID de cuenta `AW-XXXXXXXXXX` (también en src/index.html → gtag config).
 *   2. El label de cada conversion action (lo que va después de la `/`).
 * Mientras sean placeholders, gtag es no-op real (no hay cuenta detrás) y no rompe nada.
 * Misma estrategia que LinkDesign: engagement (bajo/medio intent) vs alto intent.
 */
export const ADS_CONVERSIONS = {
  /** Engagement de bajo/medio intent: WhatsApp, copiar email, teléfono. */
  ENGAGEMENT: 'AW-XXXXXXXXXX/PLACEHOLDER_ENGAGEMENT',
  /** Alto intent: agendar reunión, form "hot". */
  HIGH_INTENT: 'AW-XXXXXXXXXX/PLACEHOLDER_HIGH_INTENT'
} as const;

/**
 * AdsService — dispara conversiones de Google Ads para clicks del sitio.
 * (La conversión del envío del formulario se disparará desde el CRM con value por
 *  scoring cuando se porte el CRM a Sowe — igual que en LinkDesign.)
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
    this.fireConversion(ADS_CONVERSIONS.ENGAGEMENT, 5);
  }

  /** Copiar el correo (value 25). */
  emailCopy(): void {
    this.fireConversion(ADS_CONVERSIONS.ENGAGEMENT, 25);
  }

  /** Click en "Agendar reunión" (alto intent, value 30). */
  scheduleMeeting(): void {
    this.fireConversion(ADS_CONVERSIONS.HIGH_INTENT, 30);
  }
}
