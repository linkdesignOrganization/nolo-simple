import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCalculator,
  LucideCalendarDays,
  LucideCheck,
  LucideCircleCheck,
  LucideCircleOff,
  LucideCreditCard,
  LucideKeyRound,
  LucideMessageCircle,
  LucideReceiptText
} from '@lucide/angular';

import { ContactFooterComponent, ContactInfo, SystemContext } from '../components/contact-footer.component';
import { FaqAccordionComponent } from '../components/faq-accordion.component';
import { IndustriesSectionComponent } from '../components/industries-section.component';
import { ProjectStagesComponent } from '../components/project-stages.component';
import { DarkZoneDirective } from '../directives/dark-zone.directive';
import { TrackSectionDirective } from '../directives/track-section.directive';
import { AdsService } from '../services/ads.service';
import { LanguageService } from '../services/language.service';
import { LocalizeUrlPipe } from '../services/localize-url.pipe';
import { INDUSTRY_CARDS } from './industries-content';
import { getSoftwareArCases } from './software-ar-cases-content';
import {
  SoftwareArLink,
  SoftwareArParagraph,
  getSoftwareArContent,
  getSoftwareArLabels
} from './software-ar-content';

/**
 * Landing «Desarrollo de software a medida en Argentina» (/desarrollo-de-software-argentina),
 * con su par en inglés en /en/desarrollo-de-software-argentina (mismo slug, conectado al toggle).
 *
 * Indexable desde el primer push: canonical, hreflang recíproco, breadcrumb colgando de /software,
 * en el sitemap y en el llms.txt. Enlazada desde la sección de demos de /software y /en/software.
 *
 * Misma anatomía que las páginas de detalle: hero sobre el artefacto del shell, secciones con
 * número mono «01», zona oscura al centro (precios, proceso, qué incluye), FAQ y footer del sitio.
 * Contenido por idioma en software-ar-content.ts (hub) y software-ar-cases-content.ts (fichas),
 * resuelto con `computed` sobre `LanguageService.lang`. Los `appTrackSection` no se traducen: son
 * identificadores de telemetría que viajan al CRM.
 *
 * Gemela de software-cr-page.ts en Link Design: misma estructura, selectores y telemetría; cambian
 * marca, voz (voseo) y datos de contacto.
 */
