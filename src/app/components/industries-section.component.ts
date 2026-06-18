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
  input
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideArrowUpRight,
  LucideBriefcase,
  LucideDumbbell,
  LucideFactory,
  LucideGraduationCap,
  LucideHeartPulse,
  LucideTruck,
  LucideWrench
} from '@lucide/angular';

import { LanguageService } from '../services/language.service';
import { LocalizeUrlPipe } from '../services/localize-url.pipe';
import { IndustryCard } from '../pages/industries-content';

// Offset (px) al que se pega la primera card (despeja el topbar fijo). Alineado con el sticky del aside.
const STACK_TOP = 96;
// Cada card apilada deja ver este "lomo" de la anterior (mazo de naipes). Suficiente para que se
// lea como tarjeta apilada y no como una línea/rayado.
const STEP = 26;

/**
 * Sección "Industrias" (Pieza 1). Dos columnas: izquierda título+intro (sticky), derecha las cards
 * de industria en mazo sticky+stack (cada card se pega a un `top` acumulado, mecánica calcada de
 * services-stack). Se usa en /software y /web (data es-only) y como cuerpo del índice /industrias.
 */
@Component({
  selector: 'app-industries',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LocalizeUrlPipe,
    LucideArrowUpRight,
    LucideBriefcase,
    LucideDumbbell,
    LucideFactory,
    LucideGraduationCap,
    LucideHeartPulse,
    LucideTruck,
    LucideWrench
  ],
  host: { class: 'industries' },
  template: `
    <div class="ind-grid">
      <aside class="ind-aside">
        <div class="ind-aside__in ind-reveal ind-reveal--up">
          <span class="ind-aside__num">01</span>
          <h2 class="ind-aside__title">{{ heading() }}</h2>
          <p class="ind-aside__intro">{{ intro() }}</p>
          <div class="ind-aside__meta">
            <span class="ind-aside__count">{{ pad(items().length) }} {{ countLabel() }}</span>
            <span class="ind-aside__rule" aria-hidden="true"></span>
          </div>
        </div>
      </aside>

      <div class="ind-stack">
        @for (item of items(); track item.slug; let i = $index) {
          <article class="ind-card ind-reveal" [style.--i]="i">
            <header class="ind-card__top">
              <span class="ind-card__icon" aria-hidden="true">
                @switch (item.icon) {
                  @case ('factory') { <svg lucideFactory [size]="28" [strokeWidth]="1"></svg> }
                  @case ('truck') { <svg lucideTruck [size]="28" [strokeWidth]="1"></svg> }
                  @case ('health') { <svg lucideHeartPulse [size]="28" [strokeWidth]="1"></svg> }
                  @case ('briefcase') { <svg lucideBriefcase [size]="28" [strokeWidth]="1"></svg> }
                  @case ('wrench') { <svg lucideWrench [size]="28" [strokeWidth]="1"></svg> }
                  @case ('dumbbell') { <svg lucideDumbbell [size]="28" [strokeWidth]="1"></svg> }
                  @case ('education') { <svg lucideGraduationCap [size]="28" [strokeWidth]="1"></svg> }
                }
              </span>
              <span class="ind-card__num">{{ pad(i + 1) }}</span>
            </header>

            <a class="ind-card__title-link" [routerLink]="('/industrias/' + item.slug) | localizeUrl">
              <span class="ind-card__title-text">{{ item.name }}</span>
              <span class="ind-card__arrow" aria-hidden="true">
                <svg lucideArrowUpRight [size]="24" [strokeWidth]="1"></svg>
              </span>
            </a>

            <p class="ind-card__copy">{{ item.copy }}</p>

            <div class="ind-card__covers">
              <span class="ind-card__covers-label">{{ coversLabel() }}</span>
              <ul class="ind-card__chips">
                @for (c of item.covers; track c) {
                  <li>{{ c }}</li>
                }
              </ul>
            </div>
          </article>
        }
        <div class="ind-spacer" aria-hidden="true"></div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
      padding: var(--section-py) 0;
    }

    /* Fondo sólido full-bleed: tapa la grilla técnica del shell también en los márgenes. */
    :host::before {
      content: '';
      position: absolute;
      inset: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: var(--surface);
    }

    .ind-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: clamp(2rem, 5vw, 5rem);
      align-items: start; /* requisito del sticky de ambas columnas */
    }

    /* ── Columna izquierda (sticky) ─────────────────────────────────────────── */
    .ind-aside {
      position: sticky;
      top: clamp(5rem, 9vh, 7rem);
      align-self: start;
    }

    .ind-aside__in {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .ind-aside__num {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .ind-aside__title {
      margin: 0;
      color: var(--ink);
      font-size: clamp(2.1rem, 5vw, 4rem);
      font-weight: 400;
      letter-spacing: -0.055em;
      line-height: 1;
      text-wrap: balance;
    }

    .ind-aside__intro {
      margin: 0;
      max-width: 38ch;
      color: var(--muted);
      font-size: 1.02rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    .ind-aside__meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.4rem;
    }

    .ind-aside__count {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.76rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .ind-aside__rule {
      width: 3rem;
      height: 1px;
      background: var(--accent);
    }

    /* ── Columna derecha (mazo sticky+stack) ────────────────────────────────── */
    .ind-stack {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ind-card {
      position: sticky;
      top: 6rem; /* fallback SSG; el JS sobreescribe con STACK_TOP + i*STEP */
      display: flex;
      flex-direction: column;
      gap: 1.05rem;
      padding: clamp(1.6rem, 2.6vw, 2.4rem);
      border: 1px solid var(--line-strong);
      border-radius: 1.1rem;
      background: #fafafa; /* OPACA (y un punto más clara que el fondo): el mazo tapa las de abajo */
      transition: border-color 240ms ease, box-shadow 240ms ease;
    }

    /* Sombra superior: la card de adelante proyecta sobre el lomo de la de atrás → profundidad de mazo. */
    .ind-card + .ind-card {
      box-shadow: 0 -10px 24px -8px rgba(17, 17, 17, 0.12);
    }

    .ind-card:hover {
      border-color: var(--ink);
    }

    .ind-card__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ind-card__icon {
      display: inline-flex;
      color: var(--ink);
      transition: color 200ms ease;
    }

    .ind-card:hover .ind-card__icon {
      color: var(--accent);
    }

    .ind-card__num {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .ind-card__title-link {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      width: fit-content;
      color: var(--ink);
      text-decoration: none;
    }

    .ind-card__title-text {
      position: relative;
      font-size: clamp(1.5rem, 3.2vw, 2.1rem);
      font-weight: 400;
      letter-spacing: -0.04em;
      line-height: 1.05;
    }

    .ind-card__title-text::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -0.06em;
      height: 2px;
      background: var(--accent);
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .ind-card__arrow {
      display: inline-flex;
      flex-shrink: 0;
      color: var(--muted);
      transition: color 200ms ease, transform 200ms ease;
    }

    .ind-card__title-link:hover .ind-card__title-text::after,
    .ind-card__title-link:focus-visible .ind-card__title-text::after {
      transform: scaleX(1);
    }

    .ind-card__title-link:hover .ind-card__arrow,
    .ind-card__title-link:focus-visible .ind-card__arrow {
      color: var(--accent);
      transform: translate(2px, -2px);
    }

    .ind-card__title-link:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
      border-radius: 2px;
    }

    .ind-card__copy {
      margin: 0;
      max-width: 52ch;
      color: #3a3a3a;
      font-size: 1.02rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    .ind-card__covers {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .ind-card__covers-label {
      color: #9a9a9a;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .ind-card__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    /* Chips neutros (el azul se reserva para acentos reales: subrayado del título, flecha en hover,
       el filete del aside, CTAs). Texto en tinta → buen contraste. */
    .ind-card__chips li {
      padding: 0.45rem 0.66rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(17, 17, 17, 0.09);
      background: rgba(17, 17, 17, 0.045);
      color: #3a3a3a;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      line-height: 1;
      text-transform: uppercase;
    }

    /* ── Reveals (SSG-safe; el TS agrega .is-in vía IO, o de inmediato si no hay IO) ───── */
    .ind-reveal {
      opacity: 0;
      transition: opacity 600ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* En las cards el reveal es solo opacidad (no transform → no pelea con position:sticky). */
    .ind-card.ind-reveal {
      transition-delay: calc(var(--i, 0) * 70ms);
    }

    .ind-reveal--up {
      transform: translateY(24px);
    }

    .ind-reveal.is-in {
      opacity: 1;
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .ind-reveal {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }

    /* ── Mobile / tablet: una columna, sin mazo ─────────────────────────────── */
    @media (max-width: 1024px) {
      .ind-grid {
        grid-template-columns: 1fr;
        gap: clamp(1.5rem, 5vw, 2.5rem);
      }

      .ind-aside {
        position: static;
      }

      .ind-stack {
        gap: clamp(1.25rem, 5vw, 1.85rem);
      }

      .ind-card {
        position: static;
      }

      .ind-card + .ind-card {
        box-shadow: none;
      }

      .ind-spacer {
        display: none;
      }
    }

    @media (max-width: 760px) {
      .ind-card {
        padding: 1.4rem;
      }
    }
  `
})
export class IndustriesSectionComponent implements AfterViewInit, OnDestroy {
  readonly heading = input.required<string>();
  readonly intro = input.required<string>();
  readonly items = input.required<IndustryCard[]>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly i18n = inject(LanguageService);

