import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  input,
  signal
} from '@angular/core';
import {
  LucideCheck,
  LucideChevronsRight,
  LucideMonitorCog,
  LucideMonitorDot,
  LucideMonitorStop,
  LucideShoppingCart
} from '@lucide/angular';

export type DevTypeIcon = 'monitor-stop' | 'monitor-dot' | 'shopping-cart' | 'monitor-cog';

export type DevTypeBlock = {
  icon: DevTypeIcon;
  tab: string;
  title: string;
  description: string;
  highlights: string[];
  cases: string[];
};

@Component({
  selector: 'app-dev-types',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideCheck,
    LucideChevronsRight,
    LucideMonitorStop,
    LucideMonitorDot,
    LucideShoppingCart,
    LucideMonitorCog
  ],
  host: {
    'class': 'dev-types'
  },
  template: `
    <div class="dt-frame">
      <div class="dt-grid">
        <aside class="dt-tabs" role="tablist" aria-label="Tipos de desarrollo">
          @for (block of blocks(); track block.tab; let i = $index) {
            <button
              type="button"
              class="dt-tab"
              role="tab"
              [class.is-active]="activeIndex() === i"
              [attr.aria-selected]="activeIndex() === i"
              (click)="select(i)"
            >
              <span class="dt-tab__icon" aria-hidden="true">
                @switch (block.icon) {
                  @case ('monitor-stop') {
                    <svg lucideMonitorStop [size]="20" [strokeWidth]="1.25"></svg>
                  }
                  @case ('monitor-dot') {
                    <svg lucideMonitorDot [size]="20" [strokeWidth]="1.25"></svg>
                  }
                  @case ('shopping-cart') {
                    <svg lucideShoppingCart [size]="20" [strokeWidth]="1.25"></svg>
                  }
                  @case ('monitor-cog') {
                    <svg lucideMonitorCog [size]="20" [strokeWidth]="1.25"></svg>
                  }
                }
              </span>
              <span class="dt-tab__label">{{ block.tab }}</span>
            </button>
          }

          <span class="dt-swipe" aria-hidden="true">
            <svg lucideChevronsRight [size]="18" [strokeWidth]="1"></svg>
          </span>
        </aside>

        <div class="dt-panels">
          @for (block of blocks(); track block.title; let i = $index) {
            <article class="dt-panel" role="tabpanel" [attr.aria-label]="block.tab">
              <h3 class="dt-panel__title">{{ block.title }}</h3>
              <p class="dt-panel__desc">{{ block.description }}</p>

              <ul class="dt-highlights">
                @for (h of block.highlights; track h) {
                  <li>
                    <svg
                      class="dt-highlights__icon"
                      lucideCheck
                      [size]="17"
                      [strokeWidth]="1.5"
                      aria-hidden="true"
                    ></svg>
                    <span>{{ h }}</span>
                  </li>
                }
              </ul>

              <div class="dt-cases">
                @for (c of block.cases; track c) {
                  <p class="dt-cases__item">{{ c }}</p>
                }
              </div>
            </article>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
      padding: var(--section-py) 0;
      color: #f4f4f4;
      --dt-offset: 6rem;
      --dt-line: rgba(255, 255, 255, 0.16);
      --dt-line-strong: rgba(255, 255, 255, 0.28);
      --dt-muted: rgba(255, 255, 255, 0.6);
      --dt-faint: rgba(255, 255, 255, 0.45);
    }

    /* Fondo full-bleed que toma el color del sitio; se oscurece junto con la página (misma
       transición que la sección anterior) cuando la dark-zone activa el tema. */
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

    /* Recuadro que contiene todo el componente. */
    .dt-frame {
      border: 1px solid var(--dt-line);
      border-radius: 1.25rem;
      padding: clamp(1.25rem, 2.4vw, 2.25rem);
      /* Reveal: el contenido claro aparece sólo cuando la página ya está oscura. */
      opacity: 0;
      transition: opacity 450ms ease;
    }

    :host-context(.app-dark) .dt-frame {
      opacity: 1;
    }

    .dt-grid {
      display: grid;
      grid-template-columns: minmax(12rem, 17rem) minmax(0, 1fr);
      gap: clamp(1.5rem, 3.5vw, 3rem);
      align-items: start; /* condición para que los tabs sticky tengan recorrido */
    }

    /* Tabs sticky: quedan fijos mientras el contenido scrollea. */
    .dt-tabs {
      position: sticky;
      top: var(--dt-offset);
      align-self: start;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .dt-tab {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      width: 100%;
      padding: 0.85rem 0.9rem;
      border: 0;
      border-radius: 0.7rem;
      background: transparent;
      color: var(--dt-muted);
      font: inherit;
      text-align: left;
      cursor: pointer;
      appearance: none;
      transition:
        background-color 200ms ease,
        color 200ms ease;
    }

    .dt-tab__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: currentColor;
    }

    .dt-tab__icon svg {
      display: block;
    }

    .dt-tab__label {
      font-size: clamp(1.02rem, 1.4vw, 1.25rem);
      font-weight: 500;
      letter-spacing: -0.02em;
      line-height: 1.15;
    }

    /* Activo: fondo negro más claro (sin línea de color). */
    .dt-tab.is-active {
      background: rgba(255, 255, 255, 0.07);
      color: #f4f4f4;
    }

    .dt-tab:hover:not(.is-active) {
      color: #d4d4d4;
    }

    .dt-tab:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .dt-panels {
      display: flex;
      flex-direction: column;
    }

    /* Cards pegadas verticalmente: bordes compartidos, radio solo arriba (1ª) y abajo (última),
       igual que el panel continuo del componente horizontal. */
    .dt-panel {
      scroll-margin-top: var(--dt-offset);
      padding: clamp(1.6rem, 2.6vw, 2.4rem);
      border: 1px solid var(--dt-line-strong);
      border-radius: 0.9rem;
    }

    .dt-panel + .dt-panel {
      border-top: 0;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    .dt-panel:not(:last-child) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    .dt-panel__title {
      margin: 0;
      max-width: 18ch;
      color: #f4f4f4;
      font-size: clamp(1.7rem, 2.8vw, 2.6rem);
      font-weight: 500;
      letter-spacing: -0.04em;
      line-height: 1.05;
      text-wrap: balance;
    }

    .dt-panel__desc {
      margin: 1rem 0 0;
      max-width: 60ch;
      color: var(--dt-muted);
      font-size: clamp(1rem, 1.2vw, 1.12rem);
      line-height: 1.55;
      text-wrap: pretty;
    }

    /* Aspectos destacados (sin título): check fino + texto, divisores. */
    .dt-highlights {
      list-style: none;
      margin: clamp(1.5rem, 2.6vw, 2.25rem) 0 0;
      padding: 0;
    }

    .dt-highlights li {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      padding: 0.7rem 0;
      border-top: 1px solid var(--dt-line);
      color: #ededed;
      font-size: clamp(0.96rem, 1.15vw, 1.06rem);
      line-height: 1.4;
    }

    .dt-highlights li:last-child {
      border-bottom: 1px solid var(--dt-line);
    }

    .dt-highlights__icon {
      flex-shrink: 0;
      transform: translateY(0.18em);
      color: var(--dt-faint);
    }

    /* Casos típicos (sin título): box de fondo sólido, sin barra de color. */
    .dt-cases {
      margin-top: clamp(1.25rem, 2vw, 1.75rem);
      padding: clamp(1.1rem, 2vw, 1.5rem);
      border-radius: 0.7rem;
      background: rgba(255, 255, 255, 0.045);
    }

    .dt-cases__item {
      margin: 0;
      max-width: 60ch;
      color: var(--dt-muted);
      font-size: clamp(0.96rem, 1.15vw, 1.06rem);
      line-height: 1.5;
      text-wrap: pretty;
    }

    .dt-cases__item + .dt-cases__item {
      margin-top: 0.85rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--dt-line);
    }

    /* Hint de swipe de los tabs: oculto en desktop, se muestra y anima en el @media de abajo. */
    .dt-swipe {
      display: none;
    }

    @keyframes dt-swipe-hint {
      0%,
      100% {
        transform: translateX(0);
        opacity: 0.55;
      }
      50% {
        transform: translateX(5px);
        opacity: 1;
      }
    }

    @media (max-width: 860px) {
      .dt-grid {
        grid-template-columns: 1fr;
        gap: clamp(1.5rem, 6vw, 2rem);
        --dt-offset: 4.5rem;
      }

      /* Tabs en fila horizontal sticky arriba; deslizables si no entran. */
      .dt-tabs {
        flex-direction: row;
        gap: 0.5rem;
        top: 0;
        margin: calc(-1 * clamp(1.25rem, 2.4vw, 2.25rem)) calc(-1 * clamp(1.25rem, 2.4vw, 2.25rem)) 0;
        padding: 0.85rem clamp(1.25rem, 2.4vw, 2.25rem);
        overflow-x: auto;
        scrollbar-width: none;
        background: var(--surface);
        transition: background-color 450ms ease;
      }

      .dt-tabs::-webkit-scrollbar {
        display: none;
      }

      .dt-tab {
        width: auto;
        white-space: nowrap;
        padding: 0.5rem 0.7rem;
      }

      /* Doble flecha anclada al borde derecho del scroller de tabs: indica que se deslizan. */
      .dt-swipe {
        position: sticky;
        right: 0;
        z-index: 1;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        align-self: stretch;
        margin-left: -0.4rem;
        padding-left: 1.1rem;
        color: var(--dt-faint);
        background: linear-gradient(to right, transparent, var(--surface) 45%);
        pointer-events: none;
      }

      .dt-swipe svg {
        display: block;
        animation: dt-swipe-hint 1.5s ease-in-out infinite;
      }
    }

    /* Mobile: el cuerpo gris de los paneles → casi-blanco para legibilidad (desktop tiene texto mayor). */
    @media (max-width: 760px) {
      .dt-panel__desc,
      .dt-cases__item {
        color: #f4f4f4;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .dt-frame,
      .dt-tab {
        transition: none;
      }

      .dt-swipe svg {
        animation: none;
      }
    }
  `
})
export class DevTypesComponent implements AfterViewInit, OnDestroy {
  readonly blocks = input.required<DevTypeBlock[]>();

