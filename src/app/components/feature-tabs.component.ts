import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  inject,
  input,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type FeatureTab = {
  body: string;
  lead: string;
  videoSrc: string;
};

@Component({
  selector: 'app-feature-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'feature-tabs-host'
  },
  template: `
    <div class="feature-stage" [style.aspect-ratio]="mediaAspect()">
      @for (tab of tabs(); track $index) {
        <video
          class="feature-video"
          [class.is-active]="$index === activeIndex()"
          [src]="tab.videoSrc"
          [muted]="true"
          loop
          playsinline
          preload="metadata"
          aria-hidden="true"
        ></video>
      }
    </div>

    <div class="feature-tabs" role="tablist" [class.is-autoplaying]="autoplaying()">
      @for (tab of tabs(); track $index) {
        <button
          type="button"
          class="feature-tab"
          [class.is-active]="$index === activeIndex()"
          role="tab"
          [attr.aria-selected]="$index === activeIndex()"
          (click)="select($index)"
        >
          <p class="feature-tab__text"><strong>{{ tab.lead }}</strong> {{ tab.body }}</p>
          <span class="feature-tab__line" aria-hidden="true"></span>
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .feature-stage {
      position: relative;
      width: 100%;
      /* Fallback = ancho del video con 20% menos de alto (1280×682 → 1280×546). Lo sobreescribe
         [style.aspect-ratio] con el aspect real del media (también recortado 20%) apenas carga:
         respetamos el ancho y cortamos el alto desde el top. */
      aspect-ratio: 1280 / 546;
      max-height: 60rem;
      overflow: hidden;
      border: 1px solid var(--line-strong);
      border-radius: 1.25rem;
      background: var(--surface);
    }

    .feature-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      opacity: 0;
      transition: opacity 550ms ease;
    }

    .feature-video.is-active {
      opacity: 1;
    }

    .feature-tabs {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(1rem, 3vw, 2.5rem);
      margin-top: 1.5rem;
    }

    .feature-tab {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      appearance: none;
    }

    .feature-tab__text {
      margin: 0;
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.2;
      text-wrap: pretty;
    }

    .feature-tab__text strong {
      color: var(--ink);
      font-weight: 500;
    }

    .feature-tab__line {
      position: relative;
      width: 100%;
      height: 2px;
      margin-top: auto;
      background: transparent;
      transition: background-color 200ms ease;
    }

    .feature-tab:hover .feature-tab__line,
    .feature-tab:focus-visible .feature-tab__line {
      background: var(--line-strong);
    }

    /* Tab activo sin autoplay (p.ej. el usuario lo frenó): línea llena estática. */
    .feature-tab.is-active .feature-tab__line {
      background: var(--accent);
    }

    /* Barra de progreso del autoplay: la línea del tab activo se llena durante la duración
       del video (coincide con autoAdvanceMs) y reinicia al pasar al siguiente. Le avisa al
       usuario que el auto-avance está corriendo. */
    .feature-tab__line::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--accent);
      transform: scaleX(0);
      transform-origin: left center;
    }

    .feature-tabs.is-autoplaying .feature-tab.is-active .feature-tab__line {
      background: var(--line);
    }

    .feature-tabs.is-autoplaying .feature-tab.is-active .feature-tab__line::after {
      animation: feature-tab-fill 6000ms linear forwards;
    }

    @keyframes feature-tab-fill {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }

    .feature-tab:focus-visible {
      outline: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .feature-video {
        transition: none;
      }

      /* Sin animación: el tab activo solo muestra su línea llena. */
      .feature-tabs.is-autoplaying .feature-tab.is-active .feature-tab__line {
        background: var(--accent);
      }

      .feature-tabs.is-autoplaying .feature-tab.is-active .feature-tab__line::after {
        animation: none;
      }
    }

    @media (max-width: 760px) {
      .feature-tabs {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }
  `
})
export class FeatureTabsComponent implements AfterViewInit, OnDestroy {
  private static readonly autoAdvanceMs = 6000;
  // Mostramos el 80% del alto que el video tendría a ancho completo: respetamos el ancho y
  // recortamos el 20% inferior (con object-fit: cover + object-position: top).
  private static readonly heightCrop = 0.8;