@Component({
  selector: 'app-software-ar-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LocalizeUrlPipe,
    ContactFooterComponent,
    FaqAccordionComponent,
    IndustriesSectionComponent,
    ProjectStagesComponent,
    DarkZoneDirective,
    TrackSectionDirective,
    LucideCheck,
    LucideCircleCheck,
    LucideCircleOff,
    LucideCalculator,
    LucideCalendarDays,
    LucideCreditCard,
    LucideKeyRound,
    LucideMessageCircle,
    LucideReceiptText
  ],
  template: `
    <article class="sc">
      <!-- HERO: sobre el artefacto de grilla del shell -->
      <header class="sc-hero" appTrackSection="hero">
        <p class="sc-hero__eyebrow">{{ c().hero.eyebrow }}</p>
        <div class="sc-hero__main">
          <h1 class="sc-hero__title">
            {{ c().hero.title }}<img class="sc-hero__flag" src="/flag.svg" alt="Argentina" />
          </h1>
          <p class="sc-hero__lead">{{ c().hero.lead }}</p>
          <div class="sc-hero__actions">
            <a class="button" [href]="calendarLink()" target="_blank" rel="noopener noreferrer" (click)="onMeetingClick()">
              <span>{{ c().hero.ctaPrimary }}</span>
              <span class="button-arrow" aria-hidden="true">→</span>
            </a>
            <a class="button" [href]="info.whatsappLink" target="_blank" rel="noopener noreferrer" (click)="onWhatsappClick()">
              <span>{{ c().hero.ctaSecondary }}</span>
              <span class="button-arrow" aria-hidden="true">→</span>
            </a>
          </div>
          <p class="sc-hero__promise">{{ c().hero.promise }}</p>
        </div>
        <!-- Datos destacados: a la altura del título, en la columna derecha. La fecha va fuera del
             <dl> (solo admite dt, dd y div); el contenedor conserva la posición y el estilo. -->
        <div class="sc-hero__stats">
          <dl class="sc-hero__list">
            @for (s of c().hero.stats; track s.label) {
              <div class="sc-stat">
                <dt class="sc-stat__label">{{ s.label }}</dt>
                <dd class="sc-stat__value">{{ s.value }}</dd>
              </div>
            }
          </dl>
          <p class="sc-hero__updated"><time datetime="2026-09">{{ c().hero.updated }}</time></p>
        </div>
      </header>

      <!-- 01 — Esta página es para vos si -->
      <section class="sc-section sc-fit sc-reveal" appTrackSection="para-quien">
        <header class="sc-section__head">
          <span class="sc-num">01</span>
          <div>
            <h2 class="sc-label">{{ l().forWhom }}</h2>
            <p class="sc-section__intro">{{ c().forWhom.intro }}</p>
          </div>
        </header>
        <div class="sc-fit__grid">
          @for (f of c().forWhom.fits; track $index) {
            <article class="sc-card">
              <span class="sc-card__icon sc-icon--accent" aria-hidden="true">
                <svg lucideCircleCheck [size]="28" [strokeWidth]="1"></svg>
              </span>
              <span class="sc-card__tag">{{ l().fitsTag }}</span>
              <p>{{ f }}</p>
            </article>
          }
          <article class="sc-card sc-card--muted">
            <span class="sc-card__icon sc-icon--muted" aria-hidden="true">
              <svg lucideCircleOff [size]="28" [strokeWidth]="1"></svg>
            </span>
            <span class="sc-card__tag">{{ l().notForTag }}</span>
            <p>{{ c().forWhom.notFor }}</p>
          </article>
        </div>
      </section>

      <!-- 02 — Cómo trabajamos -->
      <section class="sc-section sc-how" appTrackSection="como-trabajamos">
        <header class="sc-section__head">
          <span class="sc-num">02</span>
          <h2 class="sc-label">{{ l().how }}</h2>
        </header>
        <div class="sc-how__body">
          @for (p of c().how.statement; track $index) {
            <p class="sc-statement">{{ p }}</p>
          }
        </div>
        <h3 class="sc-sublabel">{{ c().how.examplesTitle }}</h3>
        <ol class="sc-examples">
          @for (e of c().how.examples; track $index) {
            <li class="sc-example sc-reveal">
              <span class="sc-example__n">{{ pad($index + 1) }}</span>
              <p class="sc-example__text">
                <span class="sc-example__if">{{ e.if }}</span>
                <span class="sc-example__then">{{ e.then }}</span>
              </p>
            </li>
          }
        </ol>
        <div class="sc-how__closing">
          @for (p of c().how.closing; track $index) {
            <p>{{ p }}</p>
          }
        </div>
      </section>

      <!-- 03 — Qué construimos: los sistemas de demostración, por categoría, cada uno con su ficha -->
      <section class="sc-section sc-systems" id="casos" appTrackSection="que-construimos">
        <header class="sc-section__head">
          <span class="sc-num">03</span>
          <div>
            <h2 class="sc-label">{{ l().systems }}</h2>
            <p class="sc-section__intro">{{ c().systems.intro }}</p>
          </div>
        </header>
        <div class="sc-systems__grid">
          @for (k of cases(); track k.slug) {
            <a class="sc-system sc-reveal" [routerLink]="('/desarrollo-de-software-argentina/' + k.slug) | localizeUrl">
              <span class="sc-system__tag">{{ k.kind }}</span>
              <h3 class="sc-system__title">{{ k.category }}</h3>
              <p class="sc-system__body">{{ k.summary }}</p>
              <p class="sc-system__for">{{ k.forWhom }}</p>
              <span class="sc-system__link">{{ l().systemLink }} →</span>
            </a>
          }
        </div>
        <div class="sc-integrations">
          <h3 class="sc-sublabel sc-integrations__title">{{ c().systems.integrationsTitle }}</h3>
          <p class="sc-integrations__intro">{{ c().systems.integrationsIntro }}</p>
          <ul class="sc-integrations__grid">
            @for (i of c().systems.integrations; track i.icon) {
              <li class="sc-integration sc-reveal">
                <span class="sc-integration__icon" aria-hidden="true">
                  @switch (i.icon) {
                    @case ('receipt') {
                      <svg lucideReceiptText [size]="30" [strokeWidth]="1"></svg>
                    }
                    @case ('credit-card') {
                      <svg lucideCreditCard [size]="30" [strokeWidth]="1"></svg>
                    }
                    @case ('message-circle') {
                      <svg lucideMessageCircle [size]="30" [strokeWidth]="1"></svg>
                    }
                    @case ('calculator') {
                      <svg lucideCalculator [size]="30" [strokeWidth]="1"></svg>
                    }
                    @case ('calendar-days') {
                      <svg lucideCalendarDays [size]="30" [strokeWidth]="1"></svg>
                    }
                    @case ('key-round') {
                      <svg lucideKeyRound [size]="30" [strokeWidth]="1"></svg>
                    }
                  }
                </span>
                <p class="sc-integration__text">{{ i.text }}</p>
              </li>
            }
          </ul>
        </div>
      </section>

      <!-- 04 + proceso + 05 — Zona oscura: precios, proceso, qué incluye -->
      <div class="sc-dark" appDarkZone>
        <section class="sc-section sc-pricing" id="precios" appTrackSection="precios">
          <header class="sc-section__head">
            <span class="sc-num">04</span>
            <h2 class="sc-label">{{ l().pricing }}</h2>
          </header>
          <p class="sc-pricing__lead">{{ c().pricing.lead }}</p>
          <div class="sc-table-wrap">
            <table class="sc-table">
              <thead>
                <tr>
                  @for (col of c().pricing.columns; track $index) {
                    <th scope="col">{{ col }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (r of c().pricing.rows; track r.type) {
                  <tr>
                    <td>
                      @if (r.system) {
                        <a class="sc-table__link" [routerLink]="('/software/' + r.system) | localizeUrl">{{ r.type }}</a>
                      } @else {
                        {{ r.type }}
                      }
                    </td>
                    <td class="sc-table__num">{{ r.range }}</td>
                    <td class="sc-table__num">{{ r.timeline }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <p class="sc-table__note">{{ c().pricing.note }}</p>
          <div class="sc-pricing__grid">
            <div class="sc-pricing__col sc-pricing__col--wide">
              <h3 class="sc-sublabel">{{ c().pricing.factorsTitle }}</h3>
              <ul class="sc-checklist">
                @for (f of c().pricing.factors; track $index) {
                  <li class="sc-checklist__item">
                    <span class="sc-checklist__icon" aria-hidden="true">
                      <svg lucideCheck [size]="18" [strokeWidth]="1.5"></svg>
                    </span>
                    <span>{{ f }}</span>
                  </li>
                }
              </ul>
            </div>
            <div class="sc-pricing__col">
              <h3 class="sc-sublabel">{{ c().pricing.paymentTitle }}</h3>
              <p>{{ c().pricing.payment }}</p>
              <h3 class="sc-sublabel">{{ c().pricing.afterTitle }}</h3>
              <p>{{ c().pricing.after }}</p>
            </div>
          </div>
        </section>

        <!-- Proceso: el componente del sitio trae su propio título (sin número, como en /software). -->
        <section class="sc-process" id="proceso">
          <app-project-stages
            appTrackSection="proceso"
            [title]="c().process.title"
            [intro]="c().process.intro"
            [stages]="c().process.stages"
          />
          <p class="sc-process__closing">{{ c().process.closing }}</p>
        </section>

        <section class="sc-section sc-included sc-reveal" appTrackSection="incluye">
          <header class="sc-section__head">
            <span class="sc-num">05</span>
            <h2 class="sc-label">{{ l().included }}</h2>
          </header>
          <div class="sc-included__grid">
            @for (i of c().included.items; track i.title) {
              <article class="sc-panel">
                <h3 class="sc-panel__title">{{ i.title }}</h3>
                <p>{{ i.body }}</p>
              </article>
            }
          </div>
        </section>
      </div>

      <!-- 06 — Cómo elegir -->
      <section class="sc-section sc-choose" appTrackSection="como-elegir">
        <header class="sc-section__head">
          <span class="sc-num">06</span>
          <div>
            <h2 class="sc-label">{{ l().choose }}</h2>
            <p class="sc-section__intro">{{ c().choose.intro }}</p>
          </div>
        </header>
        <ol class="sc-choose__list">
          @for (i of c().choose.items; track i.title) {
            <li class="sc-choose__item sc-reveal">
              <span class="sc-choose__n">{{ pad($index + 1) }}</span>
              <div class="sc-choose__text">
                <span class="sc-choose__title">{{ i.title }}</span>
                <span class="sc-choose__body">{{ i.body }}</span>
              </div>
            </li>
          }
        </ol>
        <article class="sc-card sc-card--muted sc-choose__honest">
          <span class="sc-card__icon sc-icon--muted" aria-hidden="true">
            <svg lucideCircleOff [size]="28" [strokeWidth]="1"></svg>
          </span>
          <span class="sc-card__tag">{{ c().choose.honestTitle }}</span>
          <p>{{ c().choose.honest }}</p>
        </article>
      </section>

      <!-- Industrias: componente del sitio (mismo mazo que /software), con su propio título. -->
      <app-industries
        id="industrias"
        appTrackSection="industrias"
        [heading]="c().industries.heading"
        [intro]="c().industries.intro"
        [items]="industryCards()"
      />

      <!-- 07 — Quiénes somos + dónde trabajamos -->
      <section class="sc-section sc-about" appTrackSection="quienes-somos">
        <header class="sc-section__head">
          <span class="sc-num">07</span>
          <h2 class="sc-label">{{ l().about }}</h2>
        </header>
        <div class="sc-about__body">
          @for (p of c().about.paragraphs; track $index) {
            <p class="sc-about__text">
              @for (part of parts(p); track $index) {
                @if (isLink(part)) {
                  <a class="sc-about__link" [href]="part.href" target="_blank" rel="noopener noreferrer">{{ part.text }}</a>
                } @else {
                  <span>{{ part }}</span>
                }
              }
            </p>
          }
          <h3 class="sc-sublabel sc-about__sublabel">{{ c().industries.zonesTitle }}</h3>
          <p class="sc-about__text">{{ c().industries.zones }}</p>
          <p class="sc-about__contact">{{ c().about.contact }}</p>
        </div>
      </section>

      <!-- 11 — Preguntas frecuentes -->
      <app-faq-accordion id="faq" appTrackSection="faq" [heading]="l().faq" [items]="c().faq" />
    </article>

    <app-contact-footer
      appDarkZone
      id="hablemos"
      appTrackSection="hablemos"
      [info]="info"
      [systemContext]="context"
    />
  `,
  styles: `
    :host {
      display: block;
    }

    .sc {
      display: block;
    }

    /* Cada sección tapa el artefacto del shell con un fondo full-bleed opaco (igual que el
       detalle de sistema). El hero no lo lleva: deja ver la grilla. */
    .sc-section {
      position: relative;
      z-index: 1;
      padding-block: var(--section-py);
    }

    .sc-section::before {
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
    /* Dos columnas: título, lead y acciones a la izquierda; los datos destacados a la derecha,
       arrancando a la altura del título (align-items: start). El bloque completo se asienta al
       pie del hero (align-content: end), como en las páginas de detalle. */
    .sc-hero {
      position: relative;
      z-index: 1;
      display: grid;
      /* La columna del título toma el ancho que sobra; la de datos es fija, para que el
         título parta en tres líneas como en el resto de los heros. */
      grid-template-columns: minmax(0, 1fr) minmax(18rem, 26rem);
      column-gap: clamp(2rem, 5vw, 5rem);
      row-gap: clamp(1.2rem, 2.5vw, 2rem);
      align-items: start;
      align-content: end;
      min-height: clamp(22rem, 48vh, 34rem);
      padding-block: clamp(2.5rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem);
    }

    .sc-hero::after {
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

    .sc-hero__eyebrow {
      grid-column: 1 / -1;
      margin: 0;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .sc-hero__main {
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
    }

    .sc-hero__title {
      margin: 0;
      max-width: 16ch;
      color: var(--ink);
      font-size: var(--hero-title-size);
      font-weight: var(--hero-title-weight);
      letter-spacing: var(--hero-title-tracking);
      line-height: var(--hero-title-leading);
      text-wrap: balance;
    }

    .sc-hero__flag {
      display: inline-block;
      width: 0.55em;
      height: auto;
      margin-left: 0.22em;
      vertical-align: baseline;
      transform: translateY(0.02em);
    }

    .sc-hero__lead {
      margin: 0;
      max-width: 62ch;
      color: var(--ink);
      font-size: var(--hero-lead-size);
      line-height: var(--hero-lead-leading);
      text-wrap: pretty;
    }

    .sc-hero__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .sc-hero__promise {
      margin: 0;
      max-width: 62ch;
      color: var(--ink);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .sc-hero__stats {
      display: flex;
      flex-direction: column;
      margin: 0;
      /* La primera línea del bloque queda a la altura de la parte alta del título. */
      padding-top: 0.15em;
    }

    .sc-hero__list {
      margin: 0;
    }

    .sc-stat {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 1rem 0;
      border-top: 1px solid var(--line);
    }

    .sc-stat__label {
      order: 2;
      color: var(--ink);
      font-size: 0.92rem;
      line-height: 1.4;
    }

    .sc-stat__value {
      order: 1;
      margin: 0;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: clamp(1.8rem, 3vw, 2.6rem);
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .sc-hero__updated {
      margin: 0;
      padding-top: 1rem;
      border-top: 1px solid var(--line);
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    /* ── Rótulos / números de sección ─────────────────────────────────────── */
    .sc-num {
      display: block;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .sc-label {
      margin: 0;
      max-width: 22ch;
      color: var(--ink);
      font-size: clamp(1.5rem, 3vw, 2.1rem);
      font-weight: 400;
      letter-spacing: -0.04em;
      line-height: 1.05;
      text-wrap: balance;
    }

    .sc-sublabel {
      margin: 0 0 1rem;
      color: var(--ink);
      font-size: 1.15rem;
      font-weight: 500;
      letter-spacing: -0.02em;
      line-height: 1.3;
    }

    .sc-section__head {
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 1fr);
      align-items: baseline;
      gap: 1rem;
      margin-bottom: clamp(1.8rem, 3.5vw, 3rem);
    }

    .sc-section__intro {
      margin: 1rem 0 0;
      max-width: 60ch;
      color: var(--ink);
      font-size: 1.05rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    .sc-icon--accent { color: var(--accent); }
    .sc-icon--muted { color: var(--muted); }

    /* ── Cards (01 para ti si / 08 honesta) ───────────────────────────────── */
    .sc-fit__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(1rem, 2vw, 1.5rem);
    }

    .sc-card {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      padding: clamp(1.4rem, 2.2vw, 2rem);
      border: 1px solid var(--line);
      border-radius: 0.9rem;
      background: #fafafa;
    }

    .sc-card--muted {
      background: transparent;
      border-style: dashed;
    }

    .sc-card__icon {
      display: inline-flex;
    }

    .sc-card__tag {
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .sc-card p {
      margin: 0;
      color: var(--ink);
      font-size: 1.05rem;
      line-height: 1.5;
      text-wrap: pretty;
    }

    .sc-card--muted p {
      color: var(--ink);
    }

    /* ── 02 Cómo trabajamos ───────────────────────────────────────────────── */
    .sc-how__body {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      max-width: 48rem;
      margin-bottom: clamp(2rem, 4vw, 3.5rem);
    }

    .sc-statement {
      margin: 0;
      color: var(--ink);
      font-size: clamp(1.3rem, 2.3vw, 1.9rem);
      font-weight: 400;
      letter-spacing: -0.03em;
      line-height: 1.3;
      text-wrap: pretty;
    }

    .sc-examples {
      display: flex;
      flex-direction: column;
      margin: 0 0 clamp(2rem, 4vw, 3rem);
      padding: 0;
      list-style: none;
    }

    .sc-example {
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 1fr);
      gap: 1rem;
      padding: clamp(1.2rem, 2vw, 1.6rem) 0;
      border-top: 1px solid var(--line);
    }

    .sc-example:last-child {
      border-bottom: 1px solid var(--line);
    }

    .sc-example__n {
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      line-height: 1.6;
    }

    .sc-example__text {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      margin: 0;
      max-width: 60ch;
    }

    .sc-example__if {
      color: var(--ink);
      font-size: 1.05rem;
      line-height: 1.5;
    }

    .sc-example__then {
      color: var(--ink);
      font-size: 1.12rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: 1.4;
    }

    .sc-how__closing {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 60ch;
    }

    .sc-how__closing p {
      margin: 0;
      color: var(--ink);
      font-size: 1.08rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* ── 03 Qué construimos ───────────────────────────────────────────────── */
    .sc-systems__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(1rem, 2vw, 1.5rem);
      margin-bottom: clamp(2.5rem, 5vw, 4rem);
    }

    .sc-system {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      padding: clamp(1.4rem, 2.2vw, 2rem);
      border: 1px solid var(--line);
      border-radius: 0.9rem;
      background: #fafafa;
      color: inherit;
      text-decoration: none;
      transition: border-color 180ms ease, transform 220ms ease;
    }

    .sc-system:hover,
    .sc-system:focus-visible {
      border-color: var(--line-strong);
      transform: translateY(-2px);
      outline: none;
    }

    .sc-system__tag {
      color: var(--accent);
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .sc-system__title {
      margin: 0;
      color: var(--ink);
      font-size: 1.2rem;
      font-weight: 500;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }

    .sc-system__body {
      margin: 0;
      color: var(--ink);
      font-size: 1rem;
      line-height: 1.5;
    }

    .sc-system__for {
      margin: 0;
      color: var(--ink);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .sc-system__link {
      margin-top: auto;
      padding-top: 0.6rem;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.78rem;
      letter-spacing: 0.04em;
    }

    /* Bloque centrado: título, intro y grilla de integraciones con icono. */
    .sc-integrations {
      max-width: 60rem;
      margin: 0 auto;
      text-align: center;
    }

    .sc-integrations__title {
      margin-bottom: 0.8rem;
      font-size: clamp(1.3rem, 2.2vw, 1.6rem);
    }

    .sc-integrations__intro {
      margin: 0 auto clamp(1.8rem, 3vw, 2.6rem);
      max-width: 56ch;
      color: var(--ink);
      font-size: 1.05rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    .sc-integrations__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(1rem, 2vw, 1.5rem);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .sc-integration {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.9rem;
      padding: clamp(1.4rem, 2.2vw, 2rem) clamp(1rem, 1.8vw, 1.5rem);
      border: 1px solid var(--line);
      border-radius: 0.9rem;
      background: #fafafa;
    }

    .sc-integration__icon {
      display: inline-flex;
      color: var(--accent);
    }

    .sc-integration__text {
      margin: 0;
      color: var(--ink);
      font-size: 0.98rem;
      line-height: 1.5;
      text-wrap: pretty;
    }

    .sc-checklist {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .sc-checklist__item {
      display: grid;
      grid-template-columns: 1.6rem minmax(0, 1fr);
      gap: 0.8rem;
      padding: 0.9rem 0;
      border-top: 1px solid var(--line);
      color: var(--ink);
      font-size: 1.02rem;
      line-height: 1.55;
      max-width: 70ch;
    }

    .sc-checklist__item:last-child {
      border-bottom: 1px solid var(--line);
    }

    .sc-checklist__icon {
      display: inline-flex;
      padding-top: 0.2rem;
    }

    /* ── Zona oscura: 04 precios, proceso, 05 incluye ─────────────────────── */
    .sc-dark .sc-label,
    .sc-dark .sc-sublabel,
    .sc-dark .sc-panel__title {
      color: #f4f4f4;
    }

    .sc-dark .sc-num,
    .sc-dark .sc-checklist__icon {
      color: #f4f4f4;
    }

    .sc-dark p,
    .sc-dark .sc-checklist__item {
      color: #f4f4f4;
    }

    .sc-dark .sc-checklist__item {
      border-color: rgba(255, 255, 255, 0.16);
    }

    .sc-pricing__lead {
      margin: 0 0 clamp(1.8rem, 3vw, 2.5rem);
      max-width: 62ch;
      font-size: clamp(1.15rem, 1.8vw, 1.4rem);
      line-height: 1.5;
      text-wrap: pretty;
    }

    .sc-table-wrap {
      overflow-x: auto;
      margin-bottom: clamp(2rem, 4vw, 3rem);
    }

    .sc-table {
      width: 100%;
      min-width: 40rem;
      border-collapse: collapse;
      color: #f4f4f4;
      font-size: 0.98rem;
    }

    .sc-table th,
    .sc-table td {
      padding: 0.9rem 1rem 0.9rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.16);
      text-align: left;
      vertical-align: top;
      line-height: 1.45;
    }

    .sc-table tbody tr:last-child td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.16);
    }

    .sc-table th {
      color: #f4f4f4;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .sc-table__num {
      font-family: var(--font-mono);
      font-size: 0.9rem;
      white-space: nowrap;
    }

    /* Tipo de sistema enlazado a su página: mismo color del texto de la tabla, subrayado fino. */
    .sc-table__link {
      color: inherit;
      text-decoration: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.35);
      padding-bottom: 0.1rem;
      transition: border-color 180ms ease;
    }

    .sc-table__link:hover,
    .sc-table__link:focus-visible {
      border-bottom-color: #f4f4f4;
    }

    .sc-table__note {
      margin: -1rem 0 clamp(2rem, 4vw, 3rem);
      max-width: 70ch;
      font-size: 0.95rem;
      line-height: 1.55;
    }

    .sc-pricing__grid {
      display: grid;
      grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
      gap: clamp(2rem, 4vw, 4rem);
      align-items: start;
    }

    .sc-pricing__col p {
      margin: 0 0 1.6rem;
      font-size: 1.02rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    .sc-process {
      position: relative;
      z-index: 1;
      padding-top: calc(var(--section-py) * 0.5);
    }

    .sc-process__closing {
      margin: 0;
      padding-bottom: var(--section-py);
      max-width: 60ch;
      font-size: 1.05rem;
      line-height: 1.6;
    }

    .sc-included__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(1rem, 2vw, 1.5rem);
    }

    .sc-panel {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      padding: clamp(1.4rem, 2.2vw, 2rem);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 0.9rem;
      background: #161616;
    }

    .sc-panel__title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
      letter-spacing: -0.02em;
      line-height: 1.3;
    }

    .sc-panel p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    /* ── 06 Cómo elegir ───────────────────────────────────────────────────── */
    .sc-choose__list {
      display: flex;
      flex-direction: column;
      margin: 0 0 clamp(1.5rem, 3vw, 2.5rem);
      padding: 0;
      list-style: none;
    }

    .sc-choose__item {
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 1fr);
      gap: 1rem;
      padding: clamp(1.1rem, 2vw, 1.5rem) 0;
      border-top: 1px solid var(--line);
    }

    .sc-choose__item:last-child {
      border-bottom: 1px solid var(--line);
    }

    .sc-choose__n {
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      line-height: 1.6;
    }

    .sc-choose__text {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      max-width: 60ch;
    }

    .sc-choose__title {
      color: var(--ink);
      font-size: 1.12rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: 1.35;
    }

    .sc-choose__body {
      color: var(--ink);
      font-size: 0.98rem;
      line-height: 1.5;
    }

    .sc-choose__honest {
      max-width: 48rem;
    }

    /* ── 07 Quiénes somos ─────────────────────────────────────────────────── */
    .sc-about__body {
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 1fr);
      gap: 1rem;
    }

    .sc-about__body > * {
      grid-column: 2;
    }

    .sc-about__text {
      margin: 0 0 1.2rem;
      max-width: 62ch;
      color: var(--ink);
      font-size: 1.12rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* Enlace dentro del texto de «Quiénes somos» (la marca Nolõ hacia nolo.ar). */
    .sc-about__link {
      color: var(--ink);
      font-weight: 600;
      text-decoration: none;
      border-bottom: 1px solid var(--line-strong);
      transition: border-color 180ms ease, color 180ms ease;
    }

    .sc-about__link:hover,
    .sc-about__link:focus-visible {
      color: var(--accent);
      border-bottom-color: var(--accent);
      outline: none;
    }

    .sc-about__sublabel {
      margin: 0.6rem 0 0.8rem;
    }

    .sc-about__contact {
      margin: 0;
      max-width: 62ch;
      color: var(--ink);
      font-size: 1.02rem;
      line-height: 1.6;
    }

    /* ── Reveal on scroll (guardado en TS con isPlatformBrowser para el SSG) ── */
    .sc-reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 600ms ease, transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .sc-reveal.is-in {
      opacity: 1;
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .sc-reveal {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }

    /* ── Responsive ───────────────────────────────────────────────────────── */
    @media (max-width: 1024px) {
      .sc-hero {
        grid-template-columns: 1fr;
      }

      .sc-fit__grid,
      .sc-systems__grid,
      .sc-integrations__grid,
      .sc-included__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 760px) {
      .sc-fit__grid,
      .sc-systems__grid,
      .sc-integrations__grid,
      .sc-included__grid,
      .sc-pricing__grid {
        grid-template-columns: 1fr;
      }

      .sc-section__head,
      .sc-about__body {
        grid-template-columns: 2rem minmax(0, 1fr);
        gap: 0.75rem;
      }

      .sc-example,
      .sc-choose__item {
        grid-template-columns: 1.6rem minmax(0, 1fr);
        gap: 0.8rem;
      }

      .sc-hero__title {
        max-width: none;
      }

      .sc-dark p,
      .sc-dark .sc-checklist__item,
      .sc-dark .sc-panel p {
        color: #f4f4f4;
      }
    }
  `
})
export class SoftwareArPageComponent implements OnDestroy {
  /** Un párrafo de «Quiénes somos» puede traer enlaces intercalados; se normaliza a trozos. */
  protected parts(p: SoftwareArParagraph): ReadonlyArray<string | SoftwareArLink> {
    return typeof p === 'string' ? [p] : p;
  }

