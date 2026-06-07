import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { LucideArrowUpRight, LucideArrowDown } from '@lucide/angular';

import { LanguageService } from '../services/language.service';

export type PortfolioRow = {
  client: string;
  logo: string;
  industry: string;
  projectType: string;
  link: string;
  videoSrc: string;
  poster: string;
};

@Component({
  selector: 'app-portfolio-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideArrowUpRight, LucideArrowDown],
  host: {
    'class': 'portfolio-table'
  },
  template: `
    <div class="pt">
      <div class="pt-colhead" aria-hidden="true">
        <span></span>
        <span>{{ t().client }}</span>
        <span>{{ t().industry }}</span>
        <span>{{ t().projectType }}</span>
        <span></span>
      </div>

      <div class="pt-rows" (mouseleave)="onTableLeave()">
        @for (row of visibleRows(); track row.client; let i = $index) {
          <a
            class="pt-row"
            [class.pt-row--enter]="i >= initialVisible"
            [style.animation-delay.ms]="enterDelay(i)"
            [href]="row.link"
            target="_blank"
            rel="noopener noreferrer"
            (mouseenter)="onRowEnter(i)"
            (mouseleave)="onRowLeave(i)"
          >
            <span class="pt-cell pt-num">{{ pad(i + 1) }}/{{ pad(rows().length) }}</span>
            <span class="pt-cell pt-client">
              @if (row.logo) {
                <img class="pt-logo" [src]="row.logo" [alt]="row.client" loading="lazy" />
              } @else {
                {{ row.client }}
              }
            </span>
            <span class="pt-cell pt-industry">{{ row.industry }}</span>
            <span class="pt-cell pt-type">{{ row.projectType }}</span>
            <span class="pt-cell pt-arrow" aria-hidden="true">
              <svg lucideArrowUpRight [size]="22" [strokeWidth]="1"></svg>
            </span>

            <img class="pt-thumb" [src]="row.poster" [alt]="row.client" loading="lazy" />
          </a>
        }

        @if (hasMore()) {
          <button type="button" class="pt-more" (click)="showMore()">
            <span class="pt-more__label">{{ t().more }}</span>
            <svg class="pt-more__icon" lucideArrowDown [size]="20" [strokeWidth]="1" aria-hidden="true"></svg>
          </button>
        }
      </div>
    </div>

    <!-- Un solo video flotante que sigue al cursor (desktop). -->
    <div class="pt-float" aria-hidden="true">
      <video
        class="pt-float__video"
        [muted]="true"
        loop
        playsinline
        preload="metadata"
      ></video>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
      padding: var(--section-py) 0;
    }

    /* Full-bleed, tema claro. La transición acompaña a la página cuando la dark-zone de arriba
       (dev-types) se apaga, para que no quede una línea divisoria al cambiar de color. */
    .pt {
      position: relative;
      left: calc(50% - 50vw);
      width: 100vw;
      background: var(--surface);
      color: var(--ink);
      transition: background-color 450ms ease;
    }

    /* Encabezado de columnas tipo tabla. Mismo grid + padding lateral que las filas. */
    .pt-colhead {
      display: grid;
      grid-template-columns: 3.5rem minmax(0, 2.4fr) minmax(0, 1.6fr) minmax(0, 2fr) 3rem;
      gap: clamp(1rem, 2.5vw, 2.5rem);
      padding: 0 clamp(1rem, 3vw, 2.5rem) 0.9rem;
      border-bottom: 1px solid var(--line-strong);
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .pt-rows {
      display: flex;
      flex-direction: column;
    }

    .pt-row {
      display: grid;
      grid-template-columns: 3.5rem minmax(0, 2.4fr) minmax(0, 1.6fr) minmax(0, 2fr) 3rem;
      gap: clamp(1rem, 2.5vw, 2.5rem);
      align-items: center;
      padding: clamp(1.1rem, 2vw, 1.6rem) clamp(1rem, 3vw, 2.5rem);
      border-bottom: 1px solid var(--line-strong);
      text-decoration: none;
      color: inherit;
      transition: background-color 200ms ease;
    }

    .pt-row:hover {
      background: rgba(17, 17, 17, 0.035);
    }

    .pt-row:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }

    .pt-client {
      color: var(--ink);
      font-size: clamp(1.15rem, 1.8vw, 1.6rem);
      font-weight: 500;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    /* Logo del cliente en su color de marca. max-height/width + contain para que aspectos
       dispares (wordmarks anchos, isotipos cuadrados) quepan sin deformarse, alineados a la izq. */
    .pt-logo {
      display: block;
      max-height: clamp(1.5rem, 2.2vw, 2rem);
      max-width: min(100%, 11rem);
      width: auto;
      height: auto;
      object-fit: contain;
      object-position: left center;
    }

    .pt-num {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      letter-spacing: 0.02em;
    }

    .pt-industry,
    .pt-type {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.92rem;
      letter-spacing: -0.01em;
      line-height: 1.3;
    }

    .pt-arrow {
      justify-self: end;
      display: inline-flex;
      color: var(--muted);
      transition:
        color 200ms ease,
        transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .pt-row:hover .pt-arrow {
      color: var(--accent);
      transform: translate(2px, -2px);
    }

    /* Thumb (poster) solo en mobile. */
    .pt-thumb {
      display: none;
    }

    /* Video flotante que sigue al cursor. El transform lo escribe el rAF cada frame,
       por eso NO se transiciona (sí opacity/scale para la aparición). */
    .pt-float {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 60;
      width: clamp(16rem, 22vw, 22rem);
      aspect-ratio: 16 / 10;
      border-radius: 0.6rem;
      overflow: clip;
      background: #000;
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
      pointer-events: none;
      opacity: 0;
      scale: 0.92;
      transform: translate3d(-9999px, -9999px, 0);
      transition:
        opacity 180ms ease,
        scale 220ms cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform, opacity;
    }

    .pt-float.is-visible {
      opacity: 1;
      scale: 1;
    }

    .pt-float__video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    @media (max-width: 760px) {
      .pt-colhead {
        display: none;
      }

      .pt-row {
        grid-template-columns: 1fr auto;
        grid-template-areas:
          'num      arrow'
          'client   arrow'
          'industry arrow'
          'type     arrow'
          'thumb    thumb';
        align-items: start;
        row-gap: 0.35rem;
        gap: 1rem;
        padding: 1.4rem clamp(1rem, 4vw, 1.5rem);
      }

      .pt-num {
        grid-area: num;
      }

      .pt-client {
        grid-area: client;
      }

      .pt-industry {
        grid-area: industry;
      }

      .pt-type {
        grid-area: type;
      }

      .pt-arrow {
        grid-area: arrow;
        align-self: start;
      }

      .pt-thumb {
        grid-area: thumb;
        display: block;
        width: 100%;
        aspect-ratio: 16 / 10;
        margin-top: 1rem;
        object-fit: cover;
        border-radius: 0.5rem;
        background: rgba(17, 17, 17, 0.05);
      }

      .pt-float {
        display: none;
      }
    }

    /* Entrada de las filas nuevas al "Ver más". */
    .pt-row--enter {
      animation: ptRowEnter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes ptRowEnter {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    /* Row "Ver más trabajos": botón ancho completo, texto centrado con la flecha al lado. */
    .pt-more {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      width: 100%;
      padding: clamp(1.2rem, 2.2vw, 1.7rem) clamp(1rem, 3vw, 2.5rem);
      border: 0;
      border-bottom: 1px solid var(--line-strong);
      background: transparent;
      color: var(--ink);
      font: inherit;
      cursor: pointer;
      transition: background-color 200ms ease;
    }

    .pt-more:hover {
      background: rgba(17, 17, 17, 0.035);
    }

    .pt-more:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }

    .pt-more__label {
      color: var(--muted);
      font-size: clamp(1.05rem, 1.5vw, 1.3rem);
      font-weight: 500;
      letter-spacing: -0.02em;
      transition: color 200ms ease;
    }

    .pt-more__icon {
      display: inline-flex;
      color: var(--muted);
      transition:
        color 200ms ease,
        transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Texto: gris → negro al hover. Icono: gris → azul (sí cambia a color). */
    .pt-more:hover .pt-more__label {
      color: var(--ink);
    }

    .pt-more:hover .pt-more__icon {
      color: var(--accent);
      transform: translateY(2px);
    }

    @media (prefers-reduced-motion: reduce) {
      .pt-float {
        transition: opacity 120ms ease;
        scale: 1;
      }

      .pt-row--enter {
        animation: none;
      }
    }
  `
})
export class PortfolioTableComponent implements OnDestroy {
  readonly rows = input.required<PortfolioRow[]>();

