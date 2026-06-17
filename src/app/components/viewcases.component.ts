import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  effect,
  inject,
  input
} from '@angular/core';
import { LucideMousePointerClick } from '@lucide/angular';

import { environment } from '../../environments/environment';
import { TechnicalGridBackgroundComponent } from './technical-grid-background.component';

export type Viewcase = {
  label: string;
  category: string;
  videoSrc: string;
  poster: string;
  link: string;
};

@Component({
  selector: 'app-viewcases',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideMousePointerClick, TechnicalGridBackgroundComponent],
  host: {
    'class': 'viewcases'
  },
  template: `
    <div class="vc-bg">
      <app-technical-grid-background class="vc-bg__grid" [mode]="'pointer'" [seed]="2" />

      <div class="vc-inner">
        <div class="vc-head">
          <div class="vc-head__text">
            <h2 class="vc-title">{{ title() }}</h2>
            <p class="vc-intro">{{ intro() }}</p>
          </div>
          <span class="vc-head__icon" aria-hidden="true">
            <svg lucideMousePointerClick [size]="104" [strokeWidth]="0.5"></svg>
          </span>
        </div>

        <div class="vc-grid">
          @for (item of items(); track item.label) {
            <a
              class="vc-tile"
              [href]="item.link"
              target="_blank"
              rel="noopener noreferrer"
              (mouseenter)="play($event)"
              (mouseleave)="stop($event)"
            >
              <video
                class="vc-video"
                [src]="item.videoSrc"
                [muted]="true"
                loop
                playsinline
                preload="none"
                [poster]="item.poster"
                aria-hidden="true"
              ></video>
              <span class="vc-panel">
                <strong class="vc-panel__name">{{ item.label }}</strong>
                <span class="vc-panel__kind">{{ item.category }}</span>
              </span>
            </a>
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
    }

    /* Surface full-bleed: gris + la grilla técnica INTERACTIVA (el "artefacto", como el hero).
       Envuelve el contenido para capturar el puntero y que los puntos reaccionen al mouse.
       Gradientes arriba/abajo para fundir con las secciones vecinas. */
    .vc-bg {
      position: relative;
      left: calc(50% - 50vw);
      width: 100vw;
      padding: var(--section-py) 0;
      background: var(--surface);
      overflow: clip;
      transition: background-color 450ms ease;
    }

    .vc-bg__grid {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    /* Contenido por encima del artefacto y los gradientes; restaura el padding horizontal
       que el full-bleed quitó, para alinear con el resto de las secciones. */
    .vc-inner {
      position: relative;
      z-index: 2;
      padding: 0 clamp(1rem, 3vw, 2.5rem);
    }

    /* Difuminado de los bordes (arriba/abajo) para fundir la grilla con las secciones grises
       vecinas. Es un sólido --surface (que SÍ transiciona con el fondo) recortado con una
       máscara en gradiente. Antes era un linear-gradient con var(--surface): como los gradientes
       no se pueden transicionar, "saltaba" de color un instante antes que el fondo al cambiar
       negro↔gris (se veía el cambio primero arriba y luego abajo). */
    .vc-bg::before,
    .vc-bg::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: clamp(5rem, 12vw, 9rem);
      z-index: 1;
      pointer-events: none;
      background: var(--surface);
      transition: background-color 450ms ease;
    }

    .vc-bg::before {
      top: 0;
      -webkit-mask-image: linear-gradient(to bottom, #000, transparent);
      mask-image: linear-gradient(to bottom, #000, transparent);
    }

    .vc-bg::after {
      bottom: 0;
      -webkit-mask-image: linear-gradient(to top, #000, transparent);
      mask-image: linear-gradient(to top, #000, transparent);
    }

    .vc-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      margin-bottom: clamp(2.5rem, 5vw, 4rem);
    }

    .vc-head__text {
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
    }

    .vc-head__icon {
      flex-shrink: 0;
      display: inline-flex;
      margin-right: clamp(1rem, 4vw, 4rem);
      color: var(--ink);
      /* El suavizado del seguimiento lo hace esta transición (compositor/GPU), no JS. */
      transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform;
    }

    .vc-head__icon svg {
      width: clamp(60px, 8vw, 104px);
      height: clamp(60px, 8vw, 104px);
    }

    @media (prefers-reduced-motion: reduce) {
      .vc-head__icon {
        transition: none;
      }
    }

    .vc-title {
      margin: 0;
      max-width: 20ch;
      color: var(--ink);
      font-size: clamp(2.2rem, 5vw, 4.2rem);
      font-weight: 400;
      letter-spacing: -0.05em;
      line-height: 1;
      text-wrap: balance;
    }

    .vc-intro {
      margin: 0;
      max-width: 56ch;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.95rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    .vc-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(1rem, 2vw, 1.75rem);
    }

    .vc-tile {
      position: relative;
      display: block;
      /* Respeta la proporción del media (1280×682) en lugar de forzar 16/9: no recorta el video. */
      aspect-ratio: 1280 / 682;
      overflow: clip;
      border: 1px solid var(--line);
      border-radius: 0.9rem;
      background: rgba(17, 17, 17, 0.04);
      text-decoration: none;
      transition: border-color 200ms ease;
    }

    .vc-tile:hover {
      border-color: var(--line-strong);
    }

    .vc-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Panel que se despliega hacia arriba al hover con el nombre del caso y su categoría. */
    .vc-panel {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding: 0.85rem 1.1rem;
      background: var(--surface);
      border-top: 1px solid var(--line);
      /* Esquinas inferiores redondeadas: si no, el panel tapa el redondeo del tile. */
      border-bottom-left-radius: 0.9rem;
      border-bottom-right-radius: 0.9rem;
      transform: translateY(110%);
      transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .vc-panel__name {
      color: var(--ink);
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    /* Categoría del sistema como metadato secundario, en mono. */
    .vc-panel__kind {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.78rem;
      line-height: 1.3;
    }

    .vc-tile:hover .vc-panel {
      transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      .vc-panel {
        transform: translateY(0);
        transition: none;
      }
    }

    /* Mobile: una columna y el panel siempre visible (los videos arrancan al entrar). */
    @media (max-width: 760px) {
      .vc-head {
        flex-direction: column;
        align-items: flex-start;
      }

      .vc-head__icon {
        display: none;
      }

      .vc-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .vc-panel {
        transform: translateY(0);
      }
    }
  `
})
export class ViewcasesComponent implements AfterViewInit, OnDestroy {
  readonly title = input.required<string>();
  readonly intro = input.required<string>();
  readonly items = input.required<Viewcase[]>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;
  // Mobile: solo un video reproduce a la vez (el que cruza el centro); pausa el anterior.
  private inlineActive: HTMLVideoElement | null = null;

