import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideCircleOff } from '@lucide/angular';

import { TechnicalGridBackgroundComponent } from './technical-grid-background.component';

export type HeroAction = {
  label: string;
  link: string;
};

export type HeroMarquee = {
  items: string[];
  label: string;
};

export type HeroSlide = { src: string; poster: string };

type Slide = { label: string; src: string; poster: string };

@Component({
  selector: 'app-web-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TechnicalGridBackgroundComponent, LucideCircleOff],
  host: {
    'class': 'web-hero'
  },
  template: `
    <div class="wh-bg">
      <app-technical-grid-background class="wh-bg__grid" [mode]="'pointer'" [seed]="5" />

      <div class="wh-columns">
        <div class="wh-inner">
          <div class="wh-left">
            <h1 class="wh-title">{{ title() }}</h1>
            <p class="wh-lead">{{ lead() }}</p>

            @if (actions().length) {
              <div class="wh-actions">
                @for (action of actions(); track action.label) {
                  @if (isHref(action.link)) {
                    <a class="button" [attr.href]="action.link">
                      <span>{{ action.label }}</span>
                      <span class="button-arrow" aria-hidden="true">→</span>
                    </a>
                  } @else {
                    <a class="button" [routerLink]="action.link">
                      <span>{{ action.label }}</span>
                      <span class="button-arrow" aria-hidden="true">→</span>
                    </a>
                  }
                }
              </div>
            }
          </div>
        </div>

        <!-- Carrusel: cada recuadro entra y sale de la página por la derecha, uno a uno.
             En reposo se ve ~90% (el resto sangra fuera del borde derecho). -->
        <div class="wh-media" aria-hidden="true" [style.aspect-ratio]="mediaAspect()">
          @for (slide of stageSlides(); track $index) {
            <div class="wh-slide" [class.is-active]="$index === activeIndex()">
              @if (slide.src) {
                <video
                  class="wh-video"
                  [src]="slide.src"
                  [muted]="true"
                  loop
                  playsinline
                  preload="metadata"
                ></video>
              } @else if (slide.poster) {
                <img class="wh-video" [src]="slide.poster" alt="" />
              } @else {
                <span class="wh-slide__num">{{ slide.label }}</span>
              }
            </div>
          }
        </div>
      </div>

      <!-- Marquee: "Lo que no hacemos:" queda fijo a la izquierda; los items corren en loop y
           se meten por detrás de la etiqueta. -->
      @if (marquee(); as mq) {
        <div class="wh-marquee" [attr.aria-label]="mq.label">
          <div class="wh-marquee__track">
            @for (item of marqueeLoop(); track $index) {
              <span class="wh-marquee__item" [attr.aria-hidden]="$index >= mq.items.length || null">
                <svg lucideCircleOff [size]="18" [strokeWidth]="1"></svg>{{ item }}
              </span>
            }
          </div>
          <span class="wh-marquee__label">{{ mq.label }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
    }

    /* Surface full-bleed: gris + grilla técnica interactiva, con degradados arriba/abajo.
       El overflow clip recorta el carrusel en el borde de la página (de ahí el "90% visible"). */
    .wh-bg {
      position: relative;
      left: calc(50% - 50vw);
      width: 100vw;
      /* Se extiende hacia arriba DETRÁS del topbar (margin-top negativo = topbar 5.25rem +
         padding-top de la página) para replicar el hero de /software: la grilla y el gradiente
         arrancan en y=0, así el fade superior tiene el MISMO ALTO (~208px) y termina a la misma
         altura en ambos landings. El padding-top recupera ese offset (+ aire) para que el
         contenido no quede bajo el topbar; min-height 100dvh llena el viewport desde y=0. */
      margin-top: calc(-5.25rem - clamp(1.5rem, 3vw, 3rem));
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: calc(5.25rem + clamp(1.5rem, 3vw, 3rem) + clamp(1.5rem, 3vw, 2.25rem)) 0 clamp(1.5rem, 3vw, 2.25rem);
      background: var(--surface);
      overflow: clip;
    }

    .wh-bg__grid {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .wh-bg::before,
    .wh-bg::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      z-index: 1;
      pointer-events: none;
    }

    /* Mismo gradiente y MISMO ALTO que el top del hero de /software (.shell--software::before).
       Como el hero ahora arranca en y=0 (detrás del topbar, vía el margin-top de .wh-bg), el fade
       queda idéntico: mismo alto (~208px) y termina a la misma altura absoluta en ambos landings. */
    .wh-bg::before {
      top: 0;
      height: clamp(8rem, 18vw, 13rem);
      background: linear-gradient(180deg, var(--surface) 0%, rgba(246, 246, 246, 0.92) 28%, rgba(246, 246, 246, 0) 100%);
    }

    .wh-bg::after {
      bottom: 0;
      height: clamp(3.5rem, 9vw, 7rem);
      background: linear-gradient(to top, var(--surface), transparent);
    }

    /* Las dos columnas. El carrusel se centra respecto a esto (no respecto al marquee). */
    .wh-columns {
      position: relative;
      z-index: 2;
    }

    .wh-inner {
      display: flex;
      align-items: center;
      min-height: clamp(17rem, 30vw, 25rem);
      padding: 0 clamp(1rem, 3vw, 2.5rem);
    }

    .wh-left {
      display: flex;
      flex-direction: column;
      gap: clamp(1.4rem, 3vw, 2.1rem);
      max-width: 46%;
    }

    .wh-title {
      margin: 0;
      max-width: 13ch;
      color: var(--ink);
      font-size: var(--hero-title-size);
      font-weight: var(--hero-title-weight);
      letter-spacing: var(--hero-title-tracking);
      line-height: var(--hero-title-leading);
      text-wrap: balance;
    }

    .wh-lead {
      margin: 0;
      max-width: 42ch;
      color: var(--ink);
      font-size: var(--hero-lead-size);
      font-weight: 400;
      line-height: var(--hero-lead-leading);
      text-wrap: pretty;
    }

    .wh-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
      margin-top: 0.4rem;
    }

    /* Carrusel anclado a la derecha y un poco fuera del viewport (right: -5vw), 50vw de ancho
       → en reposo se ve el 90% (45vw de 50vw); el resto sangra y lo recorta .wh-bg. */
    .wh-media {
      position: absolute;
      z-index: 1;
      top: 50%;
      right: -4.8vw;
      width: 48vw;
      aspect-ratio: 16 / 10;
      transform: translateY(-50%);
    }

    .wh-slide {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      border: 1px solid var(--line-strong);
      border-radius: 1.25rem;
      background: var(--surface);
      overflow: clip;
      transform: translateX(112%);
      transition: transform 420ms cubic-bezier(0.55, 0, 0.85, 0.25);
    }

    .wh-slide.is-active {
      transform: translateX(0);
      z-index: 1;
      transition: transform 620ms cubic-bezier(0.3, 1.3, 0.4, 1) 300ms;
    }

    .wh-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .wh-slide__num {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: clamp(2rem, 5vw, 3.4rem);
      letter-spacing: 0.06em;
      opacity: 0.45;
    }

    /* Marquee: recuadro blanco compacto, centrado, debajo de las columnas. */
    .wh-marquee {
      position: relative;
      z-index: 2;
      width: min(40rem, calc(100vw - 3rem));
      height: clamp(3rem, 5vw, 3.4rem);
      margin: clamp(1.75rem, 3.5vw, 2.5rem) auto 0;
      border-radius: 1rem;
      background: #ffffff;
      overflow: hidden;
    }

    .wh-marquee__track {
      position: absolute;
      inset: 0 auto 0 0;
      display: flex;
      align-items: center;
      width: max-content;
      animation: wh-marquee 28s linear infinite;
    }

    .wh-marquee__item {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.1rem;
      color: var(--ink);
      font-size: 0.95rem;
      white-space: nowrap;
    }

    .wh-marquee__item svg {
      color: var(--muted);
    }

    /* Etiqueta fija: tapa el marquee a la izquierda; el gradiente lo desvanece al meterse detrás. */
    .wh-marquee__label {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      padding: 0 0.4rem 0 1.25rem;
      background: #ffffff;
      color: var(--ink);
      font-size: 0.95rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .wh-marquee__label::after {
      content: '';
      position: absolute;
      left: 100%;
      top: 0;
      bottom: 0;
      width: 2.5rem;
      background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
    }

    @keyframes wh-marquee {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .wh-slide {
        transition: none;
      }

      .wh-marquee__track {
        animation: none;
      }
    }

    /* Mobile: apila. Texto arriba, carrusel, marquee; carrusel en el flujo sin sangrado. */
    @media (max-width: 860px) {
      .wh-bg {
        display: block;
        min-height: 0;
        /* En mobile no se mete detrás del topbar (que es más alto y en columna). */
        margin-top: 0;
        padding-top: clamp(1.5rem, 3vw, 2.25rem);
      }

      .wh-inner {
        min-height: 0;
      }

      .wh-left {
        max-width: none;
      }

      .wh-media {
        position: relative;
        top: auto;
        right: auto;
        width: auto;
        margin: clamp(2rem, 6vw, 2.75rem) clamp(1rem, 3vw, 2.5rem) 0;
        transform: none;
      }
    }
  `
})
export class WebHeroComponent implements AfterViewInit, OnDestroy {
  readonly title = input.required<string>();
  readonly lead = input.required<string>();
  readonly actions = input<HeroAction[]>([]);
  readonly slides = input<HeroSlide[]>([]);
  readonly marquee = input<HeroMarquee | null>(null);

