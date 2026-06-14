import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  inject,
  input
} from '@angular/core';
import {
  LucideAudioLines,
  LucideCodeXml,
  LucideFingerprint,
  LucideGauge,
  LucideLayoutGrid,
  LucideListTree,
  LucideSmartphone
} from '@lucide/angular';

export type CapabilityIcon =
  | 'smartphone'
  | 'code'
  | 'gauge'
  | 'fingerprint'
  | 'hierarchy'
  | 'rhythm'
  | 'structure';

export type CapabilityPayload =
  | { kind: 'logos'; logos: { src: string; label: string }[] }
  | { kind: 'rows'; rows: { icon: CapabilityIcon; label: string }[] };

export type CapabilityCard = {
  index: string;
  title: string;
  body: string;
  payload: CapabilityPayload;
};

@Component({
  selector: 'app-web-capabilities',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideSmartphone,
    LucideCodeXml,
    LucideGauge,
    LucideFingerprint,
    LucideListTree,
    LucideAudioLines,
    LucideLayoutGrid
  ],
  host: {
    'class': 'web-capabilities'
  },
  template: `
    <div class="wc-head">
      <h2 class="wc-head__title">{{ heading() }}</h2>
    </div>

    <!-- .wc-tall crea el rango de scroll vertical que el pin "consume" como horizontal.
         Su altura la fija el JS (vh + nº cards * VH_PER_CARD * vh). -->
    <div class="wc-tall">
      <div class="wc-pin">
        <div class="wc-track">
          @for (card of cards(); track card.index; let i = $index) {
            <article class="wc-card">
              <span class="wc-card__index wc-anim">{{ card.index }}</span>

              <div class="wc-card__main wc-anim">
                <h3 class="wc-card__title">{{ card.title }}</h3>
                <p class="wc-card__body">{{ card.body }}</p>
              </div>

              <div class="wc-card__rows wc-anim">
                @switch (card.payload.kind) {
                  @case ('logos') {
                    @for (logo of card.payload.logos; track logo.src) {
                      <div class="wc-row wc-row--logo">
                        <img class="wc-row__logo" [src]="logo.src" alt="" aria-hidden="true" />
                        <span class="wc-row__tag">{{ logo.label }}</span>
                      </div>
                    }
                  }
                  @case ('rows') {
                    @for (row of card.payload.rows; track row.label) {
                      <div class="wc-row wc-row--icon">
                        <span class="wc-row__icon" aria-hidden="true">
                          @switch (row.icon) {
                            @case ('smartphone') {
                              <svg lucideSmartphone [size]="20" [strokeWidth]="1"></svg>
                            }
                            @case ('code') {
                              <svg lucideCodeXml [size]="20" [strokeWidth]="1"></svg>
                            }
                            @case ('gauge') {
                              <svg lucideGauge [size]="20" [strokeWidth]="1"></svg>
                            }
                            @case ('fingerprint') {
                              <svg lucideFingerprint [size]="20" [strokeWidth]="1"></svg>
                            }
                            @case ('hierarchy') {
                              <svg lucideListTree [size]="20" [strokeWidth]="1"></svg>
                            }
                            @case ('rhythm') {
                              <svg lucideAudioLines [size]="20" [strokeWidth]="1"></svg>
                            }
                            @case ('structure') {
                              <svg lucideLayoutGrid [size]="20" [strokeWidth]="1"></svg>
                            }
                          }
                        </span>
                        <span class="wc-row__label">{{ row.label }}</span>
                      </div>
                    }
                  }
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
      color: var(--ink);
      --wc-line: rgba(17, 17, 17, 0.22);
      --wc-ink: var(--ink);
      --wc-muted: var(--muted);
      --wc-faint: rgba(17, 17, 17, 0.45);
    }

    /* Fondo full-bleed. La transición acompaña al resto de la página cuando la sección oscura de
       abajo activa la dark-zone, así no queda una línea divisoria entre ambas al cambiar de color. */
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

    .wc-head {
      padding: var(--section-py) clamp(1rem, 3vw, 2.5rem) clamp(2.5rem, 5vw, 4rem);
    }

    .wc-head__title {
      margin: 0;
      max-width: 24ch;
      color: var(--wc-ink);
      font-size: clamp(2.1rem, 5vw, 4rem);
      font-weight: 400;
      letter-spacing: -0.055em;
      line-height: 1;
      text-wrap: balance;
    }

    .wc-tall {
      position: relative;
      overflow-anchor: none;
      height: 360vh;
    }

    .wc-pin {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100vw;
      margin-inline: calc(50% - 50vw);
      overflow: hidden;
      display: flex;
      align-items: center;
      /* Franja delgada de fade en los bordes: las cards se desvanecen al entrar/salir
         por los lados en vez de cortarse en seco. */
      --wc-fade: clamp(1.5rem, 4vw, 4rem);
      -webkit-mask-image: linear-gradient(
        to right,
        transparent 0,
        #000 var(--wc-fade),
        #000 calc(100% - var(--wc-fade)),
        transparent 100%
      );
      mask-image: linear-gradient(
        to right,
        transparent 0,
        #000 var(--wc-fade),
        #000 calc(100% - var(--wc-fade)),
        transparent 100%
      );
    }

    .wc-track {
      display: flex;
      align-items: stretch;
      padding-inline: 14vw;
      will-change: transform;
    }

    .wc-card {
      flex: 0 0 auto;
      width: clamp(20rem, 72vw, 58rem);
      height: min(76vh, 600px);
      display: flex;
      flex-direction: column;
      /* Ritmo uniforme entre índice · bloque de texto · filas (el espacio sobrante queda al fondo). */
      gap: clamp(1.5rem, 2.5vw, 2rem);
      padding: clamp(1.75rem, 3vw, 2.75rem);
      border: 1px solid var(--line-strong);
      border-radius: 0.85rem;
    }

    /* Las 3 cards leen como un solo bloque continuo: bordes compartidos, radio sólo en extremos. */
    .wc-card + .wc-card {
      border-left: 0;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    .wc-card:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    /* Índice: mismo formato que el resto del sitio (services-stack / FAQ): mono, discreto, sin "/". */
    .wc-card__index {
      color: var(--wc-faint);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .wc-card__main {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .wc-card__title {
      margin: 0;
      max-width: 18ch;
      color: var(--wc-ink);
      font-size: clamp(1.5rem, 2.1vw, 2.1rem);
      font-weight: 500;
      letter-spacing: -0.04em;
      line-height: 1.06;
      text-wrap: balance;
    }

    .wc-card__body {
      margin: 0;
      max-width: 44ch;
      color: var(--wc-muted);
      font-size: 1rem;
      line-height: 1.5;
      text-wrap: pretty;
    }

    .wc-row {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: clamp(0.6rem, 1vw, 0.8rem) 0;
      border-top: 1px solid var(--wc-line);
    }

    .wc-card__rows .wc-row:last-child {
      border-bottom: 1px solid var(--wc-line);
    }

    /* Card 1: logo a la izquierda, función (mono) a la derecha. */
    .wc-row--logo {
      justify-content: space-between;
    }

    .wc-row__logo {
      height: clamp(16px, 1.5vw, 20px);
      width: auto;
      /* Uniformados a una silueta gris oscura para no romper la paleta de pocos colores. */
      filter: brightness(0);
      opacity: 0.72;
    }

    .wc-row__tag {
      flex-shrink: 0;
      color: var(--wc-faint);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* Cards 2 y 3: icono de trazo fino + etiqueta. */
    .wc-row__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: var(--wc-muted);
    }

    .wc-row__icon svg {
      display: block;
    }

    .wc-row__label {
      color: var(--wc-ink);
      font-size: clamp(0.98rem, 1.2vw, 1.12rem);
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    .wc-anim {
      will-change: transform, opacity;
    }

    /* Modo "flat" (mobile o reduced-motion): sin pin ni hijack; cards apiladas y reveal. */
    :host(.wc-flat) .wc-tall {
      height: auto !important;
    }

    :host(.wc-flat) .wc-pin {
      position: static;
      height: auto;
      width: auto;
      margin-inline: 0;
      overflow: visible;
      display: block;
      padding: 0 clamp(1rem, 3vw, 2.5rem) var(--section-py);
      -webkit-mask-image: none;
      mask-image: none;
    }

    :host(.wc-flat) .wc-track {
      flex-direction: column;
      padding-inline: 0;
      gap: clamp(1.25rem, 5vw, 2rem);
      transform: none !important;
      will-change: auto;
    }

    :host(.wc-flat) .wc-card {
      width: auto;
      height: auto;
      border: 1px solid var(--line-strong) !important;
      border-radius: 0.85rem !important;
      opacity: 0;
      transform: translateY(28px);
      transition:
        opacity 600ms ease,
        transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    :host(.wc-flat.is-in) .wc-card {
      opacity: 1;
      transform: none;
    }

    :host(.wc-flat) .wc-anim {
      opacity: 1 !important;
      transform: none !important;
    }

    @media (prefers-reduced-motion: reduce) {
      .wc-card {
        transition: none !important;
      }

      .wc-card,
      .wc-anim {
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `
})
export class WebCapabilitiesComponent implements AfterViewInit, OnDestroy {
  readonly heading = input.required<string>();
  readonly cards = input.required<CapabilityCard[]>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private static readonly MOBILE_MAX = 860;
  // Viewport-heights de scroll por card → controla el ritmo del horizontal (cómodo).
  private static readonly VH_PER_CARD = 1.15;