  private readonly i18n = inject(LanguageService);
  protected readonly t = computed(() => PORTFOLIO_HEAD[this.i18n.lang()]);

  // Paginación: arranca en 10 y crece de 5 en 5 hasta mostrar todos.
  private static readonly INITIAL_VISIBLE = 10;
  private static readonly STEP = 5;
  protected readonly initialVisible = PortfolioTableComponent.INITIAL_VISIBLE;
  protected readonly visibleCount = signal(PortfolioTableComponent.INITIAL_VISIBLE);
  protected readonly visibleRows = computed(() => this.rows().slice(0, this.visibleCount()));
  protected readonly remaining = computed(() => Math.max(0, this.rows().length - this.visibleCount()));
  protected readonly hasMore = computed(() => this.remaining() > 0);

  protected showMore(): void {
    this.visibleCount.update((c) => Math.min(c + PortfolioTableComponent.STEP, this.rows().length));
  }

  // Stagger de entrada: dentro de cada tanda de 5, cada fila cae con un pequeño retraso.
  protected enterDelay(index: number): number {
    const rel = (index - PortfolioTableComponent.INITIAL_VISIBLE) % PortfolioTableComponent.STEP;
    return rel <= 0 ? 0 : rel * 60;
  }

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);

  private static readonly ENTER_DELAY = 150;
  private static readonly OFFSET = 24;

  // .pt-float/.pt-float__video se recrean durante la hidratación SSR (el nodo del prerender queda
  // desconectado). Por eso NO se cachean a ciegas: se validan con isConnected y se re-leen del DOM
  // si quedaron huérfanos. El host del componente sí es estable.
  private _floatEl: HTMLElement | null = null;
  private _floatVideo: HTMLVideoElement | null = null;

  private get host(): HTMLElement {
    return this.hostRef.nativeElement as HTMLElement;
  }
  private get floatEl(): HTMLElement | null {
    if (!this._floatEl?.isConnected) {
      this._floatEl = this.host.querySelector<HTMLElement>('.pt-float');
    }
    return this._floatEl;
  }
  private get floatVideo(): HTMLVideoElement | null {
    if (!this._floatVideo?.isConnected) {
      this._floatVideo = this.host.querySelector<HTMLVideoElement>('.pt-float__video');
    }
    return this._floatVideo;
  }

  private pointerX = 0;
  private pointerY = 0;
  private floatW = 0;
  private floatH = 0;
  private rafId: number | null = null;
  private enterTimer: ReturnType<typeof setTimeout> | null = null;
  private activeSrc = '';
  private activePoster = '';
  private readonly aspectCache = new Map<string, number>();
  private isMobileOrReduced = false;

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.schedule();
  };

  private readonly onResize = (): void => this.cacheFloatSize();

  private readonly onVisibility = (): void => {
    if (this.document.visibilityState === 'visible' && this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  constructor() {
    // afterNextRender corre solo en el browser y tras el primer render, así que el DOM hidratado
    // (incluido .pt-float) ya existe para querySelector. ngAfterViewInit corría demasiado pronto en
    // la hidratación SSR y devolvía null, dejando el viewer sin video.
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => this.setupViewer());
    });
  }

  private setupViewer(): void {
    const win = this.document.defaultView;
    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile =
      !!win &&
      typeof win.matchMedia === 'function' &&
      (win.matchMedia('(max-width: 760px)').matches ||
        win.matchMedia('(pointer: coarse)').matches);
    this.isMobileOrReduced = reduced || mobile;

    if (this.isMobileOrReduced) {
      return;
    }

    this.cacheFloatSize();
    // pointermove en el host (estable); .pt-rows puede recrearse en la hidratación.
    this.host.addEventListener('pointermove', this.onPointerMove, { passive: true });
    win?.addEventListener('resize', this.onResize, { passive: true });
    this.document.addEventListener('visibilitychange', this.onVisibility);

    this.preloadVideos();
  }

  // Precarga (prefetch) todos los videos del portafolio cuando el navegador está ocioso, para que al
  // llegar a la tabla el hover muestre el clip al instante. Solo desktop (mobile usa el poster).
  private preloadVideos(): void {
    const win = this.document.defaultView;
    const run = (): void => {
      for (const row of this.rows()) {
        if (!row.videoSrc) {
          continue;
        }
        const link = this.document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'video';
        link.href = row.videoSrc;
        this.document.head.appendChild(link);
      }
    };
    const idle = (win as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
    })?.requestIdleCallback;
    if (typeof idle === 'function') {
      idle(run, { timeout: 2000 });
    } else {
      win?.setTimeout(run, 1200);
    }
  }

  ngOnDestroy(): void {
    const win = this.document.defaultView;
    this.host.removeEventListener('pointermove', this.onPointerMove);
    win?.removeEventListener('resize', this.onResize);
    this.document.removeEventListener('visibilitychange', this.onVisibility);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.enterTimer !== null) {
      clearTimeout(this.enterTimer);
      this.enterTimer = null;
    }
    // Campo directo (no el getter): ngOnDestroy corre también en SSR, donde no debe tocar el DOM.
    this._floatVideo?.pause();
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // mouseenter de una fila: activa con leve delay (si el cursor sólo pasa rápido, no aparece).
  protected onRowEnter(index: number): void {
    if (this.isMobileOrReduced) {
      return;
    }
    if (this.enterTimer !== null) {
      clearTimeout(this.enterTimer);
    }
    this.enterTimer = setTimeout(() => {
      this.enterTimer = null;
      this.activateRow(index);
    }, PortfolioTableComponent.ENTER_DELAY);
  }

  // mouseleave de una fila: si aún no se activó, cancelar. El ocultado real es onTableLeave.
  protected onRowLeave(_index: number): void {
    if (this.enterTimer !== null) {
      clearTimeout(this.enterTimer);
      this.enterTimer = null;
    }
  }

  protected onTableLeave(): void {
    if (this.enterTimer !== null) {
      clearTimeout(this.enterTimer);
      this.enterTimer = null;
    }
    this.deactivate();
  }

  private activateRow(index: number): void {
    const row = this.rows()[index];
    const video = this.floatVideo;
    if (!row || !video || !this.floatEl) {
      return;
    }
    if (this.activeSrc !== row.videoSrc) {
      video.src = row.videoSrc;
      this.activeSrc = row.videoSrc;
    }
    video.poster = row.poster;
    video.currentTime = 0;
    video.play().catch(() => {});
    this.activePoster = row.poster;
    this.applyMediaAspect(row);
    this.positionFloat();
    this.floatEl.classList.add('is-visible');
  }

  // Ajusta el flotante al aspect ratio real del media. Lo lee del poster (para video es un frame
  // del mismo clip; para asembis es la portada), así el viewer respeta la proporción y no recorta.
  // Cachea por poster para no re-medir en hovers siguientes.
  private applyMediaAspect(row: PortfolioRow): void {
    if (!this.floatEl || !row.poster) {
      return;
    }
    const cached = this.aspectCache.get(row.poster);
    if (cached) {
      this.setFloatAspect(cached);
      return;
    }
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const ratio = img.naturalWidth / img.naturalHeight;
        this.aspectCache.set(row.poster, ratio);
        if (this.activePoster === row.poster) {
          this.setFloatAspect(ratio);
        }
      }
    };
    img.src = row.poster;
  }

  private setFloatAspect(ratio: number): void {
    if (!this.floatEl) {
      return;
    }
    this.floatEl.style.aspectRatio = String(ratio);
    this.cacheFloatSize();
    this.positionFloat();
  }

  private deactivate(): void {
    this.floatEl?.classList.remove('is-visible');
    if (this.floatVideo) {
      this.floatVideo.pause();
      this.floatVideo.currentTime = 0;
    }
  }

  private cacheFloatSize(): void {
    if (!this.floatEl) {
      return;
    }
    this.floatW = this.floatEl.offsetWidth;
    this.floatH = this.floatEl.offsetHeight;
  }

  private schedule(): void {
    if (this.rafId !== null) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.positionFloat();
    });
  }

  // Coloca el flotante al lado del cursor, con clamp al viewport y flip si toca el borde derecho.
  private positionFloat(): void {
    const win = this.document.defaultView;
    if (!win || !this.floatEl) {
      return;
    }
    const pad = 12;
    const maxX = win.innerWidth - this.floatW - pad;
    const maxY = win.innerHeight - this.floatH - pad;
    let x = this.pointerX + PortfolioTableComponent.OFFSET;
    // Arriba del cursor (alineado hacia arriba). Si no cabe arriba, cae abajo.
    let y = this.pointerY - this.floatH - PortfolioTableComponent.OFFSET;
    if (x > maxX) {
      x = this.pointerX - this.floatW - PortfolioTableComponent.OFFSET;
    }
    if (y < pad) {
      y = this.pointerY + PortfolioTableComponent.OFFSET;
    }
    x = Math.max(pad, Math.min(x, maxX));
    y = Math.max(pad, Math.min(y, maxY));
    this.floatEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }
}

const PORTFOLIO_HEAD = {
  es: { client: 'Cliente', industry: 'Industria', projectType: 'Tipo de proyecto', more: 'Ver más trabajos' },
  en: { client: 'Client', industry: 'Industry', projectType: 'Project type', more: 'See more work' }
} as const;
