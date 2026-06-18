import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ContactFooterComponent, ContactInfo } from '../components/contact-footer.component';
import { DevTypeBlock, DevTypesComponent } from '../components/dev-types.component';
import { FaqAccordionComponent, FaqItem } from '../components/faq-accordion.component';
import { FeatureShowcaseComponent, ShowcaseFeature } from '../components/feature-showcase.component';
import { FeatureTab, FeatureTabsComponent } from '../components/feature-tabs.component';
import { PortfolioRow, PortfolioTableComponent } from '../components/portfolio-table.component';
import { ProjectStage, ProjectStagesComponent } from '../components/project-stages.component';
import { ServiceItem, ServicesStackComponent } from '../components/services-stack.component';
import { IndustriesSectionComponent } from '../components/industries-section.component';
import { TechnicalGridSurfaceComponent } from '../components/technical-grid-surface.component';
import { Viewcase, ViewcasesComponent } from '../components/viewcases.component';
import { CapabilityCard, WebCapabilitiesComponent } from '../components/web-capabilities.component';
import { HeroAction, HeroMarquee, HeroSlide, WebHeroComponent } from '../components/web-hero.component';
import { Principle, WorkPrinciplesComponent } from '../components/work-principles.component';
import { DarkZoneDirective } from '../directives/dark-zone.directive';
import { LanguageService } from '../services/language.service';
import { AdsService } from '../services/ads.service';
import { LocalizeUrlPipe } from '../services/localize-url.pipe';
import { IndustryCard } from './industries-content';

export type LandingModuleFigure =
  | 'arrows'
  | 'bars'
  | 'dots'
  | 'editor'
  | 'grid'
  | 'rings'
  | 'slash'
  | 'type';

export type LandingModule = {
  title: string;
  body: string;
  figure: LandingModuleFigure;
  link?: string;
  linkLabel?: string;
  span?: 'standard' | 'tall' | 'wide';
};

export type LandingMatrixItem = {
  accent?: boolean;
  meta: string;
  title: string;
};

export type HomeArm = {
  body: string;
  cta: string;
  eyebrow: string;
  route: string;
  title: string;
  type: 'software' | 'web';
};

export type LandingData = {
  capabilities?: { cards: CapabilityCard[]; heading: string };
  closingLink?: string;
  closingLinkLabel?: string;
  closingText?: string;
  closingTitle?: string;
  contact?: ContactInfo;
  ctaPrimary?: string;
  ctaPrimaryLink?: string;
  ctaSecondary?: string;
  ctaSecondaryLink?: string;
  description: string;
  devTypes?: { blocks: DevTypeBlock[] };
  eyebrow: string;
  faq?: { heading: string; items: FaqItem[] };
  featureTabs?: FeatureTab[];
  industries?: { heading: string; intro: string; items: IndustryCard[] };
  homeArms?: [HomeArm, HomeArm];
  isHome?: boolean;
  matrixIntro?: string;
  matrixItems?: LandingMatrixItem[];
  matrixTitle?: string;
  modules?: LandingModule[];
  portfolio?: { rows: PortfolioRow[] };
  principles?: { cards: Principle[]; heading: string };
  process?: { intro: string; stages: ProjectStage[]; title: string };
  sectionIntro?: string;
  sectionTitle?: string;
  showcase?: { features: ShowcaseFeature[]; title: string };
  stats: Array<{ label: string; value: string }>;
  systems?: { heading: string; intro: string; items: ServiceItem[] };
  theme?: 'software' | 'website';
  title: string;
  viewcases?: { intro: string; items: Viewcase[]; title: string };
  webHero?: { actions: HeroAction[]; lead: string; marquee?: HeroMarquee; slides: string[]; title: string };
  webProcess?: { intro: string; stages: ProjectStage[]; title: string };
};

