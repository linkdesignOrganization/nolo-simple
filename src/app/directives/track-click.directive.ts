import { Directive, HostListener, Input, inject } from '@angular/core';
import { ClickTrackingService } from '../lead-form/services/click-tracking.service';

/**
 * TrackClickDirective — registra un click en un botón/CTA nombrado.
 * Uso: `appTrackClick="Agendar reunión"` en el elemento clickeable.
 * SSR-safe: el listener solo corre en browser (no hay clicks en el prerender).
 */
@Directive({ selector: '[appTrackClick]', standalone: true })
export class TrackClickDirective {
  @Input('appTrackClick') label = '';

  private readonly tracker = inject(ClickTrackingService);

  @HostListener('click')
  onClick(): void {
    if (this.label) this.tracker.record(this.label);
  }
}
