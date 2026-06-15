import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  computed,
  effect,
  inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  LucideCheck,
  LucideCircleCheck,
  LucideCircleOff,
  LucideGitCompareArrows,
  LucideWorkflow
} from '@lucide/angular';

import { ContactFooterComponent, ContactInfo, SystemContext } from '../components/contact-footer.component';
import { FaqAccordionComponent } from '../components/faq-accordion.component';
import { DarkZoneDirective } from '../directives/dark-zone.directive';
import { LanguageService } from '../services/language.service';
import { getSystemDetail } from './systems-content';

// Página de detalle de un sistema de software (/software/:slug). Página "terminal":
// header simplificado (backOnly, resuelto en app.ts/app.html), artefacto de grilla del shell
// en el hero, y el footer del sitio al cierre. Sin imágenes ni videos: layout + iconografía.
@Component({
  selector: 'app-system-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ContactFooterComponent,
    FaqAccordionComponent,
    DarkZoneDirective,
    LucideCheck,
    LucideCircleCheck,
    LucideCircleOff,
    LucideGitCompareArrows,
    LucideWorkflow
  ],
  template: `
    @if (d(); as s) {
      <article class="sd">
        <!-- HERO: nombre del sistema sobre el artefacto del shell -->
        <header class="sd-hero">
          <p class="sd-hero__eyebrow">{{ t().eyebrow }}</p>
          <h1 class="sd-hero__title">{{ s.name }}</h1>
        </header>

        <!-- 01 — Qué es (statement) -->
        <section class="sd-section sd-statement">
          <span class="sd-num">01</span>
          <div class="sd-statement__body">
            <h2 class="sd-label">{{ t().whatIs }}</h2>
            @for (p of paragraphs(s.whatItIs); track $index) {
              <p class="sd-statement__text">{{ p }}</p>
            }
          </div>
        </section>

        <!-- 02 — Qué problema resuelve (dolor → resolución) -->
        <section class="sd-section sd-two">
          <header class="sd-section__head">
            <span class="sd-num">02</span>
            <h2 class="sd-label">{{ t().problem }}</h2>
          </header>
          <div class="sd-two__grid">
            <div class="sd-two__col">
              <span class="sd-two__icon sd-icon--accent" aria-hidden="true">
                <svg lucideCircleCheck [size]="26" [strokeWidth]="1"></svg>
              </span>
              <p>{{ s.problem[0] }}</p>
            </div>
            <div class="sd-two__col">
              <span class="sd-two__icon sd-icon--accent" aria-hidden="true">
                <svg lucideCircleCheck [size]="26" [strokeWidth]="1"></svg>
              </span>
              <p>{{ s.problem[1] }}</p>
            </div>
          </div>
        </section>

        <!-- 03 — Cuándo tiene sentido (2 "sí" + 1 "todavía no") -->
        <section class="sd-section sd-fit sd-reveal">
          <header class="sd-section__head">
            <span class="sd-num">03</span>
            <h2 class="sd-label">{{ t().whenItFits }}</h2>
          </header>
          <div class="sd-fit__grid">
            @for (f of s.whenItFits.fits; track $index) {
              <article class="sd-card">
                <span class="sd-card__icon sd-icon--accent" aria-hidden="true">
                  <svg lucideCircleCheck [size]="28" [strokeWidth]="1"></svg>
                </span>
                <span class="sd-card__tag">{{ t().fitsTag }}</span>
                <p>{{ f }}</p>
              </article>
            }
            <article class="sd-card sd-card--muted">
              <span class="sd-card__icon sd-icon--muted" aria-hidden="true">
                <svg lucideCircleOff [size]="28" [strokeWidth]="1"></svg>
              </span>
              <span class="sd-card__tag">{{ t().notYetTag }}</span>
              <p>{{ s.whenItFits.notYet }}</p>
            </article>
          </div>
        </section>

        <!-- 04 — Qué hace (5 bullets acción + beneficio) -->
        <section class="sd-section sd-does sd-reveal">
          <header class="sd-section__head">
            <span class="sd-num">04</span>
            <h2 class="sd-label">{{ t().doFeatures }}</h2>
          </header>
          <ul class="sd-does__list">
            @for (feat of s.doFeatures; track $index) {
              <li class="sd-does__item">
                <span class="sd-does__n">{{ pad($index + 1) }}</span>
                <span class="sd-does__icon sd-icon--accent" aria-hidden="true">
                  <svg lucideCheck [size]="18" [strokeWidth]="1.5"></svg>
                </span>
                <span class="sd-does__text">
                  <span class="sd-does__action">{{ feat.action }}</span>
                  @if (feat.benefit) {
                    <span class="sd-does__benefit">{{ feat.benefit }}</span>
                  }
                </span>
              </li>
            }
          </ul>
        </section>

        <!-- 05 — Con qué se conecta (2 columnas) -->
        <section class="sd-section sd-connect">
          <header class="sd-section__head">
            <span class="sd-num">05</span>
            <h2 class="sd-label">{{ t().connects }}</h2>
          </header>
          <div class="sd-connect__grid">
            <div class="sd-connect__col">
              <span class="sd-connect__icon sd-icon--ink" aria-hidden="true">
                <svg lucideWorkflow [size]="34" [strokeWidth]="1"></svg>
              </span>
              <p>{{ s.connects[0] }}</p>
            </div>
            <div class="sd-connect__col">
              <span class="sd-connect__icon sd-icon--muted" aria-hidden="true">
                <svg lucideGitCompareArrows [size]="34" [strokeWidth]="1"></svg>
              </span>
              <p>{{ s.connects[1] }}</p>
            </div>
          </div>
        </section>

        <!-- 06 + 07 — Zona oscura: Qué no es / Cómo lo construimos -->
        <div class="sd-dark" appDarkZone>
          <section class="sd-section sd-not">
            <header class="sd-section__head">
              <span class="sd-num">06</span>
              <h2 class="sd-label">{{ t().notWhat }}</h2>
            </header>
            <div class="sd-not__grid">
              @for (n of s.notWhat; track $index) {
                <article class="sd-panel">
                  <span class="sd-panel__icon" aria-hidden="true">
                    <svg lucideCircleOff [size]="26" [strokeWidth]="1"></svg>
                  </span>
                  <p>{{ n }}</p>
                </article>
              }
            </div>
          </section>

          <section class="sd-section sd-build sd-reveal">
            <header class="sd-section__head">
              <span class="sd-num">07</span>
              <h2 class="sd-label">{{ t().howWeBuild }}</h2>
            </header>
            <ol class="sd-build__steps">
              @for (step of s.howWeBuild; track $index) {
                <li class="sd-build__step">
                  <span class="sd-build__n">{{ pad($index + 1) }}</span>
                  <p>{{ step }}</p>
                </li>
              }
            </ol>
          </section>

          <!-- 08 — Verlo funcionando (cierre + CTA): dentro de la zona oscura, así el sitio
               se queda oscuro desde "Qué no es" hasta el footer (un solo cambio de color). -->
          <section class="sd-section sd-see">
            <header class="sd-section__head">
              <span class="sd-num">08</span>
              <h2 class="sd-label">{{ t().seeItWork }}</h2>
            </header>
            <div class="sd-see__grid">
              <div class="sd-see__text">
                <p>{{ s.seeItWork[0] }}</p>
                <p>{{ s.seeItWork[1] }}</p>
              </div>
              <div class="sd-see__action">
                <p class="sd-see__cta-line">{{ s.seeItWork[2] }}</p>
                <a class="button sd-see__cta" href="#hablemos" (click)="goToContact($event)">
                  <span>{{ t().cta }}</span>
                  <span class="button-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </section>

          <!-- 09 — Preguntas frecuentes (dentro de la zona oscura: el sitio queda oscuro
               desde "Qué no es" hasta el footer, un solo cambio de color). -->
          <app-faq-accordion [heading]="t().faq" [items]="s.faq" />
        </div>
      </article>

      <app-contact-footer appDarkZone id="hablemos" [info]="info" [systemContext]="systemContext()" />
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .sd {
      display: block;
    }

    /* Cada sección de contenido tapa el artefacto del shell con un fondo full-bleed opaco,
       igual que services-stack / faq. El hero NO lo lleva → deja ver la grilla. */
    .sd-section {
      position: relative;
      z-index: 1;
      padding-block: var(--section-py);
    }

    .sd-section::before {
      content: '';
      position: absolute;
      inset: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: var(--surface);
      transition: background-color 450ms ease;
    }

    /* ── HERO ─────────────────────────────────────────────────────────────── */
    .sd-hero {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: clamp(20rem, 42vh, 30rem);
      padding-block: clamp(2.5rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem);
    }

    /* Gradiente al pie del hero: funde el artefacto (grilla) hacia el gris de la primera
       sección, suavizando la transición. Detrás del texto del hero. */
    .sd-hero::after {
      content: '';
      position: absolute;
      left: calc(50% - 50vw);
      bottom: 0;
      width: 100vw;
      height: clamp(4rem, 9vw, 8rem);
      z-index: -1;
      pointer-events: none;
      background: linear-gradient(180deg, transparent, var(--surface));
    }

    .sd-hero__eyebrow {
      margin: 0 0 1rem;
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .sd-hero__title {
      margin: 0;
      max-width: 18ch;
      color: var(--ink);
      font-size: var(--hero-title-size);
      font-weight: var(--hero-title-weight);
      letter-spacing: var(--hero-title-tracking);
      line-height: var(--hero-title-leading);
    }

    /* ── Rótulos / números de sección ─────────────────────────────────────── */
    .sd-num {
      display: block;
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .sd-label {
      margin: 0;
      color: var(--ink);
      font-size: clamp(1.5rem, 3vw, 2.1rem);
      font-weight: 400;
      letter-spacing: -0.04em;
      line-height: 1.05;
    }

    .sd-section__head {
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 1fr);
      align-items: baseline;
      gap: 1rem;
      margin-bottom: clamp(1.8rem, 3.5vw, 3rem);
    }

    .sd-icon--accent { color: var(--accent); }
    .sd-icon--muted { color: var(--muted); }
    .sd-icon--ink { color: var(--ink); }

    /* ── 01 Statement ─────────────────────────────────────────────────────── */
    .sd-statement {
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 1fr);
      gap: 1rem;
    }

    .sd-statement__body {
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
      max-width: 48rem;
    }

    .sd-statement .sd-label {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .sd-statement__text {
      margin: 0;
      color: var(--ink);
      font-size: clamp(1.4rem, 2.5vw, 2.05rem);
      font-weight: 400;
      letter-spacing: -0.03em;
      line-height: 1.3;
      text-wrap: pretty;
    }

    /* ── 02 / 05 Dos columnas ─────────────────────────────────────────────── */
    .sd-two__grid,
    .sd-connect__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(2rem, 4vw, 4rem);
    }

    .sd-two__col,
    .sd-connect__col {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      max-width: 46ch;
    }

    .sd-two__col p,
    .sd-connect__col p {
      margin: 0;
      color: var(--muted);
      font-size: 1.08rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    .sd-two__icon,
    .sd-connect__icon {
      display: inline-flex;
    }

    /* ── 03 Cuándo tiene sentido (cards) ──────────────────────────────────── */
    .sd-fit__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(1rem, 2vw, 1.5rem);
    }

    .sd-card {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      padding: clamp(1.4rem, 2.2vw, 2rem);
      border: 1px solid var(--line);
      border-radius: 0.9rem;
      background: #fafafa;
    }

    .sd-card--muted {
      background: transparent;
      border-style: dashed;
    }

    .sd-card__icon {
      display: inline-flex;
    }

    .sd-card__tag {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .sd-card p {
      margin: 0;
      color: var(--ink);
      font-size: 1.05rem;
      line-height: 1.5;
      text-wrap: pretty;
    }

    .sd-card--muted p {
      color: var(--muted);
    }

    /* ── 04 Qué hace (lista numerada acción + beneficio) ──────────────────── */
    .sd-does__list {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .sd-does__item {
      display: grid;
      grid-template-columns: 2.6rem 1.6rem minmax(0, 1fr);
      align-items: start;
      gap: 1rem;
      padding: clamp(1.2rem, 2vw, 1.6rem) 0;
      border-top: 1px solid var(--line);
    }

    .sd-does__item:last-child {
      border-bottom: 1px solid var(--line);
    }

    .sd-does__n {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      line-height: 1.6;
    }

    .sd-does__icon {
      display: inline-flex;
      padding-top: 0.15rem;
    }

    .sd-does__text {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .sd-does__action {
      color: var(--ink);
      font-size: 1.12rem;
      font-weight: 500;
      letter-spacing: -0.01em;
      line-height: 1.35;
    }

    .sd-does__benefit {
      color: var(--muted);
      font-size: 1rem;
      line-height: 1.5;
    }

    /* ── 06 + 07 Zona oscura ──────────────────────────────────────────────── */
    .sd-dark .sd-label {
      color: #f4f4f4;
    }

    .sd-dark .sd-num,
    .sd-dark .sd-build__n {
      color: rgba(255, 255, 255, 0.5);
    }

    .sd-not__grid {
      display: flex;
      flex-direction: column;
    }

    .sd-panel {
      display: flex;
      align-items: flex-start;
      gap: 1.1rem;
      padding: clamp(1.4rem, 2.4vw, 2rem);
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: #161616;
    }

    .sd-panel:first-child {
      border-radius: 0.9rem 0.9rem 0 0;
    }

    .sd-panel + .sd-panel {
      border-top: 0;
      border-radius: 0 0 0.9rem 0.9rem;
    }

    .sd-panel__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.55);
      padding-top: 0.1rem;
    }

    .sd-panel p {
      margin: 0;
      color: #f4f4f4;
      font-size: 1.05rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    .sd-build__steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(1.5rem, 3vw, 2.5rem);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .sd-build__step {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      padding-top: 1.2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.16);
    }

    .sd-build__n {
      font-family: var(--font-mono);
      font-size: clamp(2.4rem, 4vw, 3.4rem);
      font-weight: 400;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .sd-build__step p {
      margin: 0;
      color: #f4f4f4;
      font-size: 1.02rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    /* ── 08 Verlo funcionando (cierre + CTA): en la zona oscura, a 2 columnas ──── */
    .sd-see__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(2rem, 4vw, 4rem);
      align-items: start;
    }

    .sd-see__text {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      max-width: 46ch;
    }

    .sd-see__text p {
      margin: 0;
      color: #f4f4f4;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .sd-see__action {
      display: flex;
      flex-direction: column;
      gap: 1.3rem;
      align-items: flex-start;
    }

    .sd-see__cta-line {
      margin: 0;
      color: rgba(255, 255, 255, 0.55);
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .sd-see__cta {
      align-self: flex-start;
    }

    /* ── Reveal on scroll (guardado en TS con isPlatformBrowser para el SSG) ── */
    .sd-reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 600ms ease, transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .sd-reveal.is-in {
      opacity: 1;
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .sd-reveal {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }

    /* ── Responsive ───────────────────────────────────────────────────────── */
    @media (max-width: 900px) {
      .sd-fit__grid,
      .sd-build__steps {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      .sd-two__grid,
      .sd-connect__grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .sd-section__head {
        grid-template-columns: 2rem minmax(0, 1fr);
        gap: 0.75rem;
      }

      .sd-statement {
        grid-template-columns: 1fr;
        gap: 1.2rem;
      }

      .sd-does__item {
        grid-template-columns: 1.6rem minmax(0, 1fr);
        gap: 0.7rem 0.8rem;
      }

      .sd-does__n {
        grid-row: 1;
      }

      .sd-does__icon {
        display: none;
      }

      .sd-see__grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .sd-dark .sd-panel p,
      .sd-dark .sd-build__step p,
      .sd-dark .sd-see__text p {
        color: #f4f4f4;
      }
    }
  `
})
export class SystemDetailPageComponent implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly i18n = inject(LanguageService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly lang = this.i18n.lang;

  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug'))), {
    initialValue: this.route.snapshot.paramMap.get('slug')
  });

  // Contenido resuelto por slug + idioma. null si el slug no existe.
  protected readonly d = computed(() => getSystemDetail(this.slug(), this.lang()));

  protected readonly t = computed(() => SECTION_LABELS[this.lang()]);

  // Contexto para el footer: identifica del lado del CRM qué sistema veía el lead (nombre
  // resuelto al idioma activo + slug). Reactivo al toggle de idioma vía d().
  protected readonly systemContext = computed<SystemContext | null>(() => {
    const s = this.d();
    const slug = this.slug();
    return s && slug ? { name: s.name, slug } : null;
  });

  // Footer del sitio (mismos datos que contact-page).
  protected readonly info: ContactInfo = {
    email: 'hola@nolo.ar',
    whatsappLink: 'https://wa.me/5491133337180',
    calendarLink: 'https://cal.com/nolo.ar/reunion-con-equipo-nolo',
    calendarLinkEn: 'https://cal.com/nolo.ar/meeting-with-nolo-team',
    location: 'Buenos Aires, Argentina'
  };

  private observer: IntersectionObserver | null = null;

  constructor() {
    // Slug inexistente → 404 con marca (Nolo ya tiene su propia página /404).
    effect(() => {
      if (this.slug() !== null && this.d() === null) {
        this.router.navigateByUrl('/404', { replaceUrl: true });
      }
    });
  }

  // Índice con cero a la izquierda (01, 02, …).
  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // Divide un campo en párrafos (el "Qué es" del ticketing trae 2, separados por \n\n).
  protected paragraphs(text: string): string[] {
    return text.split('\n\n');
  }

  // CTA "Escribinos": scroll suave al formulario del footer (#hablemos), sin navegar.
  protected goToContact(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    event.preventDefault();
    document.getElementById('hablemos')?.scrollIntoView({ behavior: 'smooth' });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    this.host.nativeElement
      .querySelectorAll('.sd-reveal')
      .forEach((el: Element) => this.observer?.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}

// Rótulos de UI (nombres de las 9 secciones del .md + textos de interfaz). No es copy nuevo:
// son los encabezados ### del documento aprobado, usados como títulos de sección.
const SECTION_LABELS = {
  es: {
    eyebrow: 'Software a medida',
    whatIs: 'Qué es',
    problem: 'Qué problema resuelve',
    whenItFits: 'Cuándo tiene sentido',
    doFeatures: 'Qué hace',
    connects: 'Con qué se conecta',
    notWhat: 'Qué no es',
    howWeBuild: 'Cómo lo construimos',
    seeItWork: 'Verlo funcionando',
    faq: 'Preguntas frecuentes',
    fitsTag: 'Tiene sentido',
    notYetTag: 'Todavía no',
    cta: 'Escribinos'
  },
  en: {
    eyebrow: 'Custom software',
    whatIs: 'What it is',
    problem: 'The problem it solves',
    whenItFits: 'When it makes sense',
    doFeatures: 'What it does',
    connects: 'What it connects with',
    notWhat: 'What it is not',
    howWeBuild: 'How we build it',
    seeItWork: 'Seeing it work',
    faq: 'Frequently asked questions',
    fitsTag: 'It makes sense',
    notYetTag: 'Not yet',
    cta: 'Get in touch'
  }
} as const;
