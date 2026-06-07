import { DOCUMENT } from '@angular/common';
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
import {
  LucideBlocks,
  LucideBuilding2,
  LucideCloudCheck,
  LucideCloudSync,
  LucideGitCompareArrows,
  LucideGlobeCheck,
  LucideLayoutTemplate,
  LucideMonitorSmartphone,
  LucideSearchCheck,
  LucideShieldCheck,
  LucideUserRoundKey,
  LucideUsers,
  LucideWorkflow
} from '@lucide/angular';

export type ShowcaseIcon =
  | 'globe-check'
  | 'monitor-smartphone'
  | 'layout-template'
  | 'cloud-sync'
  | 'users'
  | 'shield-check'
  | 'blocks'
  | 'cloud-check'
  | 'git-compare-arrows'
  | 'workflow'
  | 'building-2'
  | 'user-round-key'
  | 'search-check';

export type ShowcaseFeature = {
  icon: ShowcaseIcon;
  label: string;
};

type CardPos = { x: number; y: number };

@Component({
  selector: 'app-feature-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideGlobeCheck,
    LucideMonitorSmartphone,
    LucideLayoutTemplate,
    LucideCloudSync,
    LucideUsers,
    LucideShieldCheck,
    LucideBlocks,
    LucideCloudCheck,
    LucideGitCompareArrows,
    LucideWorkflow,
    LucideBuilding2,
    LucideUserRoundKey,
    LucideSearchCheck
  ],
  host: {
    'class': 'feature-showcase'
  },
  template: `
    <div class="fs-stage">
      <h2 class="fs-title">{{ title() }}</h2>

      @for (f of features(); track f.label) {
        <article class="fs-card">
          <span class="fs-card__label">{{ f.label }}</span>
          <span class="fs-card__box" aria-hidden="true">
            @switch (f.icon) {
              @case ('globe-check') {
                <svg lucideGlobeCheck [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('monitor-smartphone') {
                <svg lucideMonitorSmartphone [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('layout-template') {
                <svg lucideLayoutTemplate [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('cloud-sync') {
                <svg lucideCloudSync [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('users') {
                <svg lucideUsers [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('shield-check') {
                <svg lucideShieldCheck [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('blocks') {
                <svg lucideBlocks [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('cloud-check') {
                <svg lucideCloudCheck [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('git-compare-arrows') {
                <svg lucideGitCompareArrows [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('workflow') {
                <svg lucideWorkflow [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('building-2') {
                <svg lucideBuilding2 [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('user-round-key') {
                <svg lucideUserRoundKey [size]="30" [strokeWidth]="1.25"></svg>
              }
              @case ('search-check') {
                <svg lucideSearchCheck [size]="30" [strokeWidth]="1.25"></svg>
              }
            }
          </span>
        </article>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
      color: #ffffff;
    }

    /* Fondo full-bleed que toma el color del sitio (--surface): claro al inicio y negro
       cuando la sección activa el tema oscuro de la página. (La sección project-stages
       sigue debajo y lleva su propio fondo hasta el fin de la página.) Opaco a propósito:
       tapa la grilla técnica del .shell que va detrás de todo. */
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

    .fs-stage {
      position: relative;
      width: 100vw;
      margin-inline: calc(50% - 50vw);
      min-height: 100vh;
      overflow: clip;
    }

    .fs-title {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(90vw, 36rem);
      margin: 0;
      text-align: center;
      color: #ffffff;
      font-size: clamp(1.7rem, 3vw, 2.8rem);
      font-weight: 500;
      letter-spacing: -0.035em;
      line-height: 1.07;
      text-wrap: balance;
    }

    .fs-card {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.55rem;
      /* el JS setea left/top (layout por viewport) y translate (progreso de scroll) */
      will-change: transform;
    }

    .fs-card__label {
      color: var(--accent);
      font-size: clamp(0.78rem, 1vw, 0.92rem);
      font-weight: 500;
      letter-spacing: -0.01em;
      line-height: 1;
      white-space: nowrap;
    }

    .fs-card__box {
      display: grid;
      place-items: center;
      width: clamp(44px, 5vw, 66px);
      height: clamp(44px, 5vw, 66px);
      border: 1.5px solid var(--accent);
      border-radius: 9px;
      color: #ffffff;
    }

    .fs-card__box svg {
      width: clamp(22px, 2.4vw, 30px);
      height: clamp(22px, 2.4vw, 30px);
    }

    /* Mobile = misma constelación (otro set de posiciones), título compacto. */
    @media (max-width: 760px) {
      .fs-title {
        width: min(62vw, 16rem);
        font-size: clamp(1.1rem, 4.5vw, 1.6rem);
        letter-spacing: -0.02em;
        line-height: 1.12;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .fs-card {
        transform: none !important;
      }
    }
  `
})
export class FeatureShowcaseComponent implements AfterViewInit, OnDestroy {
  readonly title = input.required<string>();
  readonly features = input.required<ShowcaseFeature[]>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);

  // Posiciones (en %) en el orden de la tabla del spec.
  // Desktop (landscape): constelación amplia a los lados del título.
  private readonly posDesktop: CardPos[] = [
    { x: 24, y: 9 }, //  0 Online
    { x: 8, y: 24 }, //  1 Responsive
    { x: 55, y: 8 }, //  2 A medida
    { x: 79, y: 11 }, //  3 Tiempo real
    { x: 81, y: 64 }, //  4 Multi usuario
    { x: 62, y: 75 }, //  5 Seguro
    { x: 33, y: 77 }, //  6 Escalable
    { x: 78, y: 30 }, //  7 Cloud
    { x: 44, y: 4 }, //  8 API
    { x: 49, y: 71 }, //  9 Integraciones
    { x: 17, y: 64 }, // 10 Multi sede
    { x: 6, y: 46 }, // 11 Roles
    { x: 9, y: 82 } // 12 Trazable
  ];

  // Mobile (portrait): cards repartidas en banda superior e inferior; el título compacto
  // ocupa el centro y solo deja a media altura el sliver izquierdo (label corto).
  private readonly posMobile: CardPos[] = [
    { x: 18, y: 11 }, //  0 Online
    { x: 12, y: 30 }, //  1 Responsive
    { x: 66, y: 9 }, //  2 A medida
    { x: 78, y: 21 }, //  3 Tiempo real
    { x: 74, y: 62 }, //  4 Multi usuario
    { x: 66, y: 77 }, //  5 Seguro
    { x: 34, y: 75 }, //  6 Escalable
    { x: 56, y: 28 }, //  7 Cloud
    { x: 42, y: 4 }, //  8 API
    { x: 52, y: 88 }, //  9 Integraciones
    { x: 14, y: 66 }, // 10 Multi sede
    { x: 4, y: 40 }, // 11 Roles
    { x: 26, y: 88 } // 12 Trazable
  ];

  private static readonly SPREAD = 0.55;
  private static readonly RANGE = 0.85;
  // Acerca las cards al título central (1 = posiciones tal cual; <1 = más juntas).
  private static readonly COMPRESS = 0.85;
  private static readonly MOBILE_MAX = 760;

  private cardEls: HTMLElement[] = [];
  private titleEl: HTMLElement | null = null;
  private rafId: number | null = null;
  private reducedMotion = false;
  private readonly onScroll = (): void => this.requestUpdate();
  private readonly onResize = (): void => {
    this.layout();
    this.requestUpdate();
  };

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const host = this.hostRef.nativeElement as HTMLElement;
      this.cardEls = Array.from(host.querySelectorAll<HTMLElement>('.fs-card'));
      this.titleEl = host.querySelector<HTMLElement>('.fs-title');
      this.reducedMotion =
        typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.layout();

      // Siempre escuchamos el scroll: aunque se reduzca el movimiento (cards quietas),
      // el cambio de tema oscuro de la página debe seguir ocurriendo al entrar.
      const win = this.document.defaultView;
      win?.addEventListener('scroll', this.onScroll, { passive: true });
      win?.addEventListener('resize', this.onResize, { passive: true });
      this.update();
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

  private positions(): CardPos[] {
    const win = this.document.defaultView;
    const w = win ? win.innerWidth : 1280;
    return w <= FeatureShowcaseComponent.MOBILE_MAX ? this.posMobile : this.posDesktop;
  }

  // Ubica cada card en su % (left/top) según el viewport actual. En desktop se comprime
  // hacia el centro para acercar los recuadros al título; en mobile (portrait, ya
  // apretado) se usan las posiciones tal cual.
  private layout(): void {
    const win = this.document.defaultView;
    const mobile = (win ? win.innerWidth : 1280) <= FeatureShowcaseComponent.MOBILE_MAX;
    const pos = mobile ? this.posMobile : this.posDesktop;
    const k = mobile ? 1 : FeatureShowcaseComponent.COMPRESS;
    this.cardEls.forEach((el, i) => {
      const p = pos[i] ?? pos[pos.length - 1];
      el.style.left = `${50 + (p.x - 50) * k}%`;
      el.style.top = `${50 + (p.y - 50) * k}%`;
    });
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

  // Progreso 0..1 de la entrada de la sección: 0 cuando asoma por abajo, 1 cuando casi
  // llena el viewport (y se mantiene en 1 al seguir subiendo → reversible al bajar).
  private update(): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }
    const rect = this.hostRef.nativeElement.getBoundingClientRect();
    const vh = win.innerHeight;
    const p = clamp((vh - rect.top) / (vh * FeatureShowcaseComponent.RANGE), 0, 1);
    this.apply(this.reducedMotion ? 1 : p);
  }

  // Mueve cada card desde "afuera" (vector desde el centro) hacia su lugar (translate 0).
  private apply(p: number): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }
    const vw = win.innerWidth;
    const vh = win.innerHeight;
    const pos = this.positions();
    const spread = FeatureShowcaseComponent.SPREAD;
    const away = 1 - p;

    this.cardEls.forEach((el, i) => {
      const posn = pos[i] ?? pos[pos.length - 1];
      const dx = ((posn.x - 50) / 50) * vw * spread * away;
      const dy = ((posn.y - 50) / 50) * vh * spread * away;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    if (this.titleEl) {
      this.titleEl.style.opacity = `${0.15 + 0.85 * p}`;
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
