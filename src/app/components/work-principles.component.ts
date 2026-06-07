import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input
} from '@angular/core';
import { LucideCircleCheck, LucideCircleOff, LucideRoute } from '@lucide/angular';

export type Principle = {
  body: string;
  icon: 'circle-check' | 'circle-off' | 'route';
  title: string;
};

@Component({
  selector: 'app-work-principles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideCircleCheck, LucideRoute, LucideCircleOff],
  host: {
    'class': 'work-principles'
  },
  template: `
    <div class="wp-inner">
      <h2 class="wp-title">{{ heading() }}</h2>

      <div class="wp-cards">
        @for (card of cards(); track card.title; let i = $index) {
          <article class="wp-card" [style.transitionDelay]="i * 90 + 'ms'">
            <span class="wp-card__icon" aria-hidden="true">
              @switch (card.icon) {
                @case ('circle-check') {
                  <svg lucideCircleCheck [size]="30" [strokeWidth]="1"></svg>
                }
                @case ('route') {
                  <svg lucideRoute [size]="30" [strokeWidth]="1"></svg>
                }
                @case ('circle-off') {
                  <svg lucideCircleOff [size]="30" [strokeWidth]="1"></svg>
                }
              }
            </span>
            <div class="wp-card__panel">
              <h3 class="wp-card__title">{{ card.title }}</h3>
              <p class="wp-card__body">{{ card.body }}</p>
            </div>
          </article>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
    }

    /* Fondo sólido full-bleed: tapa la grilla técnica también en los márgenes.
       La transición acompaña el cambio a tema oscuro al entrar a la showcase. */
    :host::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: var(--surface);
      transition: background-color 450ms ease;
    }

    .wp-inner {
      display: flex;
      flex-direction: column;
      gap: clamp(2.5rem, 6vw, 5rem);
      padding: var(--section-py) 0;
    }

    .wp-title {
      margin: 0;
      color: var(--ink);
      font-size: clamp(2.2rem, 6vw, 4.5rem);
      font-weight: 400;
      letter-spacing: -0.055em;
      line-height: 1;
    }

    .wp-cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(1.5rem, 3vw, 3rem);
    }

    .wp-card {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      height: 100%;
      /* Estado inicial: las cards entran al asomar la sección (.is-in en el host). */
      opacity: 0;
      transform: translateY(40px);
      transition:
        opacity 600ms ease,
        transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform, opacity;
    }

    :host(.is-in) .wp-card {
      opacity: 1;
      transform: none;
    }

    .wp-card__icon {
      display: inline-flex;
      color: var(--ink);
    }

    /* El TÍTULO de cada card va embracketado entre dos líneas; el cuerpo debajo y
       una línea de cierre al fondo del panel. flex: 1 hace que los 3 paneles tomen
       la misma altura (la del card con más texto, vía el stretch del grid en
       desktop): la línea de cierre queda alineada en los 3. */
    .wp-card__panel {
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 1rem;
      padding-bottom: 1.4rem;
      border-bottom: 1px solid var(--ink);
    }

    .wp-card__title {
      margin: 0;
      padding: 0.85rem 0;
      border-top: 1px solid var(--ink);
      border-bottom: 1px solid var(--ink);
      color: var(--ink);
      font-size: clamp(1.05rem, 1.35vw, 1.28rem);
      font-weight: 700;
      letter-spacing: -0.005em;
      line-height: 1.15;
      text-transform: uppercase;
    }

    .wp-card__body {
      margin: 0;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.9rem;
      line-height: 1.7;
      text-wrap: pretty;
    }

    @media (prefers-reduced-motion: reduce) {
      .wp-card {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }

    @media (max-width: 760px) {
      .wp-inner {
        gap: 2rem;
        padding: clamp(3rem, 12vw, 5rem) 0;
      }

      .wp-cards {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .wp-card {
        gap: 1rem;
        transform: translateY(28px);
      }

      .wp-card__panel {
        padding: 1.15rem 0;
      }
    }
  `
})
export class WorkPrinciplesComponent implements AfterViewInit, OnDestroy {
  readonly heading = input.required<string>();
  readonly cards = input.required<Principle[]>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  // Reveal de una sola pasada: apenas la sección asoma en pantalla, se agrega
  // `.is-in` al host y las cards entran escalonadas (transition-delay por índice).
  // Sin scroll-jacking: la página fluye normal.
  ngAfterViewInit(): void {
    const host = this.hostRef.nativeElement as HTMLElement;
    const reducedMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      host.classList.add('is-in');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            host.classList.add('is-in');
            this.observer?.disconnect();
            this.observer = null;
            break;
          }
        }
      },
      { threshold: 0.2 }
    );
    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
