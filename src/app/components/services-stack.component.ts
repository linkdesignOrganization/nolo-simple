import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  input
} from '@angular/core';

export type ServiceItem = {
  body: string;
  chips: string[];
  title: string;
};

@Component({
  selector: 'app-services-stack',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'services-stack'
  },
  template: `
    <div class="services-stack__intro">
      <h2>{{ heading() }}</h2>
      <p>{{ intro() }}</p>
    </div>

    <div class="services-stack__list">
      @for (item of items(); track item.title; let i = $index) {
        <header class="ss-item__head" [style.--i]="i">
          <span class="ss-item__num">{{ pad(i) }}</span>
          <h3 class="ss-item__title">{{ item.title }}</h3>
        </header>
        <div class="ss-item__body">
          <p class="ss-item__txt">{{ item.body }}</p>
          @if (item.chips.length) {
            <ul class="ss-item__chips">
              @for (chip of item.chips; track chip) {
                <li>{{ chip }}</li>
              }
            </ul>
          }
        </div>
      }
      <div class="ss-spacer" aria-hidden="true"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
      padding: var(--section-py) 0;
    }

    /* Fondo sólido full-bleed: tapa la grilla técnica también en los márgenes. */
    :host::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: var(--surface);
    }

    .services-stack__intro {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1.5rem;
      align-items: start;
      margin-bottom: clamp(2.5rem, 6vw, 5rem);
    }

    .services-stack__intro h2 {
      grid-column: span 7;
      margin: 0;
      color: var(--ink);
      font-size: clamp(2.1rem, 5vw, 4rem);
      font-weight: 400;
      letter-spacing: -0.055em;
      line-height: 1;
      text-wrap: balance;
    }

    .services-stack__intro p {
      grid-column: 9 / span 4;
      margin: 0;
      color: var(--ink);
      font-size: 1.02rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* El header es sticky y se apila; el body scrollea por detrás (z menor)
       y desaparece bajo las franjas ya apiladas. */
    .ss-item__head {
      position: sticky;
      top: 0;
      z-index: 2;
      display: grid;
      grid-template-columns: 2.4rem minmax(0, 1fr);
      align-items: baseline;
      gap: 1rem;
      padding: 1.15rem 0;
    }

    .ss-item__head::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: hsl(0 0% calc(97% - var(--i, 0) * 2.6%));
    }

    .ss-item__num {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.02em;
      line-height: 1;
    }

    .ss-item__title {
      margin: 0;
      color: var(--ink);
      font-size: clamp(1.5rem, 3.2vw, 2.7rem);
      font-weight: 400;
      letter-spacing: -0.04em;
      line-height: 1.04;
      text-wrap: balance;
    }

    .ss-item__body {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 2.4rem minmax(0, 1fr);
      gap: 1rem;
      padding: 1.6rem 0 3.2rem;
    }

    .ss-item__txt {
      grid-column: 2;
      max-width: 64ch;
      margin: 0;
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    .ss-item__chips {
      grid-column: 2;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.4rem 0 0;
      padding: 0;
      list-style: none;
    }

    .ss-item__chips li {
      padding: 0.42rem 0.6rem;
      border-radius: 0.4rem;
      background: rgba(61, 81, 255, 0.1);
      color: var(--accent);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      line-height: 1;
      text-transform: uppercase;
    }

    @media (max-width: 760px) {
      .services-stack__intro {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .services-stack__intro h2,
      .services-stack__intro p {
        grid-column: auto;
      }

      .ss-item__head {
        grid-template-columns: 2rem minmax(0, 1fr);
        gap: 0.75rem;
        padding: 0.9rem 0;
      }

      .ss-item__body {
        grid-template-columns: 1fr;
        gap: 0;
        padding: 1.2rem 0 2.4rem;
      }

      .ss-item__txt,
      .ss-item__chips {
        grid-column: auto;
      }
    }
  `
})
export class ServicesStackComponent implements AfterViewInit, OnDestroy {
  readonly heading = input.required<string>();
  readonly intro = input.required<string>();
  readonly items = input.required<ServiceItem[]>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private resizeObserver: ResizeObserver | null = null;
  private lastWidth = 0;

  // Índice con cero a la izquierda (01, 02, …), mismo formato que el FAQ.
  pad(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.lastWidth = this.hostRef.nativeElement.getBoundingClientRect().width;
      this.layoutStack();

      if (typeof ResizeObserver !== 'undefined') {
        // Recalcular solo cuando cambia el ancho. layoutStack ajusta la altura
        // del spacer, y reaccionar a ese cambio dispararía un loop de
        // ResizeObserver (con su warning en consola).
        this.resizeObserver = new ResizeObserver((entries) => {
          const width = entries[0]?.contentRect.width ?? this.lastWidth;
          if (Math.abs(width - this.lastWidth) < 1) {
            return;
          }
          this.lastWidth = width;
          requestAnimationFrame(() => this.layoutStack());
        });
        this.resizeObserver.observe(this.hostRef.nativeElement);
      }
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  // Cada header se pega justo debajo de los anteriores: su top sticky es la
  // suma de las alturas de los headers previos.
  private layoutStack(): void {
    const host = this.hostRef.nativeElement as HTMLElement;
    const heads = host.querySelectorAll<HTMLElement>('.ss-item__head');
    let offset = 0;
    let lastHeadHeight = 0;

    heads.forEach((head: HTMLElement) => {
      head.style.top = `${offset}px`;
      offset += head.offsetHeight;
      lastHeadHeight = head.offsetHeight;
    });

    // El spacer solo necesita una cola corta: una vez apilado el último header y
    // oculto su texto detrás del stack, la sección suelta enseguida. Antes usaba
    // `offset` (la suma de TODOS los headers) y eso dejaba ~1 stack de altura de
    // scroll vacío al final (el "espacio muerto").
    const spacer = host.querySelector<HTMLElement>('.ss-spacer');
    if (spacer) {
      spacer.style.height = `${lastHeadHeight}px`;
    }
  }
}