  // Con videos, los usa; sin videos, muestra placeholders numerados para ver la animación.
  protected readonly stageSlides = computed<Slide[]>(() => {
    const sources = this.slides();
    if (sources.length) {
      return sources.map((s) => ({ src: s.src, poster: s.poster, label: '' }));
    }
    return [
      { src: '', poster: '', label: '01' },
      { src: '', poster: '', label: '02' },
      { src: '', poster: '', label: '03' }
    ];
  });

  // Items duplicados 2× para que el loop del marquee sea seamless (translateX 0 → -50%).
  protected readonly marqueeLoop = computed<string[]>(() => {
    const mq = this.marquee();
    return mq ? [...mq.items, ...mq.items] : [];
  });

  protected readonly activeIndex = signal(0);
  // Proporción real del video activo (como el viewer del portafolio): el carrusel se ajusta a ella
  // para no recortar. null = usa el aspect-ratio por defecto del CSS hasta que carga el primer video.
  protected readonly mediaAspect = signal<number | null>(null);

  private static readonly rotateMs = 5200;

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected isHref(link: string): boolean {
    return /^(#|mailto:|tel:|https?:)/.test(link);
  }

  ngAfterViewInit(): void {
    // Video/animaciones son browser-only: no correr en prerender (SSR).
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const count = this.stageSlides().length;
    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.playActive();

    if (count <= 1 || reduced) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.zone.run(() => {
          this.activeIndex.update((index) => (index + 1) % count);
          this.playActive();
        });
      }, WebHeroComponent.rotateMs);
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Solo el recuadro activo reproduce su video (cuando haya videos); los demás se pausan.
  // Reproduce solo el slide activo, reiniciado desde 0; pausa y resetea los demás, así al volver en
  // el loop el video arranca de nuevo en vez de continuar desde donde quedó mientras estaba oculto.
  private playActive(): void {
    const host = this.hostRef.nativeElement as HTMLElement;
    const active = this.activeIndex();
    host.querySelectorAll<HTMLElement>('.wh-slide').forEach((slide, index) => {
      const video = slide.querySelector('video');
      if (index === active) {
        const media = video ?? slide.querySelector('img');
        if (media) {
          this.applyAspect(media);
        }
        if (video) {
          video.muted = true;
          video.currentTime = 0;
          const playback = video.play();
          if (playback && typeof playback.catch === 'function') {
            playback.catch(() => {});
          }
        }
      } else if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }

  // Ajusta el carrusel a la proporción real del media activo (video o imagen) para que no se recorte.
  // Si aún no cargó, espera al evento de carga. zone.run asegura el refresh con OnPush.
  private applyAspect(media: HTMLVideoElement | HTMLImageElement): void {
    const set = (): void => {
      const w = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
      const h = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;
      if (w > 0 && h > 0) {
        this.zone.run(() => this.mediaAspect.set(w / h));
      }
    };
    const ready = media instanceof HTMLVideoElement ? media.readyState >= 1 : media.complete;
    if (ready) {
      set();
    } else {
      media.addEventListener(media instanceof HTMLVideoElement ? 'loadedmetadata' : 'load', set, {
        once: true
      });
    }
  }
}
