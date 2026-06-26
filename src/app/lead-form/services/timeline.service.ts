import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TimelineEvent } from '../models/lead-payload.model';

/**
 * TimelineService — registra los hitos de la sesión en ORDEN cronológico, cada uno con su
 * offset en ms desde la primera carga: páginas, secciones (1ª vez), clics e inicio del
 * formulario. Lo alimentan lead-tracking, section-tracking, click-tracking y el form.
 * El CRM lo muestra como "Línea de tiempo de la sesión". SSR-safe: en server no registra.
 */
@Injectable({ providedIn: 'root' })
export class TimelineService {
  private isBrowser: boolean;
  private startAt = Date.now();
  private events: TimelineEvent[] = [];
  private static readonly MAX = 60;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.startAt = Date.now();
  }

  /** Registra un hito con su offset en ms desde el inicio de la sesión. */
  log(kind: TimelineEvent['kind'], label: string): void {
    if (!this.isBrowser || !label) return;
    if (this.events.length >= TimelineService.MAX) return;
    this.events.push({ at_ms: Date.now() - this.startAt, kind, label });
  }

  /** Snapshot del recorrido en orden. Para el payload. */
  getSnapshot(): TimelineEvent[] {
    if (!this.isBrowser) return [];
    return [...this.events];
  }
}
