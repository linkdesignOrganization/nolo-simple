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
  LucideCalendarClock,
  LucideClipboardList,
  LucideGitCompareArrows,
  LucideGlobe,
  LucideMonitorCog,
  LucideReceipt,
  LucideSmartphone,
  LucideUsers
} from '@lucide/angular';

import { BuildKind } from '../pages/industries-content';

export type BuildCard = { kind: BuildKind; kicker: string; text: string };

/**
 * "Podríamos construir" como scroll horizontal con pin (mismo recurso que /web → web-capabilities):
 * la sección se fija y el track de cards se desliza mientras scrolleás vertical; las cards del centro
 * se ven más nítidas. En mobile/reduced-motion cae a modo "flat": cards apiladas con reveal.
 * Todo gated con isPlatformBrowser (SSG-safe).
 */
@Component({
  selector: 'app-industry-build',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideCalendarClock,
    LucideClipboardList,
    LucideGitCompareArrows,
    LucideGlobe,
    LucideMonitorCog,
    LucideReceipt,
    LucideSmartphone,
    LucideUsers
  ],
  host: { class: 'ibuild' },
  template: `
    <!-- .ibuild-tall crea el rango de scroll vertical que el pin consume como horizontal (alto fijado por JS). -->
    <div class="ibuild-tall">
      <div class="ibuild-pin">
        <div class="ibuild-track">
          @for (item of items(); track $index) {
            <article class="ibuild-card ibuild-anim">
              <div class="ibuild-card__top">
                <span class="ibuild-card__icon" aria-hidden="true">
                  @switch (item.kind) {
                    @case ('internal') { <svg lucideMonitorCog [size]="28" [strokeWidth]="1"></svg> }
                    @case ('portal') { <svg lucideUsers [size]="28" [strokeWidth]="1"></svg> }
                    @case ('mobile') { <svg lucideSmartphone [size]="28" [strokeWidth]="1"></svg> }
                    @case ('billing') { <svg lucideReceipt [size]="28" [strokeWidth]="1"></svg> }
                    @case ('web') { <svg lucideGlobe [size]="28" [strokeWidth]="1"></svg> }
                    @case ('scheduling') { <svg lucideCalendarClock [size]="28" [strokeWidth]="1"></svg> }
                    @case ('records') { <svg lucideClipboardList [size]="28" [strokeWidth]="1"></svg> }
                    @case ('crm') { <svg lucideGitCompareArrows [size]="28" [strokeWidth]="1"></svg> }
                  }
                </span>
                <span class="ibuild-card__num">{{ pad($index + 1) }}</span>
              </div>
              <div class="ibuild-card__main">
                <span class="ibuild-card__kicker">{{ item.kicker }}</span>
                <p class="ibuild-card__text">{{ item.text }}</p>
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
    }

    .ibuild-tall {
      position: relative;
      overflow-anchor: none;
      height: 280vh; /* fallback; el JS lo ajusta a vh + nº cards * VH_PER_CARD * vh */
    }

    .ibuild-pin {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100vw;
      margin-inline: calc(50% - 50vw);
      overflow: hidden;
      display: flex;
      align-items: center;
      /* Fade en los bordes: las cards se desvanecen al entrar/salir por los lados. */
      --ibuild-fade: clamp(1.5rem, 5vw, 5rem);
      -webkit-mask-image: linear-gradient(
        to right,
        transparent 0,
        #000 var(--ibuild-fade),
        #000 calc(100% - var(--ibuild-fade)),
        transparent 100%
      );
      mask-image: linear-gradient(
        to right,
        transparent 0,
        #000 var(--ibuild-fade),
        #000 calc(100% - var(--ibuild-fade)),
        transparent 100%
      );
    }

    .ibuild-track {
      display: flex;
      align-items: stretch;
      padding-inline: clamp(1.5rem, 11vw, 13vw);
      will-change: transform;
    }

    /* Cards conectadas por hairlines (sin relleno, esquinas rectas): grilla de líneas en horizontal.
       Altas (llenan el pin) e icono arriba / texto abajo. */
    .ibuild-card {
      flex: 0 0 auto;
      width: clamp(18rem, 27vw, 24rem);
      min-height: clamp(20rem, 56vh, 30rem);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.5rem;
      padding: clamp(1.6rem, 2.4vw, 2.2rem);
      border: 1px solid var(--line-strong);
    }

    .ibuild-card + .ibuild-card {
      border-left: 0;
    }

    .ibuild-card__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ibuild-card__icon {
      display: inline-flex;
      color: var(--ink);
    }

    .ibuild-card__num {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.78rem;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .ibuild-card__main {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .ibuild-card__kicker {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .ibuild-card__text {
      margin: 0;
      color: var(--ink);
      font-size: 1rem;
      line-height: 1.5;
      text-wrap: pretty;
    }

    .ibuild-anim {
      will-change: opacity;
    }

    /* ── Modo flat (mobile / reduced-motion): sin pin ni hijack; cards apiladas con reveal ───── */
    :host(.ibuild-flat) .ibuild-tall {
      height: auto !important;
    }

    :host(.ibuild-flat) .ibuild-pin {
      position: static;
      height: auto;
      width: auto;
      margin-inline: 0;
      overflow: visible;
      display: block;
      -webkit-mask-image: none;
      mask-image: none;
    }

    :host(.ibuild-flat) .ibuild-track {
      flex-direction: column;
      padding-inline: 0;
      gap: 0;
      transform: none !important;
      will-change: auto;
    }

    :host(.ibuild-flat) .ibuild-card {
      width: auto;
      min-height: auto;
      opacity: 0;
      transform: translateY(26px);
      transition:
        opacity 600ms ease,
        transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Apiladas en vertical: borde compartido arriba. */
    :host(.ibuild-flat) .ibuild-card + .ibuild-card {
      border-left: 1px solid var(--line-strong);
      border-top: 0;
    }

    :host(.ibuild-flat) .ibuild-card.is-in {
      opacity: 1;
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      :host(.ibuild-flat) .ibuild-card {
        transition: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `
})
export class IndustryBuildComponent implements AfterViewInit, OnDestroy {
  readonly items = input.required<BuildCard[]>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private static readonly MOBILE_MAX = 860;