  readonly tabs = input.required<FeatureTab[]>();

  protected readonly activeIndex = signal(0);
  // Refleja si el auto-avance está corriendo (para la barra de progreso de la línea).
  protected readonly autoplaying = signal(false);
  // Aspect del stage derivado del video activo y ensanchado por heightCrop: respeta el ancho del
  // video y recorta el 20% inferior del alto. null hasta que carga el primer video (manda el fallback CSS).
  protected readonly mediaAspect = signal<number | null>(null);

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private observer: IntersectionObserver | null = null;
  private sectionVisible = false;
  private userStopped = false;

  ngAfterViewInit(): void {
    // Video/animaciones son browser-only: no correr en prerender (SSR).
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const host = this.hostRef.nativeElement as HTMLElement;

    // Reproducir los videos (y avanzar) solo cuando el hero está en pantalla. Fuera de
    // vista no tiene sentido seguir decodificando 3 videos: carga la máquina al pedo.
    if (typeof IntersectionObserver === 'undefined') {
      this.sectionVisible = true;
      this.playActiveOnly();
      this.startAutoAdvance();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible === this.sectionVisible) {
          return;
        }
        this.sectionVisible = visible;
        if (visible) {
          this.playActiveOnly();
          if (!this.userStopped) {
            this.startAutoAdvance();
          }
        } else {
          this.pauseVideos();
          this.stopAutoAdvance();
        }
      },
      { threshold: 0 }
    );
    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.stopAutoAdvance();
  }

  protected select(index: number): void {
    // Cualquier interacción del usuario con los tabs desactiva el auto-avance.
    this.userStopped = true;
    this.stopAutoAdvance();
    this.activeIndex.set(index);
    this.playActiveOnly();
  }

  private advance(): void {
    const count = this.tabs().length;

    if (count <= 1) {
      return;
    }

    this.activeIndex.update((index) => (index + 1) % count);
    this.playActiveOnly();
  }

  private startAutoAdvance(): void {
    if (this.intervalId !== null || this.tabs().length <= 1) {
      return;
    }

    this.autoplaying.set(true);
    this.zone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.zone.run(() => this.advance());
      }, FeatureTabsComponent.autoAdvanceMs);
    });
  }

  private stopAutoAdvance(): void {
    this.autoplaying.set(false);
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Solo el video activo se reproduce; los otros quedan pausados. Decodificar 3 videos a la vez
  // para mostrar uno solo (los demás están en opacity:0) carga la máquina al pedo.
  private playActiveOnly(): void {
    if (!this.sectionVisible) {
      return;
    }
    const host = this.hostRef.nativeElement as HTMLElement;
    const active = this.activeIndex();
    host.querySelectorAll('video').forEach((video: HTMLVideoElement, index: number) => {
      if (index === active) {
        this.applyAspect(video);
        video.muted = true;
        const playback = video.play();
        if (playback && typeof playback.catch === 'function') {
          playback.catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }

  // Ajusta el stage a la proporción real del video activo para no recortarlo. Si aún no cargó
  // la metadata, espera el evento. zone.run asegura el refresh con OnPush.
  private applyAspect(video: HTMLVideoElement): void {
    const set = (): void => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w > 0 && h > 0) {
        // Ensanchamos el aspect para que, a ancho completo, el alto sea 20% menor que el natural;
        // con object-fit: cover + top eso recorta el 20% inferior del video.
        this.zone.run(() => this.mediaAspect.set(w / h / FeatureTabsComponent.heightCrop));
      }
    };
    if (video.readyState >= 1) {
      set();
    } else {
      video.addEventListener('loadedmetadata', set, { once: true });
    }
  }

  private pauseVideos(): void {
    const host = this.hostRef.nativeElement as HTMLElement;
    host.querySelectorAll('video').forEach((video: HTMLVideoElement) => video.pause());
  }
}