  private tallEl: HTMLElement | null = null;
  private trackEl: HTMLElement | null = null;
  private cardEls: HTMLElement[] = [];
  private cardAnims: HTMLElement[][] = [];
  private cardLeft: number[] = [];
  private cardW: number[] = [];
  private maxX = 0;
  private rafId: number | null = null;
  private reducedMotion = false;
  private flat = false;
  private scrollBound = false;
  private observer: IntersectionObserver | null = null;

  private readonly onScroll = (): void => this.requestUpdate();
  private readonly onResize = (): void => this.handleResize();

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      const host = this.hostRef.nativeElement as HTMLElement;
      this.tallEl = host.querySelector<HTMLElement>('.wc-tall');
      this.trackEl = host.querySelector<HTMLElement>('.wc-track');
      this.cardEls = Array.from(host.querySelectorAll<HTMLElement>('.wc-card'));
      this.cardAnims = this.cardEls.map((card) =>
        Array.from(card.querySelectorAll<HTMLElement>('.wc-anim'))
      );
      this.reducedMotion =
        typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

      const win = this.document.defaultView;
      win?.addEventListener('resize', this.onResize, { passive: true });

      this.configure();
    });
  }

  ngOnDestroy(): void {
    const win = this.document.defaultView;
    win?.removeEventListener('resize', this.onResize);
    if (this.scrollBound) {
      win?.removeEventListener('scroll', this.onScroll);
      this.scrollBound = false;
    }
    this.observer?.disconnect();
    this.observer = null;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private isMobile(): boolean {
    const win = this.document.defaultView;
    return (win ? win.innerWidth : 1280) <= WebCapabilitiesComponent.MOBILE_MAX;
  }

  // Elige el modo (hijack desktop vs flat mobile/reduced) y arma/desarma lo correspondiente.
  private configure(): void {
    const host = this.hostRef.nativeElement as HTMLElement;
    const win = this.document.defaultView;
    const flat = this.reducedMotion || this.isMobile();
    this.flat = flat;

    if (flat) {
      if (this.scrollBound) {
        win?.removeEventListener('scroll', this.onScroll);
        this.scrollBound = false;
      }
      host.classList.add('wc-flat');
      if (this.tallEl) {
        this.tallEl.style.height = '';
      }
      if (this.trackEl) {
        this.trackEl.style.transform = '';
      }
      this.cardAnims.flat().forEach((el) => {
        el.style.transform = '';
        el.style.opacity = '';
      });

      if (this.reducedMotion) {
        host.classList.add('is-in');
      } else {
        this.setupReveal();
      }
      return;
    }

    // Hijack (desktop).
    host.classList.remove('wc-flat');
    host.classList.remove('is-in');
    this.observer?.disconnect();
    this.observer = null;
    if (!this.scrollBound) {
      win?.addEventListener('scroll', this.onScroll, { passive: true });
      this.scrollBound = true;
    }
    this.measure();
    this.update();
  }

  // Reveal escalonado de una pasada para el modo flat (mobile).
  private setupReveal(): void {
    const host = this.hostRef.nativeElement as HTMLElement;
    if (typeof IntersectionObserver === 'undefined') {
      host.classList.add('is-in');
      return;
    }
    this.observer?.disconnect();
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

  private handleResize(): void {
    const wasFlat = this.flat;
    const nowFlat = this.reducedMotion || this.isMobile();
    if (wasFlat !== nowFlat) {
      this.configure();
      return;
    }
    if (!nowFlat) {
      this.measure();
      this.requestUpdate();
    }
  }

  // Cachea medidas (causa reflow; solo en setup/resize, nunca por frame) y fija la altura
  // de la sección para que el rango de scroll alcance a recorrer todo el track.
  private measure(): void {
    const win = this.document.defaultView;
    if (!win || !this.tallEl || !this.trackEl) {
      return;
    }
    this.cardLeft = this.cardEls.map((card) => card.offsetLeft);
    this.cardW = this.cardEls.map((card) => card.offsetWidth);
    this.maxX = Math.max(0, this.trackEl.scrollWidth - win.innerWidth);
    const vh = win.innerHeight;
    const tallPx = vh + this.cards().length * WebCapabilitiesComponent.VH_PER_CARD * vh;
    this.tallEl.style.height = `${Math.round(tallPx)}px`;
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

  // Progreso 0..1 del pin: 0 al pegarse arriba, 1 justo antes de despegarse.
  private update(): void {
    const win = this.document.defaultView;
    if (!win || this.flat || !this.tallEl) {
      return;
    }
    const rect = this.tallEl.getBoundingClientRect();
    const pinnable = rect.height - win.innerHeight;
    const p = pinnable > 0 ? clamp(-rect.top / pinnable, 0, 1) : 0;
    this.apply(p);
  }

  // Sólo escribe estilos (cero reflow por frame): translateX del track + parallax interno.
  private apply(p: number): void {
    const win = this.document.defaultView;
    if (!win || !this.trackEl) {
      return;
    }
    const vw = win.innerWidth;
    const x = -p * this.maxX;
    this.trackEl.style.transform = `translate3d(${x}px, 0, 0)`;

    this.cardEls.forEach((_, i) => {
      const centerX = this.cardLeft[i] + this.cardW[i] / 2 + x;
      const depth = clamp(1 - Math.abs((centerX - vw / 2) / vw) * 1.4, 0, 1);
      const lag = 1 - depth;
      this.cardAnims[i].forEach((el, j) => {
        el.style.opacity = `${0.2 + 0.8 * depth}`;
        el.style.transform = `translate3d(${(6 + j * 9) * lag}px, ${(5 + j * 5) * lag}px, 0)`;
      });
    });
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