  private tallEl: HTMLElement | null = null;
  private trackEl: HTMLElement | null = null;
  private cardEls: HTMLElement[] = [];
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

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      const host = this.hostRef.nativeElement as HTMLElement;
      this.tallEl = host.querySelector<HTMLElement>('.ibuild-tall');
      this.trackEl = host.querySelector<HTMLElement>('.ibuild-track');
      this.cardEls = Array.from(host.querySelectorAll<HTMLElement>('.ibuild-card'));
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
    return (win ? win.innerWidth : 1280) <= IndustryBuildComponent.MOBILE_MAX;
  }

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
      host.classList.add('ibuild-flat');
      if (this.tallEl) {
        this.tallEl.style.height = '';
      }
      if (this.trackEl) {
        this.trackEl.style.transform = '';
      }
      this.cardEls.forEach((el) => (el.style.opacity = ''));

      if (this.reducedMotion) {
        this.cardEls.forEach((el) => el.classList.add('is-in'));
      } else {
        this.setupReveal();
      }
      return;
    }

    // Hijack (desktop).
    host.classList.remove('ibuild-flat');
    this.observer?.disconnect();
    this.observer = null;
    if (!this.scrollBound) {
      win?.addEventListener('scroll', this.onScroll, { passive: true });
      this.scrollBound = true;
    }
    this.measure();
    this.update();
  }

  // Reveal escalonado por card en modo flat (mobile).
  private setupReveal(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.cardEls.forEach((el) => el.classList.add('is-in'));
      return;
    }
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('is-in');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 }
    );
    this.cardEls.forEach((el) => this.observer!.observe(el));
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

  private measure(): void {
    const win = this.document.defaultView;
    if (!win || !this.tallEl || !this.trackEl) {
      return;
    }
    this.cardLeft = this.cardEls.map((card) => card.offsetLeft);
    this.cardW = this.cardEls.map((card) => card.offsetWidth);
    this.maxX = Math.max(0, this.trackEl.scrollWidth - win.innerWidth);
    const vh = win.innerHeight;
    // Altura del pin atada al desplazamiento real del track (no al nº de cards) → ritmo natural ~1:1.
    const tallPx = vh + this.maxX * 1.25;
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

  // Progreso 0..1 del pin.
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

  // Solo escribe estilos (cero reflow por frame): translateX del track + opacidad por distancia al centro.
  private apply(p: number): void {
    const win = this.document.defaultView;
    if (!win || !this.trackEl) {
      return;
    }
    const vw = win.innerWidth;
    const x = -p * this.maxX;
    this.trackEl.style.transform = `translate3d(${x}px, 0, 0)`;

    this.cardEls.forEach((card, i) => {
      const centerX = this.cardLeft[i] + this.cardW[i] / 2 + x;
      const depth = clamp(1 - Math.abs((centerX - vw / 2) / vw) * 1.5, 0, 1);
      card.style.opacity = `${0.35 + 0.65 * depth}`;
    });
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