  private resizeObserver: ResizeObserver | null = null;
  private io: IntersectionObserver | null = null;
  private lastWidth = 0;

  protected readonly coversLabel = computed(() => (this.i18n.lang() === 'en' ? 'Covers' : 'Cubre'));
  protected readonly countLabel = computed(() => (this.i18n.lang() === 'en' ? 'industries' : 'industrias'));

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const host = this.hostRef.nativeElement as HTMLElement;

    // Reveals: IO agrega .is-in al entrar; si no hay IO, se muestran de inmediato (degradación).
    const revealEls = host.querySelectorAll<HTMLElement>('.ind-reveal');
    if (typeof IntersectionObserver === 'undefined') {
      revealEls.forEach((el) => el.classList.add('is-in'));
    } else {
      this.io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add('is-in');
              this.io?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.12 }
      );
      revealEls.forEach((el) => this.io!.observe(el));
    }

    // Mazo sticky: igual que services-stack, fuera de Angular y recalculando solo en cambios de ancho.
    this.zone.runOutsideAngular(() => {
      this.lastWidth = host.getBoundingClientRect().width;
      this.layoutStack();

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver((entries) => {
          const width = entries[0]?.contentRect.width ?? this.lastWidth;
          if (Math.abs(width - this.lastWidth) < 1) {
            return;
          }
          this.lastWidth = width;
          requestAnimationFrame(() => this.layoutStack());
        });
        this.resizeObserver.observe(host);
      }
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.io?.disconnect();
    this.io = null;
  }

  // Cada card se pega a un top acumulado (STACK_TOP + i*STEP) → mazo. Se setea SIEMPRE (sin depender
  // de innerWidth, que en la carga inicial podía leerse en transición): en mobile el CSS pone las cards
  // en `position: static` (el top inline se ignora) y oculta el spacer. Mismo enfoque que services-stack.
  private layoutStack(): void {
    const host = this.hostRef.nativeElement as HTMLElement;
    const cards = host.querySelectorAll<HTMLElement>('.ind-card');

    cards.forEach((card, i) => {
      card.style.top = `${STACK_TOP + i * STEP}px`;
    });

    // Cola para que la última card termine de apilarse antes de soltar la sección (oculta en mobile por CSS).
    const spacer = host.querySelector<HTMLElement>('.ind-spacer');
    if (spacer) {
      const last = cards[cards.length - 1];
      spacer.style.height = last ? `${last.offsetHeight}px` : '0px';
    }
  }
}
