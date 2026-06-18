import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
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
  LucideBriefcase,
  LucideCalendarClock,
  LucideClipboardList,
  LucideCode,
  LucideDumbbell,
  LucideFactory,
  LucideGitCompareArrows,
  LucideGlobe,
  LucideGraduationCap,
  LucideHandshake,
  LucideHeartPulse,
  LucideMonitorCog,
  LucideReceipt,
  LucideSmartphone,
  LucideTruck,
  LucideUserRound,
  LucideUsers,
  LucideWrench
} from '@lucide/angular';

import { ContactFooterComponent, ContactInfo, SystemContext } from '../components/contact-footer.component';
import { DarkZoneDirective } from '../directives/dark-zone.directive';
import { LanguageService } from '../services/language.service';
import { BuildKind, getIndustryDetail } from './industries-content';

// Página de detalle de una industria (/industrias/:slug). Página "terminal": header backOnly
// (resuelto en app.ts/app.html), artefacto de grilla del shell en el hero, footer al cierre.
// Layout PROPIO (no reusa el de /software/:slug): guiado por el lenguaje de los landings.
// Sin imágenes: tipografía + iconos + color de marca + zonas oscuras + reveals.
@Component({
  selector: 'app-industry-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ContactFooterComponent,
    DarkZoneDirective,
    LucideBriefcase,
    LucideCalendarClock,
    LucideClipboardList,
    LucideCode,
    LucideDumbbell,
    LucideFactory,
    LucideGitCompareArrows,
    LucideGlobe,
    LucideGraduationCap,
    LucideHandshake,
    LucideHeartPulse,
    LucideMonitorCog,
    LucideReceipt,
    LucideSmartphone,
    LucideTruck,
    LucideUserRound,
    LucideUsers,
    LucideWrench
  ],
  template: `
    @if (d(); as s) {
      <article class="id">
        <!-- 01 — HERO sobre el artefacto de grilla del shell -->
        <header class="id-hero">
          <div class="id-hero__text">
            <p class="id-hero__eyebrow">{{ L().eyebrow }}</p>
            <h1 class="id-hero__title">{{ s.pageTitle }}</h1>
            <p class="id-hero__subtitle">{{ s.subtitle }}</p>
            <ul class="id-hero__covers">
              @for (c of s.covers; track c) {
                <li>{{ c }}</li>
              }
            </ul>
          </div>
          <div class="id-hero__art" aria-hidden="true">
            <span class="id-hero__icon">
              @switch (s.icon) {
                @case ('factory') { <svg lucideFactory [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('truck') { <svg lucideTruck [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('health') { <svg lucideHeartPulse [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('briefcase') { <svg lucideBriefcase [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('wrench') { <svg lucideWrench [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('dumbbell') { <svg lucideDumbbell [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('education') { <svg lucideGraduationCap [size]="168" [strokeWidth]="0.6"></svg> }
              }
            </span>
          </div>
        </header>

        <!-- 02 — Lo que hacemos (statement a 2 columnas) -->
        <section class="id-section id-do">
          <header class="id-section__head">
            <span class="id-num">02</span>
            <h2 class="id-label">{{ L().whatWeDo }}</h2>
          </header>
          <div class="id-do__grid id-reveal">
            <p class="id-do__lead">{{ s.whatWeDo[0] }}</p>
            <div class="id-do__rest">
              <p>{{ s.whatWeDo[1] }}</p>
              <p>{{ s.whatWeDo[2] }}</p>
            </div>
          </div>
        </section>

        <!-- 03 — Cómo se ve esto en el sector + disclaimer (ZONA OSCURA) -->
        <div class="id-dark" appDarkZone>
          <section class="id-section id-sector">
            <header class="id-section__head">
              <span class="id-num">03</span>
              <h2 class="id-label">{{ L().inTheSector }}</h2>
            </header>
            <div class="id-sector__body">
              <div class="id-sector__paras id-reveal">
                <p>{{ s.inTheSector.paragraphs[0] }}</p>
                <p>{{ s.inTheSector.paragraphs[1] }}</p>
              </div>
              <aside class="id-disclaimer id-reveal">
                <span class="id-disclaimer__eyebrow">{{ L().withRespect }}</span>
                <div class="id-disclaimer__row">
                  <span class="id-disclaimer__icon" aria-hidden="true">
                    <svg lucideHandshake [size]="26" [strokeWidth]="1.25"></svg>
                  </span>
                  <p>{{ s.inTheSector.disclaimer }}</p>
                </div>
              </aside>
            </div>
          </section>
        </div>

        <!-- 04 — Cómo trabajamos juntos (roles: vos / nosotros) -->
        <section class="id-section id-roles">
          <header class="id-section__head">
            <span class="id-num">04</span>
            <h2 class="id-label">{{ L().roles }}</h2>
          </header>
          <div class="id-roles__grid">
            <article class="id-role id-reveal">
              <span class="id-role__icon" aria-hidden="true">
                <svg lucideUserRound [size]="30" [strokeWidth]="1"></svg>
              </span>
              <span class="id-role__tag">{{ L().youBring }}</span>
              <p>{{ s.roles.yours }}</p>
            </article>
            <article class="id-role id-role--ours id-reveal">
              <span class="id-role__icon id-role__icon--accent" aria-hidden="true">
                <svg lucideCode [size]="30" [strokeWidth]="1"></svg>
              </span>
              <span class="id-role__tag">{{ L().weBring }}</span>
              <p>{{ s.roles.ours }}</p>
            </article>
          </div>
        </section>

        <!-- 05 — Algunas cosas que podríamos construir (intro + 5 cards + cierre) -->
        <section class="id-section id-build">
          <header class="id-section__head">
            <span class="id-num">05</span>
            <h2 class="id-label">{{ L().couldBuild }}</h2>
          </header>
          <p class="id-build__intro id-reveal">{{ s.couldBuild.intro }}</p>
          <div class="id-build__grid">
            @for (item of s.couldBuild.items; track $index; let i = $index) {
              <article class="id-build__card id-reveal" [style.--i]="i">
                <span class="id-build__icon" aria-hidden="true">
                  @switch (item.kind) {
                    @case ('internal') { <svg lucideMonitorCog [size]="26" [strokeWidth]="1"></svg> }
                    @case ('portal') { <svg lucideUsers [size]="26" [strokeWidth]="1"></svg> }
                    @case ('mobile') { <svg lucideSmartphone [size]="26" [strokeWidth]="1"></svg> }
                    @case ('billing') { <svg lucideReceipt [size]="26" [strokeWidth]="1"></svg> }
                    @case ('web') { <svg lucideGlobe [size]="26" [strokeWidth]="1"></svg> }
                    @case ('scheduling') { <svg lucideCalendarClock [size]="26" [strokeWidth]="1"></svg> }
                    @case ('records') { <svg lucideClipboardList [size]="26" [strokeWidth]="1"></svg> }
                    @case ('crm') { <svg lucideGitCompareArrows [size]="26" [strokeWidth]="1"></svg> }
                  }
                </span>
                <span class="id-build__kicker">{{ kindLabel(item.kind) }}</span>
                <p class="id-build__text">{{ item.text }}</p>
              </article>
            }
            <!-- Celda fantasma: completa la grilla 3×2 (5 ítems + 1) para que las líneas cierren. -->
            <div class="id-build__ghost" aria-hidden="true"></div>
          </div>
          <p class="id-build__closing id-reveal">{{ s.couldBuild.closing }}</p>
        </section>
      </article>

      <!-- 06 — Conversemos (cierre + CTA) + footer, todo en zona oscura (un solo cambio de color) -->
      <div class="id-close" appDarkZone>
        <section class="id-section id-talk">
          <header class="id-section__head">
            <span class="id-num">06</span>
            <h2 class="id-label">{{ s.talk.title }}</h2>
          </header>
          <div class="id-talk__body id-reveal">
            <p class="id-talk__text">{{ s.talk.text }}</p>
            <a class="button id-talk__cta" href="#hablemos" (click)="goToContact($event)">
              <span>{{ L().cta }}</span>
              <span class="button-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <app-contact-footer id="hablemos" [info]="info" [industryContext]="industryContext()" />
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    /* Cada sección tapa el artefacto del shell con un fondo full-bleed opaco. El hero NO lo lleva. */
    .id-section {
      position: relative;
      z-index: 1;
      padding-block: var(--section-py);
    }

    .id-section::before {
      content: '';
      position: absolute;
      inset: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: var(--surface);
      transition: background-color 450ms ease;
    }

    /* ── 01 HERO ───────────────────────────────────────────────────────────── */
    .id-hero {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
      align-items: center;
      gap: clamp(1.5rem, 4vw, 3rem);
      min-height: clamp(22rem, 56vh, 34rem);
      padding-block: clamp(3rem, 7vw, 6rem) clamp(2rem, 5vw, 4rem);
    }

    /* Gradiente al pie: funde la grilla del shell hacia el gris de la primera sección. */
    .id-hero::after {
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

    .id-hero__eyebrow {
      margin: 0 0 1rem;
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .id-hero__title {
      margin: 0;
      max-width: 20ch;
      color: var(--ink);
      font-size: clamp(2.4rem, 5vw, 4.2rem);
      font-weight: 600;
      letter-spacing: -0.05em;
      line-height: 0.98;
      text-wrap: balance;
    }

    .id-hero__subtitle {
      margin: 1.4rem 0 0;
      max-width: 48ch;
      color: var(--ink);
      font-size: var(--hero-lead-size);
      font-weight: 400;
      line-height: var(--hero-lead-leading);
      text-wrap: pretty;
    }

    .id-hero__covers {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.7rem 0 0;
      padding: 0;
      list-style: none;
    }

    .id-hero__covers li {
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

    .id-hero__art {
      display: flex;
      align-items: center;
      justify-content: flex-end; /* anclado al borde derecho de la grilla, no flotando al centro */
    }

    .id-hero__icon {
      display: inline-flex;
      color: var(--ink);
      opacity: 0.85;
      will-change: transform;
      transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* ── Rótulos / números de sección ─────────────────────────────────────── */
    .id-section__head {
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 1fr);
      align-items: baseline;
      gap: 1rem;
      margin-bottom: clamp(1.8rem, 3.5vw, 3rem);
    }

    .id-num {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .id-label {
      margin: 0;
      color: var(--ink);
      font-size: clamp(1.5rem, 3vw, 2.1rem);
      font-weight: 400;
      letter-spacing: -0.04em;
      line-height: 1.05;
      text-wrap: balance;
    }

    /* ── 02 Lo que hacemos ─────────────────────────────────────────────────── */
    .id-do__grid {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      gap: clamp(1.5rem, 4vw, 3.5rem);
      align-items: start;
    }

    .id-do__lead {
      margin: 0;
      color: var(--ink);
      font-size: clamp(1.35rem, 2.4vw, 1.95rem);
      font-weight: 400;
      letter-spacing: -0.02em;
      line-height: 1.3;
      text-wrap: pretty;
    }

    .id-do__rest {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .id-do__rest p {
      margin: 0;
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* ── 03 Cómo se ve esto en el sector (zona oscura) ─────────────────────── */
    .id-dark .id-label {
      color: #f4f4f4;
    }

    .id-dark .id-num {
      color: rgba(255, 255, 255, 0.5);
    }

    .id-sector__body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
      gap: clamp(2rem, 4vw, 4rem);
      align-items: start;
    }

    .id-sector__paras {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      max-width: 56ch;
    }

    .id-sector__paras p {
      margin: 0;
      color: #e9e9e9;
      font-size: 1.08rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* Minimal: sin caja ni filete de acento; solo una línea divisoria arriba. */
    .id-disclaimer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: clamp(1.3rem, 2.2vw, 1.8rem);
      border-top: 1px solid rgba(255, 255, 255, 0.16);
    }

    .id-disclaimer__eyebrow {
      color: rgba(255, 255, 255, 0.55);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .id-disclaimer__row {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .id-disclaimer__icon {
      display: inline-flex;
      flex-shrink: 0;
      padding-top: 0.1rem;
      color: var(--accent);
    }

    .id-disclaimer__row p {
      margin: 0;
      color: #cfcfcf; /* un punto por debajo del cuerpo principal (#e9e9e9): el disclaimer no le gana */
      font-size: 1.02rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    /* ── 04 Roles (vos / nosotros) ─────────────────────────────────────────── */
    /* Misma lógica: grilla de líneas, sin cajas. "Nosotros" se distingue por el icono en acento. */
    .id-roles__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-top: 1px solid var(--line);
      border-left: 1px solid var(--line);
    }

    .id-role {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: clamp(1.6rem, 2.6vw, 2.2rem);
      border-right: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    .id-role__icon {
      display: inline-flex;
      color: var(--ink);
    }

    .id-role__icon--accent {
      color: var(--accent);
    }

    .id-role__tag {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .id-role p {
      margin: 0;
      color: var(--ink);
      font-size: 1.05rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    /* ── 05 Podríamos construir (3 + 2) ────────────────────────────────────── */
    .id-build__intro {
      margin: 0 0 clamp(1.8rem, 3.5vw, 2.6rem);
      max-width: 60ch;
      color: var(--ink);
      font-size: clamp(1.2rem, 2vw, 1.6rem);
      font-weight: 400;
      letter-spacing: -0.02em;
      line-height: 1.35;
      text-wrap: pretty;
    }

    /* Grilla de LÍNEAS (no cajas): 3 columnas; 5 celdas + 1 fantasma cierran la grilla 3×2.
       Sin fondo, sin bordes redondeados → minimalista, como el cuerpo de los landings. */
    .id-build__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      border-top: 1px solid var(--line);
      border-left: 1px solid var(--line);
    }

    .id-build__card,
    .id-build__ghost {
      border-right: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    .id-build__card {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding: clamp(1.6rem, 2.4vw, 2.1rem);
    }

    .id-build__icon {
      display: inline-flex;
      color: var(--ink);
      transition: color 220ms ease;
    }

    .id-build__card:hover .id-build__icon {
      color: var(--accent);
    }

    .id-build__kicker {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .id-build__text {
      margin: 0;
      color: var(--ink);
      font-size: 1rem;
      line-height: 1.5;
      text-wrap: pretty;
    }

    .id-build__closing {
      margin: clamp(1.8rem, 3.5vw, 2.6rem) 0 0;
      max-width: 60ch;
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* ── 06 Conversemos (cierre en zona oscura) ────────────────────────────── */
    .id-close .id-label {
      color: #f4f4f4;
    }

    .id-close .id-num {
      color: rgba(255, 255, 255, 0.5);
    }

    .id-talk__body {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .id-talk__text {
      margin: 0;
      max-width: 52ch;
      color: #e9e9e9;
      font-size: clamp(1.1rem, 1.8vw, 1.35rem);
      line-height: 1.5;
      text-wrap: pretty;
    }

    .id-talk__cta {
      flex-shrink: 0;
    }

    /* ── Reveals (SSG-safe; el TS agrega .is-in vía IO, o de inmediato si no hay IO) ───── */
    .id-reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 600ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .id-build__card.id-reveal {
      transition-delay: calc(var(--i, 0) * 80ms);
    }

    .id-reveal.is-in {
      opacity: 1;
      transform: none;
    }

    /* En las grillas de líneas el reveal es solo opacidad (sin translate → las líneas no se desalinean). */
    .id-build__card.id-reveal,
    .id-role.id-reveal {
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .id-reveal {
        opacity: 1;
        transform: none;
        transition: none;
      }

      .id-hero__icon {
        transition: none;
      }
    }

    /* ── Responsive ────────────────────────────────────────────────────────── */
    @media (max-width: 980px) {
      .id-build__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 620px) {
      .id-build__grid {
        grid-template-columns: 1fr;
      }

      .id-build__ghost {
        display: none;
      }
    }

    @media (max-width: 860px) {
      .id-hero {
        grid-template-columns: 1fr;
        min-height: auto;
      }

      .id-hero__art {
        display: none;
      }
    }

    @media (max-width: 760px) {
      .id-do__grid,
      .id-sector__body {
        grid-template-columns: 1fr;
        gap: 1.6rem;
      }

      .id-roles__grid {
        grid-template-columns: 1fr;
      }

      .id-section__head {
        grid-template-columns: 2rem minmax(0, 1fr);
        gap: 0.75rem;
      }
    }
  `
})
export class IndustryDetailPageComponent implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly i18n = inject(LanguageService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly lang = this.i18n.lang;

  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug'))), {
    initialValue: this.route.snapshot.paramMap.get('slug')
  });

  // Contenido resuelto por slug + idioma. null si el slug no existe.
  protected readonly d = computed(() => getIndustryDetail(this.slug(), this.lang()));
  protected readonly L = computed(() => LABELS[this.lang()]);

  // Contexto para el footer: identifica del lado del CRM de qué industria vino el lead.
  protected readonly industryContext = computed<SystemContext | null>(() => {
    const detail = this.d();
    const slug = this.slug();
    return detail && slug ? { name: detail.name, slug } : null;
  });

  // Footer del sitio (mismos datos que system-detail / contact-page).
  protected readonly info: ContactInfo = {
    email: 'hola@nolo.ar',
    whatsappLink: 'https://wa.me/5491133337180',
    calendarLink: 'https://cal.com/nolo.ar/reunion-con-equipo-nolo',
    calendarLinkEn: 'https://cal.com/nolo.ar/meeting-with-nolo-team',
    location: 'Buenos Aires, Argentina'
  };

  private io: IntersectionObserver | null = null;
  private removeMove: (() => void) | null = null;
  private rafId = 0;

  constructor() {
    // Slug inexistente → 404 con marca.
    effect(() => {
      if (this.slug() !== null && this.d() === null) {
        this.router.navigateByUrl('/404', { replaceUrl: true });
      }
    });
  }

  protected kindLabel(kind: BuildKind): string {
    return BUILD_LABELS[this.lang()][kind];
  }

  // CTA "Escribinos": scroll suave al formulario del footer (#hablemos), sin navegar.
  protected goToContact(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    event.preventDefault();
    document.getElementById('hablemos')?.scrollIntoView({ behavior: 'smooth' });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const host = this.host.nativeElement as HTMLElement;

    // Reveals: IO agrega .is-in al entrar; sin IO se muestran de inmediato (degradación).
    const revealEls = host.querySelectorAll<HTMLElement>('.id-reveal');
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
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => this.io!.observe(el));
    }

    this.setupParallax(host);
  }

  // Parallax suave del icono del hero al mover el mouse (off en mobile / reduced-motion).
  private setupParallax(host: HTMLElement): void {
    const icon = host.querySelector<HTMLElement>('.id-hero__icon');
    if (!icon) return;
    const reduce =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || window.innerWidth <= 860) return;

    const AMP = 22;
    let tx = 0;
    let ty = 0;
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * AMP;
      ty = (e.clientY / window.innerHeight - 0.5) * AMP;
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(() => {
          icon.style.transform = `translate(${tx}px, ${ty}px)`;
          this.rafId = 0;
        });
      }
    };

    this.zone.runOutsideAngular(() => {
      window.addEventListener('mousemove', onMove, { passive: true });
    });
    this.removeMove = () => window.removeEventListener('mousemove', onMove);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.io = null;
    this.removeMove?.();
    this.removeMove = null;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// Rótulos de UI por idioma (no es copy nuevo: son los encabezados del documento aprobado + textos de interfaz).