  // Efecto de seguimiento del ícono al mouse. Reactivado tras aliviar la carga de video
  // (hero a 1 decoder, viewcases con poster + preload="none").
  private static readonly ICON_FOLLOW = true;

  // Seguimiento suave del mouse para el ícono del encabezado (parallax).
  private iconEl: HTMLElement | null = null;
  private iconBaseX = 0; // centro del ícono en coordenadas de documento
  private iconBaseY = 0;
  private targetX = 0;
  private targetY = 0;
  private rafId: number | null = null;
  private videoScript: HTMLScriptElement | null = null;

  constructor() {
    // VideoObject JSON-LD de los demos (viewcases): los hace elegibles para indexado y
    // rich results de video. Se inyecta al <head> en el prerender (SSG), reactivo a items().
    effect(() => {
      const items = this.items();
      if (!items.length) {
        return;
      }
      const origin = (environment.siteUrl || '').replace(/\/+$/, '');
      const data = {
        '@context': 'https://schema.org',
        '@graph': items.map((it) => ({
          '@type': 'VideoObject',
          name: it.label,
          description: `${it.label} — ${it.category}`,
          thumbnailUrl: origin + it.poster,
          contentUrl: origin + it.videoSrc,
          uploadDate: '2026-06-07'
        }))
      };
      if (!this.videoScript) {
        this.videoScript = this.document.createElement('script');
        this.videoScript.setAttribute('type', 'application/ld+json');
        this.videoScript.setAttribute('data-seo', 'viewcases-videos');
        this.document.head.appendChild(this.videoScript);
      }
      this.videoScript.textContent = JSON.stringify(data);
    });
  }

  // Desktop: el video se ve como imagen (primer frame) y se reproduce al hover.
  play(event: Event): void {
    const video = (event.currentTarget as HTMLElement).querySelector('video');
    video?.play().catch(() => {});
  }

