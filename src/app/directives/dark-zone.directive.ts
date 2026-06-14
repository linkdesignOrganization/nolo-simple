import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, PLATFORM_ID, inject } from '@angular/core';

import { DarkZoneService } from './dark-zone.service';

// Marca una "zona oscura" del scroll (p.ej. showcase + etapas, o el footer): el sitio pasa a
// negro mientras la zona domina el viewport y vuelve a claro al salir. Puede haber varias zonas
// separadas por secciones claras; el DarkZoneService agrega los estados para que no se pisen.
@Directive({
  selector: '[appDarkZone]',
  standalone: true
})
export class DarkZoneDirective implements AfterViewInit, OnDestroy {
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);
  private readonly darkZone = inject(DarkZoneService);
  private readonly platformId = inject(PLATFORM_ID);

  private rafId: number | null = null;
  private readonly onScroll = (): void => this.requestUpdate();

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const win = this.document.defaultView;
      win?.addEventListener('scroll', this.onScroll, { passive: true });
      win?.addEventListener('resize', this.onScroll, { passive: true });
      this.update();
    });
  }

  ngOnDestroy(): void {
    const win = this.document.defaultView;
    win?.removeEventListener('scroll', this.onScroll);
    win?.removeEventListener('resize', this.onScroll);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.darkZone.setActive(this, false);
  }

  private requestUpdate(): void {
    if (this.rafId !== null) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.update();
    });
  }

  // El negro entra cuando la zona ya subió bastante (su top cruza un umbral del viewport):
  // a la mitad en desktop, un poco antes en mobile. Sale cuando la zona pasó la mitad hacia
  // arriba (bottom < 50%), es decir cuando la sección de abajo toma el control y vuelve a gris.
  private update(): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }
    const rect = this.hostRef.nativeElement.getBoundingClientRect();
    const vh = win.innerHeight;
    const enterAt = win.innerWidth <= 760 ? 0.7 : 0.5;
    const dark = rect.top < vh * enterAt && rect.bottom > vh * 0.5;
    this.darkZone.setActive(this, dark);
  }
}