const LABELS = {
  es: {
    eyebrow: 'Industrias',
    whatWeDo: 'Lo que hacemos',
    inTheSector: 'Cómo se ve esto en el sector',
    withRespect: 'Con respeto',
    roles: 'Cómo trabajamos juntos',
    youBring: 'Lo que vos ponés',
    weBring: 'Lo que ponemos nosotros',
    couldBuild: 'Algunas cosas que podríamos construir',
    cta: 'Escribinos'
  },
  en: {
    eyebrow: 'Industries',
    whatWeDo: 'What we do',
    inTheSector: 'How this looks in your sector',
    withRespect: 'With respect',
    roles: 'How we work together',
    youBring: 'What you bring',
    weBring: 'What we bring',
    couldBuild: 'Some things we could build',
    cta: 'Get in touch'
  }
} as const;

// Etiqueta de categoría (UI) por tipo de pieza "podríamos construir". No es copy del cliente.
const BUILD_LABELS: Record<'es' | 'en', Record<BuildKind, string>> = {
  es: {
    internal: 'Sistema interno',
    portal: 'Portal',
    mobile: 'App móvil',
    billing: 'Cobros y facturación',
    web: 'Sitio web',
    scheduling: 'Agenda y reservas',
    records: 'Gestión y registros',
    crm: 'CRM'
  },
  en: {
    internal: 'Internal system',
    portal: 'Portal',
    mobile: 'Mobile app',
    billing: 'Billing',
    web: 'Website',
    scheduling: 'Scheduling',
    records: 'Records',
    crm: 'CRM'
  }
};
