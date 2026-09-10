import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LucideCheck, LucideCircleCheck, LucideCircleOff } from '@lucide/angular';

import { environment } from '../../environments/environment';
import { ContactFooterComponent, ContactInfo, SystemContext } from '../components/contact-footer.component';
import { DarkZoneDirective } from '../directives/dark-zone.directive';
import { TrackSectionDirective } from '../directives/track-section.directive';
import { AdsService } from '../services/ads.service';
import { LanguageService } from '../services/language.service';
import { LocalizeUrlPipe } from '../services/localize-url.pipe';
import {
  type SoftwareArCaseSlug,
  getSoftwareArCase,
  getSoftwareArCaseLabels,
  getSoftwareArCases
} from './software-ar-cases-content';
import { getSystemDetail } from './systems-content';

/**
 * Duración de cada video de demo en ISO 8601. Verificada con ffprobe sobre los archivos de
 * public/media/software de Nolõ el 2026-09-09 (mismos archivos que sirve Link Design).
 */
const CASE_VIDEO_DURATIONS: Record<SoftwareArCaseSlug, string> = {
  pulso: 'PT42S',
  cumbre: 'PT38S',
  'estudio-dental-mendieta': 'PT51S',
  'tornos-del-sur': 'PT45S',
  'punto-cero': 'PT41S',
  'vertice-seguridad-industrial': 'PT34S'
};

/**
 * Ficha de un sistema de demostración: /desarrollo-de-software-argentina/:slug, en ES y EN
 * (/en/…), conectada al toggle de idioma.
 *
 * Página terminal (header back-only, resuelto en app.ts/app.html): hero con el video del sistema,
 * la operación antes y con el sistema, lo que se copió de la operación, qué hay en el demo, cuánto
 * cuesta un sistema así (zona oscura), la nota de confidencialidad, los otros demos y el footer.
 * Contenido y rótulos por idioma en software-ar-cases-content.ts (getters sobre `lang()`); los
 * enlaces internos pasan por `localizeUrl` para quedarse en el árbol del idioma activo. La sección
 * de costo enlaza a la página del tipo de sistema (`system`, cuando existe) y el video lleva su
 * `VideoObject` en el <head>, como los demos de /software.
 */