  protected isLink(part: string | SoftwareArLink): part is SoftwareArLink {
    return typeof part !== 'string';
  }

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly i18n = inject(LanguageService);
  private readonly ads = inject(AdsService);
  protected readonly lang = this.i18n.lang;

  // Contenido, rótulos, mazo de industrias y fichas en el idioma activo. El toggle navega al otro
  // árbol de rutas y recrea la página; los `computed` cubren además cualquier cambio de idioma en vivo.
  protected readonly c = computed(() => getSoftwareArContent(this.lang()));
  protected readonly l = computed(() => getSoftwareArLabels(this.lang()));
  protected readonly industryCards = computed(() => INDUSTRY_CARDS(this.lang()));
  protected readonly cases = computed(() => getSoftwareArCases(this.lang()));

  // Footer del sitio (mismos datos que las páginas de detalle de Nolõ).
  protected readonly info: ContactInfo = {
    email: 'hola@nolo.ar',
    whatsappLink: 'https://wa.me/5491133337180',
    calendarLink: 'https://cal.com/nolo.ar/reunion-con-equipo-nolo',
    calendarLinkEn: 'https://cal.com/nolo.ar/meeting-with-nolo-team',
    location: 'Buenos Aires, Argentina'
  };

  // CTA del hero: reunión de cal.com por idioma, con la misma regla que el footer.
  protected readonly calendarLink = computed(() =>
    this.lang() === 'en' && this.info.calendarLinkEn ? this.info.calendarLinkEn : this.info.calendarLink
  );

  // Los dos botones del hero reportan a Google Ads la misma conversión que en el resto del sitio
  // (hero de /software y /web, footer, /contacto). El enlace sigue abriéndose en pestaña nueva.
  protected onMeetingClick(): void {
    this.ads.scheduleMeeting();
  }

  protected onWhatsappClick(): void {
    this.ads.whatsapp();
  }

  // Etiqueta el lead en el CRM con la página de origen (misma vía que el detalle de sistema). El
  // nombre queda en español en ambos idiomas: es una etiqueta interna y el footer antepone su prefijo.
  protected readonly context: SystemContext = {
    name: 'Landing desarrollo de software Argentina',
    slug: 'desarrollo-de-software-argentina'
  };

  constructor() {
    afterNextRender(() => this.setupReveal());
  }

  // Índice con cero a la izquierda (01, 02, …).
  protected pad(n: number): string {
    return String(n).padStart(2, '0');
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
        .querySelectorAll('.sc-reveal:not(.is-in)')
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
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.onReveal);
    window.removeEventListener('resize', this.onReveal);
    if (this.revealRaf) cancelAnimationFrame(this.revealRaf);
  }
}
