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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { TrackSectionDirective } from '../directives/track-section.directive';
import { LanguageService } from '../services/language.service';
import { LocalizeUrlPipe } from '../services/localize-url.pipe';
import { getSoftwareArCaseForSystem } from './software-ar-cases-content';
import { getSoftwareArPriceForSystem } from './software-ar-content';
import { getSystemDetail } from './systems-content';

// Página de detalle de un sistema de software (/software/:slug). Página "terminal":
// header simplificado (backOnly, resuelto en app.ts/app.html), artefacto de grilla del shell
// en el hero, y el footer del sitio al cierre. Layout + iconografía; el único media es el video del
// demo que ejemplifica el sistema (sección «Así se ve…», solo en los sistemas que tienen uno).
@Component({
  selector: 'app-system-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ContactFooterComponent,
    FaqAccordionComponent,
    DarkZoneDirective,
    RouterLink,
    LocalizeUrlPipe,
    TrackSectionDirective,
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
        <header class="sd-hero" appTrackSection="sistema-intro">
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
        <section class="sd-section sd-does sd-reveal" appTrackSection="sistema-funciones">
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

        <!-- 05 (solo si el sistema tiene demo) — Así se ve un sistema como este: texto y botones
             a la izquierda, el video del demo a la derecha con su proporción real. El demo (resumen,
             categoría, ficha) se resuelve por idioma; el enlace a la ficha pasa por localizeUrl para
             quedarse en el árbol del idioma activo. Las secciones que siguen se numeran corridas (num()). -->
        @if (demo(); as ex) {
          <section class="sd-section sd-demo sd-reveal" appTrackSection="sistema-demo">
            <header class="sd-section__head">
              <span class="sd-num">05</span>
              <h2 class="sd-label">{{ t().demoTitle }}</h2>
            </header>
            <div class="sd-demo__grid">
              <div class="sd-demo__text">
                <p>{{ demoIntro() }}</p>
                <p>{{ ex.summary }}</p>
                <p class="sd-demo__note">{{ t().demoNote }}</p>
                <div class="sd-demo__actions">
                  <a class="button" [href]="ex.link" target="_blank" rel="noopener noreferrer">
                    <span>{{ t().demoCta }}</span>
                    <span class="button-arrow" aria-hidden="true">→</span>
                  </a>
                  <a class="sd-demo__link" [routerLink]="('/desarrollo-de-software-argentina/' + ex.slug) | localizeUrl">{{ t().demoFicha }} →</a>
                </div>
              </div>
              <a
                class="sd-demo__frame"
                [href]="ex.link"
                target="_blank"
                rel="noopener noreferrer"
                [attr.aria-label]="t().demoCta + ': ' + ex.name"
              >
                <video
                  class="sd-demo__media"
                  [poster]="ex.poster"
                  autoplay
                  muted
                  [muted]="true"
                  loop
                  playsinline
                  preload="metadata"
                  aria-hidden="true"
                >
                  <source [src]="ex.video" type="video/mp4" />
                </video>
              </a>
            </div>
          </section>
        }

        <!-- 05/06 — Con qué se conecta (2 columnas) -->
        <section class="sd-section sd-connect">
          <header class="sd-section__head">
            <span class="sd-num">{{ num().connects }}</span>
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
              <span class="sd-num">{{ num().notWhat }}</span>
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
              <span class="sd-num">{{ num().build }}</span>
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

          <!-- Cuánto cuesta en Argentina: el rango del hub para este tipo de sistema (si tiene fila
               propia) y el enlace al hub /desarrollo-de-software-argentina (a la página, no al ancla de precios).
               El hub existe en es/en: el enlace pasa por localizeUrl para quedarse en el árbol del idioma activo. -->
          <section class="sd-section sd-cost sd-reveal" appTrackSection="sistema-costo">
            <header class="sd-section__head">
              <span class="sd-num">{{ num().cost }}</span>
              <h2 class="sd-label">{{ t().costTitle }}</h2>
            </header>
            @if (priceView(); as row) {
              <dl class="sd-cost__stats">
                <div class="sd-stat">
                  <dt class="sd-stat__label">{{ t().costRange }}</dt>
                  <dd class="sd-stat__value">{{ row.range }}</dd>
                </div>
                <div class="sd-stat">
                  <dt class="sd-stat__label">{{ t().costTimeline }}</dt>
                  <dd class="sd-stat__value">{{ row.timeline }}</dd>
                </div>
              </dl>
            }
            <div class="sd-cost__text">
              <p>{{ priceView() ? t().costText : t().costTextGeneral }}</p>
              <p class="sd-cost__note">{{ priceView() ? t().costNote : t().costNoteGeneral }}</p>
            </div>
            <a class="sd-cost__link" [routerLink]="'/desarrollo-de-software-argentina' | localizeUrl">{{ t().costLink }} →</a>
          </section>

          <!-- 09/10 — Verlo funcionando (cierre + CTA): dentro de la zona oscura, así el sitio
               se queda oscuro desde "Qué no es" hasta el footer (un solo cambio de color). -->
          <section class="sd-section sd-see" appTrackSection="sistema-cierre">
            <header class="sd-section__head">
              <span class="sd-num">{{ num().see }}</span>
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
          <app-faq-accordion appTrackSection="faq" [heading]="t().faq" [items]="s.faq" />
        </div>
      </article>

      <app-contact-footer appDarkZone id="hablemos" appTrackSection="hablemos" [info]="info" [systemContext]="systemContext()" />
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

    /* ── 05 Así se ve un sistema como este (solo con demo): texto + video ─────── */
    .sd-demo__grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
      gap: clamp(2rem, 4vw, 4rem);
      align-items: center;
    }

    .sd-demo__text {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      max-width: 46ch;
    }

    .sd-demo__text p {
      margin: 0;
      color: var(--ink);
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .sd-demo__text .sd-demo__note {
      font-size: 0.95rem;
      font-weight: 600;
    }

    .sd-demo__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem 1.5rem;
      margin-top: 0.4rem;
    }

    .sd-demo__link {
      padding-bottom: 0.1rem;
      border-bottom: 1px solid var(--line-strong);
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.78rem;
      letter-spacing: 0.04em;
      text-decoration: none;
      transition: border-color 180ms ease;
    }

    .sd-demo__link:hover,
    .sd-demo__link:focus-visible {
      border-bottom-color: var(--ink);
      outline: none;
    }

    /* El video con su proporción real (1280 × 682), sin recorte. */
    .sd-demo__frame {
      display: block;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 1rem;
      background: #e9e9e9;
      aspect-ratio: 1280 / 682;
    }

    .sd-demo__media {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* ── Cuánto cuesta en Argentina (zona oscura): dos datos, texto y enlace al hub ── */
    .sd-cost__stats {
      display: grid;
      /* Cada dato toma el ancho de su contenido para que el monto no se parta en dos líneas. */
      grid-template-columns: repeat(2, minmax(14rem, max-content));
      column-gap: clamp(2rem, 4vw, 4rem);
      margin: 0 0 clamp(1.6rem, 3vw, 2.4rem);
    }

    .sd-stat {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 1rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.16);
      border-bottom: 1px solid rgba(255, 255, 255, 0.16);
    }

    .sd-stat__label {
      order: 2;
      color: #f4f4f4;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .sd-stat__value {
      order: 1;
      margin: 0;
      color: #f4f4f4;
      font-family: var(--font-mono);
      font-size: clamp(1.4rem, 2.4vw, 2rem);
      line-height: 1.1;
      letter-spacing: -0.02em;
      white-space: nowrap;
    }

    .sd-cost__text {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      max-width: 60ch;
      margin-bottom: clamp(1.4rem, 3vw, 2rem);
    }

    .sd-cost__text p {
      margin: 0;
      color: #f4f4f4;
      font-size: 1.08rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    .sd-cost__note {
      font-size: 0.95rem;
    }

    .sd-cost__link {
      color: #f4f4f4;
      font-family: var(--font-mono);
      font-size: 0.82rem;
      letter-spacing: 0.03em;
      text-decoration: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.35);
      padding-bottom: 0.15rem;
      transition: border-color 180ms ease;
    }

    .sd-cost__link:hover,
    .sd-cost__link:focus-visible {
      border-bottom-color: #f4f4f4;
      outline: none;
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
      .sd-connect__grid,
      .sd-demo__grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .sd-cost__stats {
        grid-template-columns: 1fr;
      }

      .sd-stat__value {
        white-space: normal;
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

  // Demo navegable que ejemplifica este tipo de sistema (null si el sistema no tiene uno).
  protected readonly demo = computed(() => getSoftwareArCaseForSystem(this.slug(), this.lang()));

  // Números de sección desde «Con qué se conecta»: se corren uno cuando hay demo.
  protected readonly num = computed(() => {
    const shift = this.demo() ? 1 : 0;
    return {
      connects: this.pad(5 + shift),
      notWhat: this.pad(6 + shift),
      build: this.pad(7 + shift),
      cost: this.pad(8 + shift),
      see: this.pad(9 + shift)
    };
  });

  // Fila de precios del hub para este tipo de sistema, ya en el idioma activo: el contenido
  // trae «1.500 a 4.000*» en ES y «1,500 to 4,000*» en EN. Acá solo se antepone «USD».
  protected readonly priceView = computed(() => {
    const row = getSoftwareArPriceForSystem(this.slug(), this.lang());
    return row ? { range: `USD ${row.range}`, timeline: row.timeline } : null;
  });

  // Primer párrafo de la sección del demo. En español interpola la categoría en minúscula; en
  // inglés no se interpola (evita el artículo a/an): el resumen EN que sigue ya nombra el tipo.
  protected readonly demoIntro = computed(() => {
    const ex = this.demo();
    if (!ex) return '';
    if (this.lang() === 'en') {
      return `We built ${ex.name} as a demo so you can browse a system of this kind end to end, with sample data.`;
    }
    const category = ex.category.replace(/^(Sistema|Software)/, (m) => m.toLowerCase());
    return `Armamos ${ex.name}, un ${category}, como demostración para que navegues un sistema de este tipo con datos de prueba.`;
  });

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

  // Reveal on scroll: listeners de scroll/resize + rAF que consultan los nodos vivos en cada
  // pasada. Antes era un IntersectionObserver creado en ngAfterViewInit, que observaba nodos que
  // la hidratación o el HMR del dev server reemplazan, y que además se creaba una sola vez: al
  // navegar entre slugs Angular reutiliza el componente y las secciones nuevas (el demo es
  // condicional) quedaban en opacity 0, o sea espacios vacíos enormes.
  private revealRaf = 0;
  private readonly onReveal = (): void => {
    if (this.revealRaf) return;
    this.revealRaf = requestAnimationFrame(() => {
      this.revealRaf = 0;
      const vh = window.innerHeight;
      this.host.nativeElement.querySelectorAll('.sd-reveal:not(.is-in)').forEach((el: Element) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add('is-in');
      });
    });
  };

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
    if (!isPlatformBrowser(this.platformId)) return;
    window.addEventListener('scroll', this.onReveal, { passive: true });
    window.addEventListener('resize', this.onReveal, { passive: true });
    this.onReveal();
    setTimeout(this.onReveal, 600);
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.onReveal);
    window.removeEventListener('resize', this.onReveal);
    if (this.revealRaf) cancelAnimationFrame(this.revealRaf);
  }
}