  stop(event: Event): void {
    const video = (event.currentTarget as HTMLElement).querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }

  // El ícono persigue suavemente al mouse dentro de la sección (parallax acotado).
  // Base del ícono en coordenadas de documento (estable con el scroll). Se cachea una vez
  // y en resize, así onMove no toca el layout en cada movimiento (sin reflows que traben).
  private cacheIconBase(): void {
    const win = this.document.defaultView;
    if (!this.iconEl || !win) {
      return;
    }
    const r = this.iconEl.getBoundingClientRect();
    this.iconBaseX = r.left + r.width / 2 - this.targetX + win.scrollX;
    this.iconBaseY = r.top + r.height / 2 - this.targetY + win.scrollY;
  }

  private readonly onMove = (event: MouseEvent): void => {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }
    const ref = 520; // distancia a la que el desplazamiento llega al máximo
    const max = 40; // px de desplazamiento máximo hacia el mouse
    const dx = event.clientX + win.scrollX - this.iconBaseX;
    const dy = event.clientY + win.scrollY - this.iconBaseY;
    this.targetX = clampUnit(dx / ref) * max;
    this.targetY = clampUnit(dy / ref) * max;
    this.schedule();
  };

  private readonly onLeave = (): void => {
    this.targetX = 0;
    this.targetY = 0;
    this.schedule();
  };

  private readonly onResize = (): void => {
    this.cacheIconBase();
  };

  // Al volver del background, el rAF pendiente pudo descartarse y el efecto quedaría
  // colgado; reiniciamos el loop limpio.
  private readonly onVisibility = (): void => {
    // Al volver del background, el rAF pendiente del throttle pudo descartarse; lo
    // reseteamos para que el próximo movimiento agende uno nuevo.
    if (this.document.visibilityState === 'visible' && this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  // Aplica el transform a lo sumo una vez por frame; el suavizado lo hace la transición CSS
  // en el compositor (GPU), no un loop de JS en el hilo principal.
  private schedule(): void {
    if (this.rafId !== null || !this.iconEl) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      if (this.iconEl) {
        this.iconEl.style.transform = `translate3d(${this.targetX.toFixed(1)}px, ${this.targetY.toFixed(1)}px, 0)`;
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const win = this.document.defaultView;
    const mobile =
      !!win &&
      typeof win.matchMedia === 'function' &&
      win.matchMedia('(max-width: 760px)').matches;
    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const host = this.hostRef.nativeElement as HTMLElement;

    if (reduced) {
      return;
    }

    // Mobile: sin hover → cada video arranca al entrar en pantalla (una sola vez).
    if (mobile) {
      if (typeof IntersectionObserver === 'undefined') {
        return;
      }
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const video = entry.target as HTMLVideoElement;
            if (!entry.isIntersecting) {
              continue;
            }
            // Solo UN video a la vez: pausamos el anterior antes de reproducir el que cruza el centro.
            if (this.inlineActive && this.inlineActive !== video) {
              this.inlineActive.pause();
            }
            this.inlineActive = video;
            video.muted = true;
            video.play().catch(() => {});
          }
        },
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
      );
      host.querySelectorAll('video').forEach((v) => this.observer?.observe(v));
      return;
    }

    // Desktop: el ícono del encabezado sigue al mouse.
    this.iconEl = host.querySelector<HTMLElement>('.vc-head__icon');
    if (this.iconEl && ViewcasesComponent.ICON_FOLLOW) {
      this.zone.runOutsideAngular(() => {
        requestAnimationFrame(() => this.cacheIconBase());
        host.addEventListener('mousemove', this.onMove, { passive: true });
        host.addEventListener('mouseleave', this.onLeave, { passive: true });
        win?.addEventListener('resize', this.onResize, { passive: true });
        this.document.addEventListener('visibilitychange', this.onVisibility);
      });
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
    const host = this.hostRef.nativeElement;
    host.removeEventListener('mousemove', this.onMove);
    host.removeEventListener('mouseleave', this.onLeave);
    this.document.defaultView?.removeEventListener('resize', this.onResize);
    this.document.removeEventListener('visibilitychange', this.onVisibility);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.videoScript?.remove();
    this.videoScript = null;
  }
}

function clampUnit(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