  protected readonly activeIndex = signal(0);

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);

  private static readonly MOBILE_MAX = 860;
  private static readonly LOCK_FALLBACK_MS = 3000;

  private panelEls: HTMLElement[] = [];
  private panelTops: number[] = [];
  private docBottom = 0;
  private rafId: number | null = null;
  private lockUntil = 0;
  private reducedMotion = false;

  private readonly onScroll = (): void => this.requestUpdate();
  private readonly onResize = (): void => {
    this.measure();
    this.requestUpdate();
  };

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const host = this.hostRef.nativeElement as HTMLElement;
      this.panelEls = Array.from(host.querySelectorAll<HTMLElement>('.dt-panel'));
      this.reducedMotion =
        typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

      const win = this.document.defaultView;
      win?.addEventListener('scroll', this.onScroll, { passive: true });
      win?.addEventListener('resize', this.onResize, { passive: true });

      this.measure();
      this.updateSpy();

      this.document.fonts?.ready?.then(() => {
        this.measure();
        this.requestUpdate();
      });
    });
  }

  ngOnDestroy(): void {
    const win = this.document.defaultView;
    win?.removeEventListener('scroll', this.onScroll);
    win?.removeEventListener('resize', this.onResize);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // Click en un tab: marca activo de inmediato y desplaza (suave) al bloque. El lock evita que el
  // scroll-spy parpadee por los tabs intermedios mientras dura la animación.
  protected select(index: number): void {
    // Refrescar posiciones por si el layout de arriba cambió de altura (videos del hero/portafolio al cargar).
    this.measure();
    this.activeIndex.set(index);
    const panel = this.panelEls[index];
    if (!panel) {
      return;
    }
    // Bloquear el scroll-spy hasta que el scroll suave TERMINE. Un tiempo fijo (700 ms) se quedaba
    // corto en scrolls largos: el lock expiraba a media animación y el spy "rebotaba" a un panel
    // intermedio, dejando el tab clickeado como si no respondiera. 'scrollend' libera al terminar;
    // el timeout es respaldo (y cubre el caso sin scroll, donde 'scrollend' no dispara).
    this.lockUntil = this.now() + DevTypesComponent.LOCK_FALLBACK_MS;
    const win = this.document.defaultView;
    win?.addEventListener('scrollend', () => (this.lockUntil = 0), { once: true });
    panel.scrollIntoView({
      behavior: this.reducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  private now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  // Cachea los tops absolutos de los bloques (reflow solo en setup/resize, nunca por frame).
  private measure(): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }
    // Re-leer los paneles del DOM (no un cache de ngAfterViewInit): el contenido de arriba (hero/
    // portafolio con videos) cambia de altura al cargar y desactualizaría las posiciones.
    this.panelEls = Array.from(
      (this.hostRef.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.dt-panel')
    );
    const scrollY = win.scrollY;
    this.panelTops = this.panelEls.map((el) => el.getBoundingClientRect().top + scrollY);
    this.docBottom = this.document.documentElement.scrollHeight;
  }

  private requestUpdate(): void {
    if (this.rafId !== null) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateSpy();
    });
  }

  // Scroll → tab: activa el último bloque cuyo top cruzó la línea de lectura; el último se asegura
  // al llegar al fondo. Sólo escribe el signal (en zona) cuando el índice cambia → respeta OnPush.
  private updateSpy(): void {
    const win = this.document.defaultView;
    if (!win || this.now() < this.lockUntil || !this.panelTops.length) {
      return;
    }
    const vh = win.innerHeight;
    const mobile = win.innerWidth <= DevTypesComponent.MOBILE_MAX;
    const lineAbs = win.scrollY + vh * (mobile ? 0.42 : 0.35);

    let next = 0;
    for (let i = 0; i < this.panelTops.length; i += 1) {
      if (this.panelTops[i] <= lineAbs) {
        next = i;
      } else {
        break;
      }
    }

    if (win.scrollY + vh >= this.docBottom - 2) {
      next = this.panelTops.length - 1;
    }

    if (next !== this.activeIndex()) {
      this.zone.run(() => this.activeIndex.set(next));
    }
  }
}
