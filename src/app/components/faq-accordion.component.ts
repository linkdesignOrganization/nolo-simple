import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  input,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LucidePlus } from '@lucide/angular';

export type FaqItem = {
  answer: string;
  question: string;
};

@Component({
  selector: 'app-faq-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucidePlus],
  host: {
    'class': 'faq-accordion'
  },
  template: `
    <div class="faq-inner">
      <h2 class="faq-title">{{ heading() }}</h2>

      <div class="faq-list">
        @for (item of items(); track item.question; let i = $index) {
          <div class="faq-item" [class.is-open]="isOpen(i)" [style.transitionDelay]="i * 60 + 'ms'">
            <button
              type="button"
              class="faq-q"
              [id]="'faq-q-' + i"
              [attr.aria-expanded]="isOpen(i)"
              [attr.aria-controls]="'faq-a-' + i"
              (click)="toggle(i)"
            >
              <span class="faq-q__index" aria-hidden="true">{{ pad(i) }}</span>
              <span class="faq-q__text">{{ item.question }}</span>
              <svg class="faq-q__icon" lucidePlus [size]="30" [strokeWidth]="1" aria-hidden="true"></svg>
            </button>

            <div class="faq-a" [id]="'faq-a-' + i" role="region" [attr.aria-labelledby]="'faq-q-' + i">
              <div class="faq-a__inner">
                <p class="faq-a__text">{{ item.answer }}</p>
              </div>
            </div>
          </div>
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

    /* Fondo gris full-bleed: la sección está fuera de la zona oscura, así que toma --surface
       (gris) y tapa la grilla técnica en los márgenes. Última sección → llega hasta el footer. */
    :host::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: -6rem;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: var(--surface);
      transition: background-color 450ms ease;
    }

    .faq-inner {
      display: flex;
      flex-direction: column;
      gap: clamp(2.5rem, 6vw, 5rem);
      padding: var(--section-py) 0;
    }

    .faq-title {
      margin: 0;
      color: var(--ink);
      font-size: clamp(2.2rem, 6vw, 4.5rem);
      font-weight: 400;
      letter-spacing: -0.055em;
      line-height: 1;
    }

    .faq-list {
      /* Línea de cierre al pie de la lista; las líneas entre preguntas son el border-top
         de cada item (incluida la primera, que cierra contra el título). */
      border-bottom: 1px solid var(--line);
    }

    .faq-item {
      border-top: 1px solid var(--line);
      /* Estado inicial del reveal al asomar la sección (.is-in en el host). El transition-delay
         inline (por índice) afecta solo opacity/transform de este item; la animación de
         apertura vive en .faq-a / .faq-q__icon (hijos), así que no se pisan. */
      opacity: 0;
      transform: translateY(24px);
      transition:
        opacity 600ms ease,
        transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform, opacity;
    }

    :host(.is-in) .faq-item {
      opacity: 1;
      transform: none;
    }

    .faq-q {
      display: grid;
      grid-template-columns: 2.4rem 1fr auto;
      align-items: center;
      gap: 1rem;
      width: 100%;
      padding: 1.35rem 0;
      border: 0;
      background: none;
      color: var(--ink);
      font: inherit;
      text-align: left;
      cursor: pointer;
      appearance: none;
    }

    .faq-q__index {
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.02em;
    }

    .faq-q__text {
      font-size: clamp(1.05rem, 1.6vw, 1.35rem);
      font-weight: 500;
      letter-spacing: -0.01em;
      line-height: 1.25;
      text-wrap: pretty;
    }

    .faq-q__icon {
      flex-shrink: 0;
      color: var(--accent);
      transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* El + gira 45° y se vuelve una × al abrir. */
    .faq-item.is-open .faq-q__icon {
      transform: rotate(45deg);
    }

    .faq-q:hover .faq-q__icon {
      color: var(--accent);
    }

    .faq-q:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
    }

    /* Acordeón animable sin alto fijo: grid-template-rows 0fr → 1fr anima el alto real
       del contenido; el inner con overflow:hidden lo recorta mientras está cerrado. */
    .faq-a {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 320ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .faq-item.is-open .faq-a {
      grid-template-rows: 1fr;
    }

    .faq-a__inner {
      min-height: 0;
      overflow: hidden;
    }

    .faq-a__text {
      margin: 0;
      /* Alineado con el texto de la pregunta (ancho del índice + gap). */
      padding: 0.1rem 0 1.7rem calc(2.4rem + 1rem);
      max-width: 70ch;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.9rem;
      line-height: 1.7;
      text-wrap: pretty;
    }

    /* Tema oscuro de página (cuando el FAQ vive dentro de una zona oscura): texto e hilos
       claros. El + se queda en --accent (se ve bien sobre negro). */
    :host-context(.app-dark) .faq-title,
    :host-context(.app-dark) .faq-q,
    :host-context(.app-dark) .faq-q__index,
    :host-context(.app-dark) .faq-a__text {
      color: #f4f4f4;
    }

    :host-context(.app-dark) .faq-list {
      border-bottom-color: rgba(255, 255, 255, 0.16);
    }

    :host-context(.app-dark) .faq-item {
      border-top-color: rgba(255, 255, 255, 0.16);
    }

    @media (prefers-reduced-motion: reduce) {
      .faq-item {
        opacity: 1;
        transform: none;
        transition: none;
      }

      .faq-a,
      .faq-q__icon {
        transition: none;
      }
    }

    @media (max-width: 760px) {
      .faq-inner {
        gap: 2rem;
        padding: clamp(3rem, 12vw, 5rem) 0;
      }

      .faq-q {
        grid-template-columns: 2rem 1fr auto;
        gap: 0.85rem;
        padding: 1.15rem 0;
      }

      .faq-q__text {
        font-size: 1.05rem;
      }

      .faq-a__text {
        padding-left: calc(2rem + 0.85rem);
      }
    }
  `
})
export class FaqAccordionComponent implements AfterViewInit, OnDestroy {
  readonly heading = input.required<string>();
  readonly items = input.required<FaqItem[]>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  // Multi-open: cada pregunta abre/cierra independiente. Guardamos el set de índices abiertos
  // y en cada toggle creamos un Set nuevo (referencia distinta) para que OnPush refresque.
  private readonly openIndices = signal<ReadonlySet<number>>(new Set());

  isOpen(index: number): boolean {
    return this.openIndices().has(index);
  }

  toggle(index: number): void {
    const next = new Set(this.openIndices());
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    this.openIndices.set(next);
  }

  pad(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  // Reveal de una sola pasada, idéntico al resto de las secciones.
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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