// Rótulos de UI (nombres de las secciones del .md + textos de interfaz). Los encabezados ### del
// documento aprobado se usan como títulos; los del demo y el costo son de las dos secciones nuevas.
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
    cta: 'Escribinos',
    demoTitle: 'Así se ve un sistema como este',
    demoNote:
      'Es un ejemplo, no el sistema de un cliente ni lo que vas a recibir. Lo que construyamos para vos arranca de tu operación.',
    demoCta: 'Navegar el demo',
    demoFicha: 'Ver la ficha',
    costTitle: 'Cuánto cuesta en Argentina',
    costRange: 'Inversión',
    costTimeline: 'Plazo',
    costText:
      'El precio se cierra por alcance antes de arrancar. Anticipo y saldo contra entrega, pagos por hito o una cuota mensual con soporte incluido.',
    costTextGeneral:
      'Un sistema a medida con nosotros sale entre USD 1.500 y 15.000, según el alcance. El precio se cierra por alcance antes de arrancar. Anticipo y saldo contra entrega, pagos por hito o una cuota mensual con soporte incluido.',
    costNote:
      '* Rangos y plazos de referencia. Cada proyecto se cotiza según su alcance. Nunca tenemos un precio listo, porque nunca son soluciones estandarizadas.',
    costNoteGeneral:
      'Cada proyecto se cotiza según su alcance. Nunca tenemos un precio listo, porque nunca son soluciones estandarizadas.',
    costLink: 'Ver todos los rangos por tipo de sistema'
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
    cta: 'Get in touch',
    demoTitle: 'What a system like this looks like',
    demoNote:
      "It is an example, not a client's system or what you will receive. What we build for you starts from your operation.",
    demoCta: 'Browse the demo',
    demoFicha: 'See the case',
    costTitle: 'What it costs in Argentina',
    costRange: 'Investment',
    costTimeline: 'Timeline',
    costText:
      'The price is closed by scope before we start. Deposit and balance on delivery, milestone payments or a monthly fee with support included.',
    costTextGeneral:
      'A custom system with us costs between USD 1,500 and 15,000, depending on scope. The price is closed by scope before we start. Deposit and balance on delivery, milestone payments or a monthly fee with support included.',
    costNote:
      '* Reference ranges and timelines. Every project is quoted by its scope. We never have a ready-made price, because these are never standardized solutions.',
    costNoteGeneral:
      'Every project is quoted by its scope. We never have a ready-made price, because these are never standardized solutions.',
    costLink: 'See all ranges by system type'
  }
} as const;