@Component({
  selector: 'app-software-ar-case-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LocalizeUrlPipe,
    ContactFooterComponent,
    DarkZoneDirective,
    TrackSectionDirective,
    LucideCheck,
    LucideCircleCheck,
    LucideCircleOff
  ],
  template: `
    @if (d(); as s) {
      <article class="cc">
        <!-- HERO: categoría, nombre, resumen y acceso al demo, sobre la grilla del shell -->
        <header class="cc-hero" appTrackSection="caso-intro">
          <p class="cc-hero__eyebrow">{{ l().eyebrowPrefix }} · {{ s.category }}</p>
          <h1 class="cc-hero__title">{{ s.name }}</h1>
          <div class="cc-hero__grid">
            <div class="cc-hero__copy">
              <p class="cc-hero__lead">{{ s.summary }}</p>
              <p class="cc-hero__for">{{ s.forWhom }}</p>
              <div class="cc-hero__actions">
                <a class="button" [href]="s.link" target="_blank" rel="noopener noreferrer">
                  <span>{{ l().tryCta }}</span>
                  <span class="button-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <dl class="cc-hero__stats">
              <div class="cc-stat">
                <dt class="cc-stat__label">{{ l().rangeLabel }}</dt>
                <dd class="cc-stat__value">{{ s.range }}</dd>
              </div>
              <div class="cc-stat">
                <dt class="cc-stat__label">{{ l().timelineLabel }}</dt>
                <dd class="cc-stat__value">{{ s.timeline }}</dd>
              </div>
            </dl>
          </div>
        </header>

        <!-- VIDEO del sistema -->
        <section class="cc-section cc-video" appTrackSection="caso-video">
          <a
            class="cc-video__frame"
            [href]="s.link"
            target="_blank"
            rel="noopener noreferrer"
            [attr.aria-label]="videoLabel()"
          >
            <video
              class="cc-video__media"
              [poster]="s.poster"
              aria-hidden="true"
              autoplay
              muted
              [muted]="true"
              loop
              playsinline
              preload="metadata"
            >
              <source [src]="s.video" type="video/mp4" />
            </video>
          </a>
        </section>

        <!-- 01 — Antes / Con el sistema -->
        <section class="cc-section cc-two cc-reveal" appTrackSection="caso-antes-despues">
          <div class="cc-two__grid">
            <div class="cc-two__col">
              <span class="cc-two__icon cc-icon--muted" aria-hidden="true">
                <svg lucideCircleOff [size]="26" [strokeWidth]="1"></svg>
              </span>
              <span class="cc-num">01</span>
              <h2 class="cc-label">{{ l().before }}</h2>
              <p>{{ s.before }}</p>
            </div>
            <div class="cc-two__col">
              <span class="cc-two__icon cc-icon--accent" aria-hidden="true">
                <svg lucideCircleCheck [size]="26" [strokeWidth]="1"></svg>
              </span>
              <span class="cc-num">02</span>
              <h2 class="cc-label">{{ l().after }}</h2>
              <p>{{ s.after }}</p>
            </div>
          </div>
        </section>

        <!-- 03 — Lo que copiamos de la operación -->
        <section class="cc-section cc-list cc-reveal" appTrackSection="caso-copiado">
          <header class="cc-section__head">
            <span class="cc-num">03</span>
            <h2 class="cc-label">{{ l().copied }}</h2>
          </header>
          <ul class="cc-checklist">
            @for (item of s.copied; track $index) {
              <li class="cc-checklist__item">
                <span class="cc-checklist__icon cc-icon--accent" aria-hidden="true">
                  <svg lucideCheck [size]="18" [strokeWidth]="1.5"></svg>
                </span>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </section>

        <!-- 04 — Qué vas a encontrar en el demo -->
        <section class="cc-section cc-list cc-reveal" appTrackSection="caso-demo">
          <header class="cc-section__head">
            <span class="cc-num">04</span>
            <h2 class="cc-label">{{ l().inside }}</h2>
          </header>
          <ul class="cc-checklist">
            @for (item of s.inside; track $index) {
              <li class="cc-checklist__item">
                <span class="cc-checklist__icon cc-icon--ink" aria-hidden="true">
                  <svg lucideCheck [size]="18" [strokeWidth]="1.5"></svg>
                </span>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
          <a class="button cc-list__cta" [href]="s.link" target="_blank" rel="noopener noreferrer">
            <span>{{ l().tryCta }}</span>
            <span class="button-arrow" aria-hidden="true">→</span>
          </a>
        </section>

        <!-- 05 + 06 — Zona oscura: cuánto cuesta un sistema así + por qué un demo -->
        <div class="cc-dark" appDarkZone>
          <section class="cc-section cc-cost" appTrackSection="caso-costo">
            <header class="cc-section__head">
              <span class="cc-num">05</span>
              <h2 class="cc-label">{{ l().cost }}</h2>
            </header>
            <dl class="cc-cost__stats">
              <div class="cc-stat cc-stat--dark">
                <dt class="cc-stat__label">{{ l().rangeLabel }}</dt>
                <dd class="cc-stat__value">{{ s.range }}</dd>
              </div>
              <div class="cc-stat cc-stat--dark">
                <dt class="cc-stat__label">{{ l().timelineLabel }}</dt>
                <dd class="cc-stat__value">{{ s.timeline }}</dd>
              </div>
            </dl>
            <div class="cc-cost__text">
              <p>{{ l().costNote }}</p>
              <p class="cc-cost__disclaimer">{{ l().costDisclaimer }}</p>
            </div>
            <div class="cc-cost__actions">
              <a class="button" [href]="calendarLink()" target="_blank" rel="noopener noreferrer" (click)="onMeetingClick()">
                <span>{{ l().meetCta }}</span>
                <span class="button-arrow" aria-hidden="true">→</span>
              </a>
              <a class="cc-cost__link" [routerLink]="'/desarrollo-de-software-argentina' | localizeUrl" fragment="precios">
                {{ l().costLink }} →
              </a>
            </div>
            @if (systemLink(); as sys) {
              <p class="cc-cost__system">
                <a class="cc-cost__link" [routerLink]="sys.href | localizeUrl">{{ sys.text }} →</a>
              </p>
            }
          </section>

          <section class="cc-section cc-why" appTrackSection="caso-confidencialidad">
            <header class="cc-section__head">
              <span class="cc-num">06</span>
              <h2 class="cc-label">{{ l().confidentialityTitle }}</h2>
            </header>
            <p class="cc-why__text">{{ l().confidentiality }}</p>
          </section>

          <section class="cc-section cc-others" appTrackSection="caso-otros">
            <h2 class="cc-sublabel">{{ l().others }}</h2>
            <ul class="cc-others__list">
              @for (o of others(); track o.slug) {
                <li>
                  <a class="cc-other" [routerLink]="('/desarrollo-de-software-argentina/' + o.slug) | localizeUrl">
                    <span class="cc-other__category">{{ o.category }}</span>
                    <span class="cc-other__name">{{ o.name }} →</span>
                  </a>
                </li>
              }
            </ul>
            <a class="cc-back" [routerLink]="'/desarrollo-de-software-argentina' | localizeUrl">← {{ l().backToHub }}</a>
          </section>
        </div>
      </article>

      <app-contact-footer
        appDarkZone
        id="hablemos"
        appTrackSection="hablemos"
        [info]="info"
        [systemContext]="context()"
      />
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .cc {
      display: block;
    }

    .cc-section {
      position: relative;
      z-index: 1;
      padding-block: var(--section-py);
    }

    .cc-section::before {
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
    .cc-hero {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: clamp(1.4rem, 3vw, 2.4rem);
      min-height: clamp(18rem, 40vh, 28rem);
      padding-block: clamp(2.5rem, 6vw, 5rem) clamp(2rem, 4vw, 3rem);
    }

    .cc-hero::after {
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

    .cc-hero__eyebrow {
      margin: 0;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.78rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .cc-hero__title {
      margin: 0;
      max-width: 18ch;
      color: var(--ink);
      font-size: var(--hero-title-size);
      font-weight: var(--hero-title-weight);
      letter-spacing: var(--hero-title-tracking);
      line-height: var(--hero-title-leading);
      text-wrap: balance;
    }

    .cc-hero__grid {
      display: grid;
      grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
      gap: clamp(2rem, 5vw, 5rem);
      align-items: end;
    }

    .cc-hero__copy {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      max-width: 58ch;
    }

    .cc-hero__lead {
      margin: 0;
      color: var(--ink);
      font-size: var(--hero-lead-size);
      line-height: var(--hero-lead-leading);
      text-wrap: pretty;
    }

    .cc-hero__for {
      margin: 0;
      color: var(--ink);
      font-size: 0.98rem;
      line-height: 1.55;
    }

    .cc-hero__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding-top: 0.4rem;
    }

    .cc-hero__stats {
      display: flex;
      flex-direction: column;
      margin: 0;
    }

    .cc-stat {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 1rem 0;
      border-top: 1px solid var(--line);
    }

    .cc-stat:last-child {
      border-bottom: 1px solid var(--line);
    }

    .cc-stat__label {
      order: 2;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .cc-stat__value {
      order: 1;
      margin: 0;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: clamp(1.4rem, 2.4vw, 2rem);
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    /* ── Video ────────────────────────────────────────────────────────────── */
    .cc-video {
      padding-block: 0 var(--section-py);
    }

    /* Proporción real de los videos y pósters de los demos (1280 × 682), igual que en el
       componente viewcases del sitio: sin recorte. */
    .cc-video__frame {
      display: block;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 1rem;
      background: #e9e9e9;
      aspect-ratio: 1280 / 682;
    }

    .cc-video__media {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* ── Rótulos / números ────────────────────────────────────────────────── */
    .cc-num {
      display: block;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .cc-label {
      margin: 0;
      max-width: 22ch;
      color: var(--ink);
      font-size: clamp(1.5rem, 3vw, 2.1rem);
      font-weight: 400;
      letter-spacing: -0.04em;
      line-height: 1.05;
      text-wrap: balance;
    }

    .cc-sublabel {
      margin: 0 0 1.2rem;
      color: var(--ink);
      font-size: 1.15rem;
      font-weight: 500;
      letter-spacing: -0.02em;
    }

    .cc-section__head {
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 1fr);
      align-items: baseline;
      gap: 1rem;
      margin-bottom: clamp(1.6rem, 3vw, 2.6rem);
    }

    .cc-icon--accent { color: var(--accent); }
    .cc-icon--muted { color: var(--muted); }
    .cc-icon--ink { color: var(--ink); }

    /* ── 01/02 Antes / Con el sistema ─────────────────────────────────────── */
    .cc-two__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(2rem, 4vw, 4rem);
    }

    .cc-two__col {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      max-width: 46ch;
    }

    .cc-two__col p {
      margin: 0;
      color: var(--ink);
      font-size: 1.12rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    .cc-two__icon {
      display: inline-flex;
    }

    /* ── Listas 03 / 04 ───────────────────────────────────────────────────── */
    .cc-checklist {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      list-style: none;
      max-width: 64ch;
    }

    .cc-checklist__item {
      display: grid;
      grid-template-columns: 1.6rem minmax(0, 1fr);
      gap: 0.8rem;
      padding: 0.95rem 0;
      border-top: 1px solid var(--line);
      color: var(--ink);
      font-size: 1.05rem;
      line-height: 1.55;
    }

    .cc-checklist__item:last-child {
      border-bottom: 1px solid var(--line);
    }

    .cc-checklist__icon {
      display: inline-flex;
      padding-top: 0.2rem;
    }

    .cc-list__cta {
      margin-top: clamp(1.4rem, 2.5vw, 2rem);
    }

    /* ── Zona oscura ──────────────────────────────────────────────────────── */
    .cc-dark .cc-label,
    .cc-dark .cc-sublabel,
    .cc-dark .cc-stat__value,
    .cc-dark p {
      color: #f4f4f4;
    }

    .cc-dark .cc-num,
    .cc-dark .cc-stat__label {
      color: #f4f4f4;
    }

    .cc-stat--dark {
      border-color: rgba(255, 255, 255, 0.16);
    }

    /* Una sola columna: los dos datos lado a lado, el párrafo, la nota y la fila de acciones. */
    .cc-cost__stats {
      display: grid;
      /* Cada dato toma el ancho de su contenido para que el monto no se parta en dos líneas. */
      grid-template-columns: repeat(2, minmax(14rem, max-content));
      column-gap: clamp(2rem, 4vw, 4rem);
      margin: 0 0 clamp(1.6rem, 3vw, 2.4rem);
    }

    .cc-cost__stats .cc-stat__value {
      white-space: nowrap;
    }

    .cc-cost__stats .cc-stat {
      border-bottom: 1px solid rgba(255, 255, 255, 0.16);
    }

    .cc-cost__text {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      max-width: 60ch;
      margin-bottom: clamp(1.6rem, 3vw, 2.4rem);
    }

    .cc-cost__text p {
      margin: 0;
      font-size: 1.08rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    .cc-cost__disclaimer {
      font-size: 0.95rem;
    }

    .cc-cost__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: clamp(1rem, 2vw, 1.8rem);
    }

    .cc-cost__link,
    .cc-back {
      color: #f4f4f4;
      font-family: var(--font-mono);
      font-size: 0.82rem;
      letter-spacing: 0.03em;
      text-decoration: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.35);
      padding-bottom: 0.15rem;
    }

    .cc-cost__link:hover,
    .cc-back:hover {
      border-bottom-color: #f4f4f4;
    }

    /* Línea bajo las acciones: enlace a la página del tipo de sistema que este demo ejemplifica. */
    .cc-cost__system {
      margin: clamp(1rem, 2vw, 1.8rem) 0 0;
    }

    .cc-why__text {
      margin: 0;
      max-width: 62ch;
      font-size: 1.12rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    .cc-others__list {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(0.8rem, 1.5vw, 1.2rem);
      margin: 0 0 clamp(1.6rem, 3vw, 2.4rem);
      padding: 0;
      list-style: none;
    }

    .cc-other {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding: 1.1rem 1.2rem;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 0.9rem;
      background: #161616;
      color: #f4f4f4;
      text-decoration: none;
      transition: border-color 180ms ease, transform 220ms ease;
    }

    .cc-other:hover,
    .cc-other:focus-visible {
      border-color: #f4f4f4;
      transform: translateY(-2px);
      outline: none;
    }

    .cc-other__category {
      color: #f4f4f4;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .cc-other__name {
      font-size: 1.02rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    /* ── Reveal on scroll (guardado en TS con isPlatformBrowser para el SSG) ── */
    .cc-reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 600ms ease, transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .cc-reveal.is-in {
      opacity: 1;
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .cc-reveal {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }

    /* ── Responsive ───────────────────────────────────────────────────────── */
    @media (max-width: 1024px) {
      .cc-hero__grid {
        grid-template-columns: 1fr;
        gap: 1.6rem;
      }

      .cc-others__list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 760px) {
      .cc-two__grid,
      .cc-others__list {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .cc-cost__stats {
        grid-template-columns: 1fr;
      }

      .cc-cost__stats .cc-stat__value {
        white-space: normal;
      }

      .cc-section__head {
        grid-template-columns: 2rem minmax(0, 1fr);
        gap: 0.75rem;
      }

      .cc-hero__title {
        max-width: none;
      }

      .cc-dark p,
      .cc-dark .cc-label {
        color: #f4f4f4;
      }
    }
  `
})
export class SoftwareArCasePageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(LanguageService);
  private readonly ads = inject(AdsService);

  protected readonly lang = this.i18n.lang;

  // <script type="application/ld+json" data-seo="case-video"> del VideoObject, uno por página.
  private videoScript: HTMLScriptElement | null = null;

  // Rótulos de la ficha en el idioma activo.
  protected readonly l = computed(() => getSoftwareArCaseLabels(this.lang()));

  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug'))), {
    initialValue: this.route.snapshot.paramMap.get('slug')
  });

  // Ficha resuelta por slug, en el idioma activo. null si el slug no existe.
  protected readonly d = computed(() => getSoftwareArCase(this.slug(), this.lang()));

  // Los otros demos (en el idioma activo), para navegar entre fichas.
  protected readonly others = computed(() =>
    getSoftwareArCases(this.lang()).filter((c) => c.slug !== this.slug())
  );

  // Nombre accesible del marco del video: dice que abre el demo, no solo cómo se llama.
  protected readonly videoLabel = computed(() => {
    const s = this.d();
    return s ? this.l().videoLabel.replace('{name}', s.name) : '';
  });

  // Enlace a la página del tipo de sistema que este demo ejemplifica; null si no tiene par
  // (Punto Cero). El nombre del sistema sale de systems-content en el idioma activo.
  protected readonly systemLink = computed<{ href: string; text: string } | null>(() => {
    const s = this.d();
    const system = s?.system ? getSystemDetail(s.system, this.lang()) : null;
    if (!s?.system || !system) return null;
    return { href: `/software/${s.system}`, text: this.l().systemExample.replace('{system}', system.name) };
  });

  // Etiqueta el lead en el CRM con la ficha desde la que escribió.
  // Siempre en español, en ambos idiomas: es una etiqueta interna del CRM y el footer ya antepone su prefijo por idioma.
  protected readonly context = computed<SystemContext | null>(() => {
    const s = getSoftwareArCase(this.slug(), 'es');
    return s ? { name: `Demo ${s.name} (${s.category})`, slug: `desarrollo-de-software-argentina/${s.slug}` } : null;
  });

  // Footer del sitio (mismos datos que las páginas de detalle de Nolõ).
  protected readonly info: ContactInfo = {
    email: 'hola@nolo.ar',
    whatsappLink: 'https://wa.me/5491133337180',
    calendarLink: 'https://cal.com/nolo.ar/reunion-con-equipo-nolo',
    calendarLinkEn: 'https://cal.com/nolo.ar/meeting-with-nolo-team',
    location: 'Buenos Aires, Argentina'
  };

  // Reunión en cal.com por idioma, con la misma regla que el footer (calendarLinkEn en inglés).
  protected readonly calendarLink = computed(() =>
    this.lang() === 'en' && this.info.calendarLinkEn ? this.info.calendarLinkEn : this.info.calendarLink
  );

  // «Agendar reunión de 30 minutos» reporta a Google Ads la misma conversión de agendar que el
  // resto del sitio. El enlace sigue abriéndose en pestaña nueva.
  protected onMeetingClick(): void {
    this.ads.scheduleMeeting();
  }

  constructor() {
    afterNextRender(() => this.setupReveal());

    // Slug inexistente → 404 con marca.
    effect(() => {
      if (this.slug() !== null && this.d() === null) {
        this.router.navigateByUrl('/404', { replaceUrl: true });
      }
    });

    // VideoObject JSON-LD del video de la ficha: la hace elegible como resultado de video. Mismo
    // patrón que viewcases: el nodo se crea una vez (o se reutiliza el prerenderizado al hidratar),
    // el texto se actualiza al cambiar de ficha o idioma, y corre también en el prerender (SSG).
    effect(() => {
      const s = this.d();
      if (!s) {
        return;
      }
      const origin = (environment.siteUrl || '').replace(/\/+$/, '');
      const data = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: s.name,
        description: s.summary,
        thumbnailUrl: origin + s.poster,
        contentUrl: origin + s.video,
        uploadDate: '2026-06-07',
        inLanguage: this.lang() === 'en' ? 'en-US' : 'es-AR',
        duration: CASE_VIDEO_DURATIONS[s.slug]
      };
      if (!this.videoScript) {
        this.videoScript =
          this.document.head.querySelector<HTMLScriptElement>('script[data-seo="case-video"]') ??
          this.document.createElement('script');
        this.videoScript.setAttribute('type', 'application/ld+json');
        this.videoScript.setAttribute('data-seo', 'case-video');
        if (!this.videoScript.parentNode) {
          this.document.head.appendChild(this.videoScript);
        }
      }
      this.videoScript.textContent = JSON.stringify(data);
    });
  }

  // Reveal on scroll sin observer: en cada scroll (coalescido por frame) se consultan los nodos
  // vivos y se marca lo que ya entró al viewport. Un observer armado una vez quedaba mudo cuando
  // la vista se recreaba (recarga en caliente del dev server): miraba nodos que ya no estaban en
  // el DOM y las secciones no aparecían nunca. Esto no depende de eso.
  private revealRaf = 0;
  private readonly onReveal = (): void => {
    if (this.revealRaf) return;
    this.revealRaf = requestAnimationFrame(() => {
      this.revealRaf = 0;
      const vh = window.innerHeight;
      this.host.nativeElement
        .querySelectorAll('.cc-reveal:not(.is-in)')
        .forEach((el: Element) => {
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add('is-in');
        });
    });
  };

  private setupReveal(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.addEventListener('scroll', this.onReveal, { passive: true });
    window.addEventListener('resize', this.onReveal, { passive: true });
    this.onReveal();
    // Segunda pasada corta: la altura del layout se asienta tarde (fuentes, video, hidratación).
    setTimeout(this.onReveal, 600);
  }

  ngOnDestroy(): void {
    this.videoScript?.remove();
    this.videoScript = null;
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.onReveal);
    window.removeEventListener('resize', this.onReveal);
    if (this.revealRaf) cancelAnimationFrame(this.revealRaf);
  }
}