@Component({
  selector: 'app-landing-page',
  host: {
    '[class.landing-page-host--home]': 'page().isHome'
  },
  imports: [
    RouterLink,
    TechnicalGridSurfaceComponent,
    DarkZoneDirective,
    ContactFooterComponent,
    DevTypesComponent,
    FaqAccordionComponent,
    FeatureShowcaseComponent,
    FeatureTabsComponent,
    PortfolioTableComponent,
    ProjectStagesComponent,
    ServicesStackComponent,
    IndustriesSectionComponent,
    ViewcasesComponent,
    WebCapabilitiesComponent,
    WebHeroComponent,
    WorkPrinciplesComponent,
    LocalizeUrlPipe
  ],
  template: `
    <div
      class="page"
      [class.page--home]="page().isHome"
      [class.page--software]="page().theme === 'software'"
    >
      @if (page().isHome) {
        <section
          class="split reveal reveal--delayed"
          [class.split--software-active]="activeArm() === 'software'"
          [class.split--web-active]="activeArm() === 'web'"
          aria-label="Nolo services"
        >
          @for (arm of page().homeArms ?? []; track arm.route; let index = $index) {
            <article
              class="arm"
              appTechnicalGridSurface
              [class.arm--software]="arm.type === 'software'"
              [class.arm--web]="arm.type === 'web'"
              [appTechnicalGridSeed]="index"
              (mouseenter)="setActiveArm(arm.type)"
              (mouseleave)="setActiveArm(null)"
              (focusin)="setActiveArm(arm.type)"
              (focusout)="setActiveArm(null)"
            >
              <div class="arm-topline">
                <span class="arm-kicker">{{ arm.eyebrow }}</span>
              </div>

              <div class="arm-body">
                <h2>{{ arm.title }}</h2>
                <p>{{ arm.body }}</p>
              </div>

              <div class="arm-footer">
                <a class="button arm-button" [routerLink]="arm.route | localizeUrl">
                  <span>{{ arm.cta }}</span>
                  <span class="button-arrow" aria-hidden="true">→</span>
                </a>
                <span class="arm-mark" aria-hidden="true">{{ arm.type === 'software' ? '01' : '02' }}</span>
              </div>
            </article>
          }
        </section>
      } @else {
        @if (page().webHero; as wh) {
          <app-web-hero
            [title]="wh.title"
            [lead]="wh.lead"
            [actions]="wh.actions"
            [slides]="heroSlides()"
            [marquee]="wh.marquee ?? null"
          />
        }

        @if (!page().webHero) {
        <section class="hero" [class.hero--software]="page().theme === 'software'">
          <div class="hero-title">
            @if (page().eyebrow) {
              <span class="eyebrow">{{ page().eyebrow }}</span>
            }
            <h1>{{ page().title }}</h1>
          </div>

          @if (page().description || page().ctaPrimary || page().ctaSecondary) {
            <div class="hero-copy">
              @if (page().description) {
                <p>{{ page().description }}</p>
              }

              @if (page().ctaPrimary || page().ctaSecondary) {
                <div class="actions">
                  @if (page().ctaPrimary) {
                    @if (isHrefLink(page().ctaPrimaryLink)) {
                      <a
                        class="button"
                        [attr.href]="page().ctaPrimaryLink"
                        (click)="onCtaClick(page().ctaPrimaryLink)"
                        [attr.target]="isExternalLink(page().ctaPrimaryLink) ? '_blank' : null"
                        [attr.rel]="isExternalLink(page().ctaPrimaryLink) ? 'noopener noreferrer' : null"
                      >
                        <span>{{ page().ctaPrimary }}</span>
                        <span class="button-arrow" aria-hidden="true">→</span>
                      </a>
                    } @else {
                      <a class="button" [routerLink]="(page().ctaPrimaryLink ?? '/') | localizeUrl">
                        <span>{{ page().ctaPrimary }}</span>
                        <span class="button-arrow" aria-hidden="true">→</span>
                      </a>
                    }
                  }

                  @if (page().ctaSecondary) {
                    @if (isHrefLink(page().ctaSecondaryLink)) {
                      <a
                        class="button"
                        [attr.href]="page().ctaSecondaryLink"
                        (click)="onCtaClick(page().ctaSecondaryLink)"
                        [attr.target]="isExternalLink(page().ctaSecondaryLink) ? '_blank' : null"
                        [attr.rel]="isExternalLink(page().ctaSecondaryLink) ? 'noopener noreferrer' : null"
                      >
                        <span>{{ page().ctaSecondary }}</span>
                        <span class="button-arrow" aria-hidden="true">→</span>
                      </a>
                    } @else {
                      <a class="button" [routerLink]="(page().ctaSecondaryLink ?? '/') | localizeUrl">
                        <span>{{ page().ctaSecondary }}</span>
                        <span class="button-arrow" aria-hidden="true">→</span>
                      </a>
                    }
                  }
                </div>
              }
            </div>
          }
        </section>
        }

        @if (page().capabilities; as cap) {
          <app-web-capabilities id="capacidades" [heading]="cap.heading" [cards]="cap.cards" />
        }

        @if (page().devTypes; as dt) {
          <app-dev-types id="servicios" appDarkZone [blocks]="dt.blocks" />
        }

        @if (page().portfolio; as pf) {
          <app-portfolio-table id="portfolio" [rows]="pf.rows" />
        }

        @if (page().webProcess; as wp) {
          <app-project-stages [light]="true" [title]="wp.title" [intro]="wp.intro" [stages]="wp.stages" />
        }

        @if ((page().featureTabs ?? []).length) {
          <app-feature-tabs class="hero-feature" [tabs]="page().featureTabs ?? []" />
        }

        @if (page().systems; as systems) {
          <app-services-stack
            id="sistemas"
            [heading]="systems.heading"
            [intro]="systems.intro"
            [items]="systems.items"
          />
        }

        @if (page().principles; as principles) {
          <app-work-principles [heading]="principles.heading" [cards]="principles.cards" />
        }

        @if (page().showcase || page().process) {
          <div appDarkZone>
            @if (page().showcase; as showcase) {
              <app-feature-showcase id="showcases" [title]="showcase.title" [features]="showcase.features" />
            }

            @if (page().process; as process) {
              <app-project-stages id="proceso" [title]="process.title" [intro]="process.intro" [stages]="process.stages" />
            }
          </div>
        }

        @if (page().viewcases; as v) {
          <app-viewcases id="casos" [title]="v.title" [intro]="v.intro" [items]="v.items" />
        }

        @if (page().industries; as ind) {
          <app-industries id="industrias" [heading]="ind.heading" [intro]="ind.intro" [items]="ind.items" />
        }

        @if (page().faq; as faq) {
          <app-faq-accordion [heading]="faq.heading" [items]="faq.items" />
        }

        @if (page().stats.length) {
          <section class="stats-grid" aria-label="Page highlights">
            @for (stat of page().stats; track stat.label) {
              <article class="stat">
                <strong>{{ stat.value }}</strong>
                <span>{{ stat.label }}</span>
              </article>
            }
          </section>
        }

        @if (page().sectionTitle) {
          <section class="section-heading">
            <span class="section-index">/01</span>
            <h2>{{ page().sectionTitle }}</h2>
            <p>{{ page().sectionIntro }}</p>
          </section>
        }

        @if ((page().modules ?? []).length) {
          <section class="module-grid">
            @for (module of page().modules ?? []; track module.title) {
              <article
                class="module"
                [class.module--tall]="module.span === 'tall'"
                [class.module--wide]="module.span === 'wide'"
              >
                <div class="module-figure">
                  @switch (module.figure) {
                    @case ('editor') {
                      <div class="figure figure--editor" aria-hidden="true">
                        <span class="editor-toolbar"></span>
                        <span class="editor-word">GRID</span>
                      </div>
                    }

                    @case ('dots') {
                      <div class="figure figure--dots" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    }

                    @case ('type') {
                      <div class="figure figure--type" aria-hidden="true">
                        <span class="type-frame"></span>
                        <span class="type-mark">Aa</span>
                      </div>
                    }

                    @case ('rings') {
                      <div class="figure figure--rings" aria-hidden="true">
                        <span class="ring ring--one"></span>
                        <span class="ring ring--two"></span>
                        <span class="ring ring--three"></span>
                      </div>
                    }

                    @case ('arrows') {
                      <div class="figure figure--arrows" aria-hidden="true">
                        <span class="arrow-frame"></span>
                        <span class="arrow-mark">&lt;&gt;</span>
                      </div>
                    }

                    @case ('grid') {
                      <div class="figure figure--grid" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    }

                    @case ('bars') {
                      <div class="figure figure--bars" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    }

                    @case ('slash') {
                      <div class="figure figure--slash" aria-hidden="true">
                        <span class="slash-mark">/</span>
                        <span class="slash-rule"></span>
                      </div>
                    }
                  }
                </div>

                <div class="module-copy">
                  <h3>{{ module.title }}</h3>
                  <p>{{ module.body }}</p>

                  @if (module.link && module.linkLabel) {
                    <a class="inline-link" [routerLink]="module.link | localizeUrl">{{ module.linkLabel }}</a>
                  }
                </div>
              </article>
            }
          </section>
        }

        @if (page().matrixTitle) {
          <section class="section-heading section-heading--compact">
            <span class="section-index">/02</span>
            <h2>{{ page().matrixTitle }}</h2>
            <p>{{ page().matrixIntro }}</p>
          </section>
        }

        @if ((page().matrixItems ?? []).length) {
          <section class="matrix-grid" aria-label="Layout matrix">
            @for (item of page().matrixItems ?? []; track item.title + item.meta) {
              <article class="matrix-cell" [class.matrix-cell--accent]="item.accent">
                <strong>{{ item.title }}</strong>
                <span>{{ item.meta }}</span>
              </article>
            }
          </section>
        }

        @if (page().closingTitle) {
          <section class="closing">
            <span class="section-index">/03</span>
            <div class="closing-copy">
              <h2>{{ page().closingTitle }}</h2>
              <p>{{ page().closingText }}</p>
            </div>
            <a class="button" [routerLink]="(page().closingLink ?? '/') | localizeUrl">
              <span>{{ page().closingLinkLabel }}</span>
              <span class="button-arrow" aria-hidden="true">→</span>
            </a>
          </section>
        }

        @if (page().contact; as contact) {
          <app-contact-footer appDarkZone id="hablemos" [info]="contact" />
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    :host(.landing-page-host--home) {
      display: flex;
      flex: 1 1 auto;
      min-height: 0;
    }

    .page {
      /* Sin padding-bottom: el contact-footer es el cierre y maneja su propio espacio. */
      padding: clamp(1.5rem, 3vw, 3rem) 0 0;
    }

    .page--home {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-height: 0;
      padding: 0;
    }

    .page--software {
      padding-top: 0;
    }

    .split,
    .hero,
    .stats-grid,
    .section-heading,
    .module-grid,
    .matrix-grid,
    .closing {
      position: relative;
      z-index: 1;
    }

    .reveal {
      opacity: 0;
      transform: translateY(18px);
      animation: reveal-up 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .reveal--delayed {
      animation-delay: 120ms;
    }

    .reveal--late {
      animation-delay: 240ms;
    }

    .eyebrow,
    .section-index {
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .eyebrow,
    .section-index {
      color: var(--accent);
    }

    .arm-kicker {
      color: var(--accent);
      font-size: 1.1rem;
      font-weight: 500;
      letter-spacing: 0;
      text-transform: none;
    }

    h1,
    h2,
    h3 {
      margin: 0;
      color: var(--ink);
      font-weight: 400;
      letter-spacing: -0.07em;
      line-height: 0.92;
      text-wrap: balance;
    }

    p {
      margin: 0;
      color: var(--muted);
      font-size: 1.02rem;
      line-height: 1.65;
      text-wrap: pretty;
    }

    strong {
      color: var(--ink);
      font-weight: 600;
    }

    .hero h1 {
      margin-top: 0.9rem;
      max-width: 10ch;
      font-size: clamp(4rem, 9.5vw, 7.8rem);
    }

    .split {
      display: grid;
      flex: 1 1 auto;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 0;
      align-items: stretch;
      min-height: 0;
      transition: grid-template-columns 980ms cubic-bezier(0.2, 0.78, 0.2, 1);
      will-change: grid-template-columns;
    }

    .split--software-active {
      grid-template-columns: minmax(0, 1.14fr) minmax(0, 0.86fr);
    }

    .split--web-active {
      grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
    }

    .arm {
      position: relative;
      isolation: isolate;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 1.5rem;
      min-height: 34rem;
      padding: clamp(1.8rem, 2.4vw, 2.4rem) clamp(1.8rem, 2.4vw, 2.4rem) clamp(2.1rem, 2.8vw, 2.8rem);
      border: 1px solid var(--line-strong);
      border-radius: 1.5rem;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.3));
      color: inherit;
      overflow: hidden;
      transition: none;
    }

    /* Cards unidas (sin gap): el radio vive solo en los extremos del bloque y el borde
       entre ambas es compartido — mismo patrón que dev-types/portfolio. Lado a lado en
       desktop: izquierda redondea a la izquierda, derecha a la derecha. */
    .arm--software {
      border-radius: 1.5rem 0 0 1.5rem;
    }

    .arm--web {
      border-left: 0;
      border-radius: 0 1.5rem 1.5rem 0;
    }

    .arm::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(17, 17, 19, 0.025), transparent 55%);
      opacity: 1;
      pointer-events: none;
    }

    .arm::after {
      content: none;
    }

    .arm::before {
      z-index: 1;
    }

    .arm > .technical-grid-surface__artifact {
      opacity: 0.94;
      transform: scale(1);
      transform-origin: center center;
      transition:
        transform 980ms cubic-bezier(0.2, 0.78, 0.2, 1),
        opacity 420ms ease;
      will-change: transform;
    }

    .split--software-active .arm--software > .technical-grid-surface__artifact,
    .split--web-active .arm--web > .technical-grid-surface__artifact {
      opacity: 1;
      transform: scale(1.035);
    }

    .split--software-active .arm--web > .technical-grid-surface__artifact,
    .split--web-active .arm--software > .technical-grid-surface__artifact {
      opacity: 0.92;
      transform: scale(0.992);
    }

    .arm:hover,
    .arm--software.arm--active,
    .arm--web.arm--active {
      border-color: var(--ink);
    }

    .split--software-active .arm--software,
    .split--web-active .arm--web {
      border-color: var(--ink);
    }

    .arm-topline,
    .arm-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .arm-topline,
    .arm-body,
    .arm-footer {
      position: relative;
      z-index: 2;
    }

    .arm-body {
      display: grid;
      align-content: end;
      gap: 1rem;
    }

    .arm-body h2 {
      max-width: 10.5ch;
      font-size: var(--hero-title-size);
      font-weight: var(--hero-title-weight);
      letter-spacing: var(--hero-title-tracking);
      line-height: var(--hero-title-leading);
    }

    .arm-body p {
      max-width: 34ch;
    }

    .arm-footer {
      align-self: end;
      padding-top: 3rem;
    }

    .arm-mark {
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: clamp(1.2rem, 1.8vw, 1.5rem);
      font-weight: 400;
      letter-spacing: 0;
      line-height: 1;
    }

    .hero {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      min-height: clamp(30rem, calc(100dvh - 8.5rem), 44rem);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    .hero-title {
      grid-column: span 8;
      padding: 1.5rem 0 2rem;
    }

    .hero-copy {
      display: grid;
      align-content: end;
      gap: 1.5rem;
      grid-column: span 4;
      padding: 1.5rem 0 2rem 1.5rem;
      border-left: 1px solid var(--line);
    }

    .hero--software {
      --software-hero-top-pad: clamp(3rem, 5.5vw, 5rem);
      grid-template-columns: minmax(0, 6fr) minmax(0, 4fr);
      min-height: auto;
      align-items: start;
      border-top: 0;
      border-bottom: 0;
      overflow: hidden;
    }

    .hero--software .hero-title {
      display: flex;
      align-items: flex-start;
      grid-column: 1;
      padding: var(--software-hero-top-pad) 0 0;
    }

    .hero--software h1 {
      margin-top: 0;
      max-width: none;
      font-size: var(--hero-title-size);
      font-weight: var(--hero-title-weight);
      line-height: var(--hero-title-leading);
      letter-spacing: var(--hero-title-tracking);
      text-wrap: pretty;
    }

    .hero--software .hero-copy {
      grid-column: 2;
      align-content: start;
      align-self: start;
      justify-self: stretch;
      gap: 2rem;
      width: 100%;
      padding: var(--software-hero-top-pad) 0 0 1.2rem;
      border-left: 0;
    }

    .hero--software .hero-copy p {
      max-width: none;
      color: var(--ink);
      font-size: var(--hero-lead-size);
      font-weight: 400;
      line-height: var(--hero-lead-leading);
    }

    .hero--software .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.9rem;
    }

    .hero--software .button {
      min-width: 0;
      width: auto;
      justify-content: space-between;
    }

    .hero--software .button > span:first-child {
      padding: 0 0.86rem 0 0.98rem;
    }

    .hero-feature {
      display: block;
      position: relative;
      z-index: 1;
      width: 85vw;
      margin: clamp(2.5rem, 6vw, 5rem) auto 0;
    }

    /* Transición: la grilla técnica se desvanece hacia un sólido que cierra el hero. */
    .hero-feature::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 100vw;
      transform: translateX(-50%);
      z-index: -1;
      pointer-events: none;
      background: linear-gradient(180deg, transparent 0%, var(--surface) 50%);
    }

    /* Sólido que continúa debajo del componente para que el resto del sitio no muestre la grilla. */
    .hero-feature::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      width: 100vw;
      height: 100vh;
      transform: translateX(-50%);
      z-index: -1;
      pointer-events: none;
      background: var(--surface);
    }

    .page--software .stats-grid,
    .page--software .section-heading,
    .page--software .module-grid,
    .page--software .matrix-grid,
    .page--software .closing {
      background: var(--surface);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      margin-top: -1px;
      border-bottom: 1px solid var(--line);
    }

    .stat {
      display: grid;
      gap: 0.45rem;
      grid-column: span 4;
      padding: 1rem 1.25rem 1.2rem 0;
    }

    .stat:not(:first-child) {
      padding-left: 1.25rem;
      border-left: 1px solid var(--line);
    }

    .stat strong {
      font-size: clamp(1.4rem, 2vw, 1.8rem);
      font-weight: 500;
      letter-spacing: -0.05em;
    }

    .stat span {
      color: var(--muted);
      font-size: 0.84rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .section-heading {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1rem;
      align-items: end;
      padding: 4rem 0 1.5rem;
    }

    .section-heading--compact {
      padding-top: 4.5rem;
    }

    .section-heading .section-index,
    .closing .section-index {
      grid-column: span 2;
      align-self: start;
      padding-top: 0.35rem;
    }

    .section-heading h2,
    .closing h2 {
      grid-column: span 5;
      font-size: clamp(2rem, 4.5vw, 4rem);
      line-height: 0.98;
    }

    .section-heading p {
      grid-column: span 5;
      max-width: 44ch;
    }

    .module-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1rem;
    }

    .module {
      display: grid;
      grid-column: span 4;
      grid-template-rows: minmax(12rem, 15rem) auto;
      min-height: 27rem;
      border: 1px solid var(--line);
      border-radius: 2rem;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.46);
    }

    .module--wide {
      grid-column: span 8;
      grid-template-columns: minmax(220px, 0.9fr) minmax(0, 1.1fr);
      grid-template-rows: none;
      min-height: 22rem;
    }

    .module--tall {
      min-height: 34rem;
    }

    .module-figure {
      display: grid;
      place-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--line);
    }

    .module--wide .module-figure {
      border-right: 1px solid var(--line);
      border-bottom: 0;
    }

    .module-copy {
      display: grid;
      align-content: start;
      gap: 1rem;
      padding: 1.45rem;
    }

    .module-copy h3 {
      font-size: clamp(1.5rem, 2.4vw, 2.25rem);
      line-height: 1.02;
    }

    .inline-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--ink);
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 0.2em;
      transition: color 180ms ease;
    }

    .inline-link:hover {
      color: var(--accent);
    }

    .figure {
      position: relative;
      width: min(100%, 18rem);
      height: min(100%, 11rem);
    }

    .figure--editor {
      display: grid;
      align-content: center;
      gap: 0.5rem;
    }

    .editor-toolbar {
      width: 6rem;
      height: 1.25rem;
      border: 1px solid rgba(17, 17, 19, 0.2);
      border-radius: 0.35rem;
      background:
        linear-gradient(90deg, rgba(17, 17, 19, 0.24) 0 1rem, transparent 1rem 100%),
        linear-gradient(90deg, transparent 0 1.55rem, rgba(17, 17, 19, 0.24) 1.55rem 2.05rem, transparent 2.05rem 100%),
        linear-gradient(90deg, transparent 0 2.55rem, rgba(17, 17, 19, 0.24) 2.55rem 3.05rem, transparent 3.05rem 100%);
    }

    .editor-word {
      font-size: clamp(2.75rem, 5vw, 4.6rem);
      letter-spacing: -0.08em;
      line-height: 0.9;
    }

    .figure--dots {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      place-items: center;
      width: 7.5rem;
      height: 7.5rem;
    }

    .figure--dots span {
      width: 1.1rem;
      height: 1.1rem;
      border-radius: 999px;
      background: var(--ink);
    }

    .figure--dots span:nth-child(2),
    .figure--dots span:nth-child(4),
    .figure--dots span:nth-child(6) {
      background: var(--accent);
    }

    .figure--type {
      display: grid;
      place-items: center;
    }

    .type-frame {
      position: absolute;
      inset: 20% 12%;
      border: 1px solid rgba(61, 81, 255, 0.24);
    }

    .type-mark {
      position: relative;
      z-index: 1;
      font-size: clamp(4rem, 7vw, 6rem);
      letter-spacing: -0.08em;
      line-height: 0.9;
    }

    .figure--rings {
      width: 12rem;
      height: 9rem;
    }

    .ring {
      position: absolute;
      width: 4.7rem;
      height: 4.7rem;
      border: 6px solid var(--ink);
      border-radius: 999px;
    }

    .ring--one {
      left: 0.8rem;
      bottom: 0.8rem;
    }

    .ring--two {
      left: 3.25rem;
      bottom: 2rem;
      border-color: var(--accent);
    }

    .ring--three {
      left: 5.4rem;
      bottom: 0.8rem;
      border-color: var(--accent);
    }

    .figure--arrows {
      display: grid;
      place-items: center;
    }

    .arrow-frame {
      position: absolute;
      width: 7rem;
      height: 7rem;
      border: 6px solid var(--ink);
    }

    .arrow-mark {
      position: relative;
      z-index: 1;
      color: var(--accent);
      font-size: 3.5rem;
      letter-spacing: -0.14em;
      line-height: 1;
    }

    .figure--grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.55rem;
      width: 10rem;
      height: 10rem;
    }

    .figure--grid span {
      border: 1px solid var(--line);
      background: rgba(17, 17, 19, 0.03);
    }

    .figure--grid span:nth-child(2),
    .figure--grid span:nth-child(4),
    .figure--grid span:nth-child(8) {
      background: rgba(61, 81, 255, 0.12);
      border-color: rgba(61, 81, 255, 0.24);
    }

    .figure--bars {
      display: grid;
      align-items: end;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.8rem;
      width: 10rem;
      height: 9rem;
    }

    .figure--bars span {
      border-radius: 999px 999px 0 0;
      background: var(--ink);
    }

    .figure--bars span:nth-child(1) {
      height: 48%;
    }

    .figure--bars span:nth-child(2) {
      height: 78%;
      background: var(--accent);
    }

    .figure--bars span:nth-child(3) {
      height: 62%;
    }

    .figure--bars span:nth-child(4) {
      height: 100%;
      background: var(--accent);
    }

    .figure--slash {
      display: grid;
      place-items: center;
    }

    .slash-mark {
      position: absolute;
      font-size: clamp(5rem, 10vw, 8rem);
      line-height: 1;
      left: 1rem;
      top: -0.2rem;
    }

    .slash-rule {
      position: absolute;
      right: 1rem;
      bottom: 1.9rem;
      width: 55%;
      height: 2px;
      background: var(--accent);
    }

    .matrix-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 0.85rem;
    }

    .matrix-cell {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: 12rem;
      grid-column: span 3;
      padding: 1.2rem;
      border: 1px solid var(--line);
      background: rgba(17, 17, 19, 0.03);
    }

    .matrix-cell strong {
      font-size: clamp(1.45rem, 3vw, 2.65rem);
      font-weight: 500;
      letter-spacing: -0.06em;
      line-height: 0.96;
      text-transform: uppercase;
    }

    .matrix-cell span {
      margin-top: 0.4rem;
      color: var(--muted);
      font-size: 0.76rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .matrix-cell--accent strong,
    .matrix-cell--accent span {
      color: var(--accent);
    }

    .closing {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1rem;
      align-items: start;
      margin-top: 4.5rem;
      padding-top: 1.4rem;
      border-top: 1px solid var(--line);
    }

    .closing-copy {
      display: grid;
      gap: 1rem;
      grid-column: span 7;
    }

    .closing .button {
      justify-self: end;
      align-self: center;
      grid-column: 10 / span 3;
      width: 100%;
    }

    @keyframes reveal-up {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 1080px) {
      .page--home {
        min-height: auto;
      }

      .hero {
        grid-template-columns: 1fr;
      }

      .hero-title,
      .hero-copy,
      .section-heading h2,
      .section-heading p,
      .closing-copy,
      .closing .button {
        grid-column: span 12;
      }

      .hero--software .hero-copy {
        width: 100%;
        padding: 1.8rem 0 2rem;
        border-top: 0;
      }

      .hero-copy {
        padding: 1.25rem 0 2rem;
        border-left: 0;
        border-top: 1px solid var(--line);
      }

      .split,
      .split--software-active,
      .split--web-active {
        grid-template-columns: 1fr;
      }

      /* Apiladas: el bloque redondea arriba (primera) y abajo (última); borde compartido horizontal. */
      .arm--software {
        border-radius: 1.5rem 1.5rem 0 0;
      }

      .arm--web {
        border-top: 0;
        border-left: 1px solid var(--line-strong);
        border-radius: 0 0 1.5rem 1.5rem;
      }

      .section-heading .section-index,
      .closing .section-index {
        grid-column: span 12;
        padding-top: 0;
      }

      .module,
      .module--wide,
      .matrix-cell {
        grid-column: span 6;
      }

      .closing .button {
        justify-self: start;
        width: auto;
      }

      .split {
        min-height: auto;
      }
    }

    @media (max-width: 760px) {
      .split,
      .stats-grid,
      .section-heading,
      .module-grid,
      .matrix-grid,
      .closing {
        grid-template-columns: 1fr;
      }

      .arm,
      .module,
      .module--wide,
      .matrix-cell {
        min-height: auto;
      }

      .stat,
      .section-heading .section-index,
      .section-heading h2,
      .section-heading p,
      .closing .section-index,
      .closing-copy,
      .closing .button {
        grid-column: auto;
      }

      .stats-grid {
        margin-top: 0;
      }

      .stat {
        padding: 1rem 0;
      }

      .stat:not(:first-child) {
        padding-left: 0;
        border-left: 0;
        border-top: 1px solid var(--line);
      }

      .section-heading {
        padding-top: 3rem;
      }

      .module--wide {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(12rem, 15rem) auto;
      }

      .hero--software {
        grid-template-columns: 1fr;
        min-height: auto;
      }

      .hero--software .hero-title {
        display: block;
        grid-column: auto;
        padding-top: 0.6rem;
        padding-bottom: 1rem;
        text-align: center;
      }

      .hero--software .hero-copy {
        grid-column: auto;
        gap: 1.25rem;
        padding-top: 1.25rem;
        text-align: center;
        justify-items: center;
      }

      /* Botones uno al lado del otro: no envuelven, cada uno toma la mitad del ancho. */
      .hero--software .actions {
        display: flex;
        justify-content: center;
        flex-wrap: nowrap;
        gap: 0.6rem;
      }

      .hero--software .button {
        flex: 1 1 0;
        width: auto;
        min-width: 0;
      }

      /* Botón en una línea: nowrap + tipografía/padding algo menores. */
      .hero--software .button > span:first-child {
        padding: 0 0.5rem;
        font-size: 0.82rem;
        white-space: nowrap;
      }

      .hero-feature {
        width: 95vw;
        margin-inline: calc((100% - 95vw) / 2);
      }

      .module--wide .module-figure {
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .matrix-cell {
        min-height: 9rem;
      }

      .closing {
        margin-top: 3rem;
      }

      .closing .button {
        width: 100%;
        min-width: 0;
      }
    }
  `
})
export class LandingPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(LanguageService);
  private readonly ads = inject(AdsService);
  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data
  });

  protected readonly activeArm = signal<'software' | 'web' | null>(null);
  // La data de la ruta es bilingüe ({ es, en }); resolvemos según el idioma activo, así el
  // contenido cambia sin recargar al alternar el toggle.
  protected readonly page = computed(
    () => (this.routeData() as { es: LandingData; en: LandingData })[this.i18n.lang()]
  );

  // El hero (carrusel de /web) muestra los primeros 10 del portafolio, automáticamente: usa el video
  // web grande (/media/hero/<slug>.mp4) si la fila tiene video, o el poster como imagen (ej. Asembis).
  protected readonly heroSlides = computed<HeroSlide[]>(() => {
    const rows = this.page().portfolio?.rows ?? [];
    return rows.slice(0, 10).map((row) => {
      const slug = (row.videoSrc || row.poster).split('/').pop()!.replace(/\.\w+$/, '');
      return { src: row.videoSrc ? `/media/hero/${slug}.mp4` : '', poster: row.poster };
    });
  });

  protected isHrefLink(link?: string): boolean {
    return !!link && /^(#|mailto:|https?:)/.test(link);
  }

  // Externo (http/https, p.ej. el calendario) → abre en pestaña nueva; un ancla (#hablemos) no.
  protected isExternalLink(link?: string): boolean {
    return !!link && /^https?:/.test(link);
  }

  // Dispara la conversión "agendar reunión" cuando un CTA del hero apunta al calendario (cal.com).
  protected onCtaClick(link?: string): void {
    if (link && link.includes('cal.com')) {
      this.ads.scheduleMeeting();
    }
  }

  protected setActiveArm(arm: 'software' | 'web' | null): void {
    this.activeArm.set(arm);
  }
}
