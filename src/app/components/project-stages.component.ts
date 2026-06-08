import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input
} from '@angular/core';

export type ProjectStage = {
  order: string;
  name: string;
  duration: string;
  description: string;
};

@Component({
  selector: 'app-project-stages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'project-stages',
    '[class.ps--light]': 'light()'
  },
  template: `
    <div class="ps-head">
      <h2 class="ps-title">{{ title() }}</h2>
      <p class="ps-intro">{{ intro() }}</p>
    </div>

    <ol class="ps-stages">
      @for (s of stages(); track s.order; let i = $index) {
        <li class="ps-stage" [style.transitionDelay]="i * 250 + 'ms'">
          <span class="ps-stage__num">{{ s.order }}</span>
          <div class="ps-stage__meta">
            <h3 class="ps-stage__name">{{ s.name }}</h3>
            <span class="ps-stage__duration">{{ s.duration }}</span>
          </div>
          <p class="ps-stage__desc">{{ s.description }}</p>
        </li>
      }
    </ol>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
      padding: var(--section-py) 0;
      /* Paleta del tema oscuro por defecto (en /software, dentro de appDarkZone). */
      --ps-ink: #f4f4f4;
      --ps-muted: #b8b8b8;
      --ps-faint: #8a8a8a;
      --ps-line: rgba(255, 255, 255, 0.22);
    }

    /* Variante clara (p. ej. /web): texto e hilos con la paleta del sitio claro. */
    :host(.ps--light) {
      --ps-ink: var(--ink);
      --ps-muted: var(--muted);
      --ps-faint: var(--muted);
      --ps-line: var(--line-strong);
    }

    /* Fondo full-bleed que toma el color del sitio (negro por el tema oscuro que mantiene
       la sección showcase de arriba). Baja de más para llegar al fondo de la página. Opaco
       a propósito: tapa la grilla técnica del .shell que va detrás de todo. */
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

    .ps-head {
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
      margin-bottom: clamp(3rem, 6vw, 5.5rem);
    }

    .ps-title {
      margin: 0;
      max-width: 18ch;
      color: var(--ps-ink);
      font-size: clamp(2.2rem, 5vw, 4.2rem);
      font-weight: 400;
      letter-spacing: -0.05em;
      line-height: 1;
      text-wrap: balance;
    }

    .ps-intro {
      margin: 0;
      max-width: 52ch;
      color: var(--ps-muted);
      font-family: var(--font-mono);
      font-size: 0.95rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* Desktop: los 4 bloques en fila. */
    .ps-stages {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: clamp(1.25rem, 2.6vw, 2.75rem);
    }

    .ps-stage {
      display: flex;
      flex-direction: column;
      padding-top: 1.15rem;
      border-top: 1px solid var(--ps-line);
      /* Reveal: solo desplazamiento hacia arriba, más marcado y SIN fade de opacidad (.is-in lo dispara). */
      transform: translateY(64px);
      transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform;
    }

    :host(.is-in) .ps-stage {
      transform: none;
    }

    /* El número es el elemento más prominente del bloque. */
    .ps-stage__num {
      color: var(--ps-ink);
      font-size: clamp(2.8rem, 4.5vw, 4.5rem);
      font-weight: 500;
      letter-spacing: -0.05em;
      line-height: 1;
    }

    /* Desktop: la duración va al lado del nombre, compartiendo línea base. */
    .ps-stage__meta {
      margin-top: 0.85rem;
      display: flex;
      align-items: baseline;
      gap: 0.7rem;
      flex-wrap: wrap;
    }

    .ps-stage__name {
      margin: 0;
      color: var(--ps-ink);
      font-size: clamp(1.05rem, 1.4vw, 1.22rem);
      font-weight: 500;
      letter-spacing: -0.01em;
      line-height: 1.15;
    }

    .ps-stage__duration {
      margin: 0;
      color: var(--ps-faint);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      letter-spacing: 0.01em;
    }

    .ps-stage__desc {
      margin: 0.95rem 0 0;
      color: var(--ps-muted);
      font-size: 0.95rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    @media (prefers-reduced-motion: reduce) {
      .ps-stage {
        transform: none;
        transition: none;
      }
    }

    /* Mobile: apilados en una columna, con aire generoso. */
    @media (max-width: 760px) {
      /* En la variante oscura el cuerpo gris cuesta leerlo en celular → casi-blanco. */
      :host(:not(.ps--light)) {
        --ps-muted: #f4f4f4;
      }

      .ps-stages {
        grid-template-columns: 1fr;
        gap: clamp(2.5rem, 9vw, 3.5rem);
      }

      /* Mobile: vuelve a apilarse (nombre arriba, duración debajo). */
      .ps-stage__meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.45rem;
      }

      .ps-stage__name {
        font-size: 1.2rem;
      }

      .ps-stage__desc {
        font-size: 1rem;
      }
    }
  `
})
export class ProjectStagesComponent implements AfterViewInit, OnDestroy {
  readonly title = input.required<string>();
  readonly intro = input.required<string>();
  readonly stages = input.required<ProjectStage[]>();
  readonly light = input(false);

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  // Reveal de una sola pasada: al asomar la sección, las 4 etapas entran escalonadas
  // (01→04) vía el transition-delay por índice. No administra el tema oscuro: lo mantiene
  // la sección showcase de arriba.
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
