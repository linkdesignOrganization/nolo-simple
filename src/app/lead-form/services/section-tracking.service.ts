import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { SectionTime } from '../models/lead-payload.model';
import { TimelineService } from './timeline.service';

interface SectionState {
  inView: boolean;
  visibleMs: number;
  resumedAt: number | null;
  logged: boolean;
}

/**
 * SectionTrackingService — acumula cuánto tiempo estuvo "en foco" cada sección del sitio
 * (cruzando la banda central del viewport). Lo alimenta `TrackSectionDirective` vía
 * enter()/exit(); el tiempo descuenta los lapsos con la pestaña en segundo plano
 * (Page Visibility), igual que el tiempo activo del sitio.
 *
 * SSR-safe: en server no registra nada y getSnapshot() devuelve [].
 */
@Injectable({ providedIn: 'root' })
export class SectionTrackingService {
  private isBrowser: boolean;
  private sections = new Map<string, SectionState>();
  private docVisible = true;
  private readonly timeline = inject(TimelineService);

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.docVisible = this.document.visibilityState !== 'hidden';
      this.document.addEventListener('visibilitychange', () =>
        this.onVisibilityChange()
      );
    }
  }

  private state(id: string): SectionState {
    let s = this.sections.get(id);
    if (!s) {
      s = { inView: false, visibleMs: 0, resumedAt: null, logged: false };
      this.sections.set(id, s);
    }
    return s;
  }

  /** La sección entró a la banda central del viewport. */
  enter(id: string): void {
    if (!this.isBrowser) return;
    const s = this.state(id);
    if (!s.logged) {
      s.logged = true;
      this.timeline.log('section', id);
    }
    s.inView = true;
    if (this.docVisible && s.resumedAt === null) {
      s.resumedAt = Date.now();
    }
  }

  /** La sección salió de la banda central. */
  exit(id: string): void {
    if (!this.isBrowser) return;
    const s = this.state(id);
    s.inView = false;
    if (s.resumedAt !== null) {
      s.visibleMs += Date.now() - s.resumedAt;
      s.resumedAt = null;
    }
  }

  /** Pausa el conteo de las secciones visibles al ocultar la pestaña; lo reanuda al volver. */
  private onVisibilityChange(): void {
    const hidden = this.document.visibilityState === 'hidden';
    const now = Date.now();
    if (hidden && this.docVisible) {
      for (const s of this.sections.values()) {
        if (s.resumedAt !== null) {
          s.visibleMs += now - s.resumedAt;
          s.resumedAt = null;
        }
      }
      this.docVisible = false;
    } else if (!hidden && !this.docVisible) {
      this.docVisible = true;
      for (const s of this.sections.values()) {
        if (s.inView) s.resumedAt = now;
      }
    }
  }

  /**
   * Snapshot del tiempo por sección (incluye el tramo en curso), ordenado de mayor a
   * menor. Solo secciones con tiempo > 0. Lo usa LeadTrackingService al armar el payload.
   */
  getSnapshot(): SectionTime[] {
    if (!this.isBrowser) return [];
    const now = Date.now();
    const out: SectionTime[] = [];
    for (const [id, s] of this.sections.entries()) {
      let ms = s.visibleMs;
      if (s.resumedAt !== null) ms += now - s.resumedAt;
      if (ms > 0) out.push({ id, visible_ms: Math.round(ms) });
    }
    out.sort((a, b) => b.visible_ms - a.visible_ms);
    return out;
  }
}
