import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ContactFooterComponent, ContactInfo } from '../components/contact-footer.component';
import { IndustriesSectionComponent } from '../components/industries-section.component';
import { DarkZoneDirective } from '../directives/dark-zone.directive';
import { LanguageService } from '../services/language.service';
import { INDUSTRY_CARDS } from './industries-content';

// Índice /industrias: hero sobre la grilla del shell + la sección con las 7 industrias + footer.
// NO es página terminal (header normal del shell). NO va en el nav del topbar (decisión del usuario);
// se llega desde las secciones de /software y /web y desde los detalles.
@Component({
  selector: 'app-industries-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IndustriesSectionComponent, ContactFooterComponent, DarkZoneDirective],
  template: `
    <header class="ip-hero">
      <p class="ip-hero__eyebrow">{{ t().eyebrow }}</p>
      <h1 class="ip-hero__title">{{ t().title }}</h1>
      <p class="ip-hero__lead">{{ t().lead }}</p>
    </header>

    <app-industries
      id="industrias"
      [heading]="t().sectionHeading"
      [intro]="t().sectionIntro"
      [items]="cards()"
    />

    <app-contact-footer appDarkZone id="hablemos" [info]="info" />
  `,
  styles: `
    :host {
      display: block;
    }

    /* Hero sobre el artefacto de grilla del shell (transparente; la sección de abajo lo tapa). */
    .ip-hero {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: clamp(18rem, 40vh, 26rem);
      padding-block: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 3.5vw, 3rem);
    }

    .ip-hero::after {
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

    .ip-hero__eyebrow {
      margin: 0 0 1rem;
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .ip-hero__title {
      margin: 0;
      max-width: 16ch;
      color: var(--ink);
      font-size: var(--hero-title-size);
      font-weight: var(--hero-title-weight);
      letter-spacing: var(--hero-title-tracking);
      line-height: var(--hero-title-leading);
      text-wrap: balance;
    }

    .ip-hero__lead {
      margin: 1.4rem 0 0;
      max-width: 52ch;
      color: var(--ink);
      font-size: var(--hero-lead-size);
      font-weight: 400;
      line-height: var(--hero-lead-leading);
      text-wrap: pretty;
    }
  `
})
export class IndustriesPageComponent {
  private readonly i18n = inject(LanguageService);
  protected readonly t = computed(() => INDEX_TEXT[this.i18n.lang()]);
  protected readonly cards = computed(() => INDUSTRY_CARDS(this.i18n.lang()));

  protected readonly info: ContactInfo = {
    email: 'hola@nolo.ar',
    whatsappLink: 'https://wa.me/5491133337180',
    calendarLink: 'https://cal.com/nolo.ar/reunion-con-equipo-nolo',
    calendarLinkEn: 'https://cal.com/nolo.ar/meeting-with-nolo-team',
    location: 'Buenos Aires, Argentina'
  };
}

// Copy "de conexión" del índice (no es contenido por-industria; ese es verbatim en industries-content.ts).
const INDEX_TEXT = {
  es: {
    eyebrow: 'Industrias',
    title: 'Soluciones a medida, por industria',
    lead: 'No construimos lo mismo para todos. Mirá cómo ordenamos la operación en tu sector, con software y sitios web hechos a tu medida.',
    sectionHeading: 'Elegí tu sector',
    sectionIntro:
      'Cada operación es distinta. Estas son las industrias en las que más trabajamos; entrá a la tuya para ver qué podríamos construir.'
  },
  en: {
    eyebrow: 'Industries',
    title: 'Custom solutions, by industry',
    lead: 'We don’t build the same thing for everyone. See how we bring order to your sector, with software and websites built to fit your operation.',
    sectionHeading: 'Choose your sector',
    sectionIntro:
      'Every operation is different. These are the industries we work with most; open yours to see what we could build.'
  }
} as const;
