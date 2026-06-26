import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  afterNextRender,
  inject
} from '@angular/core';
import { SectionTrackingService } from '../lead-form/services/section-tracking.service';

/**
 * TrackSectionDirective — mide cuánto tiempo una sección estuvo "en foco" (cruzando la
 * banda central del viewport, mismo patrón que el autoplay del portafolio).
 *
 * Uso: `appTrackSection="sistemas"` en la sección. Si se omite el valor, usa el `id` del
 * elemento. SSR-safe: el observer se monta en `afterNextRender` (solo browser).
 */
@Directive({ selector: '[appTrackSection]', standalone: true })
export class TrackSectionDirective implements OnDestroy {
  @Input('appTrackSection') sectionId = '';

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly tracker = inject(SectionTrackingService);
  private observer?: IntersectionObserver;
  private resolvedId = '';

  constructor() {
    afterNextRender(() => {
      this.resolvedId = this.sectionId || this.el.nativeElement.id;
      if (!this.resolvedId) return;
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) this.tracker.enter(this.resolvedId);
            else this.tracker.exit(this.resolvedId);
          }
        },
        // Banda central: la sección cuenta como "mirada" cuando cruza el centro del viewport.
        { rootMargin: '-40% 0px -40%', threshold: 0 }
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    if (this.resolvedId) this.tracker.exit(this.resolvedId);
    this.observer?.disconnect();
  }
}
