import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ClickCount } from '../models/lead-payload.model';
import { TimelineService } from './timeline.service';

/**
 * ClickTrackingService — cuenta cuántas veces el lead tocó cada botón/CTA nombrado
 * durante la sesión. Lo alimentan el `AdsService` (WhatsApp, copiar correo, agendar) y
 * la directiva `appTrackClick` (CTAs de navegación). SSR-safe: en server no registra.
 */
@Injectable({ providedIn: 'root' })
export class ClickTrackingService {
  private isBrowser: boolean;
  private clicks = new Map<string, number>();
  private readonly timeline = inject(TimelineService);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /** Registra un click en el botón etiquetado `label`. */
  record(label: string): void {
    if (!this.isBrowser || !label) return;
    this.clicks.set(label, (this.clicks.get(label) || 0) + 1);
    this.timeline.log('click', label);
  }

  /** Snapshot de los clicks acumulados, ordenado de más a menos. Para el payload. */
  getSnapshot(): ClickCount[] {
    if (!this.isBrowser) return [];
    const out: ClickCount[] = [];
    for (const [label, count] of this.clicks.entries()) {
      out.push({ label, count });
    }
    out.sort((a, b) => b.count - a.count);
    return out;
  }
}
