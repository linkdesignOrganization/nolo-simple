import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LanguageService } from '../services/language.service';
import { LocalizeUrlPipe } from '../services/localize-url.pipe';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LocalizeUrlPipe],
  template: `
    <section class="nf">
      <span class="nf-code">404</span>
      <h1 class="nf-title">{{ t().title }}</h1>
      <p class="nf-text">{{ t().text }}</p>
      <a class="button" [routerLink]="'/' | localizeUrl">
        <span>{{ t().cta }}</span>
        <span class="button-arrow" aria-hidden="true">→</span>
      </a>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    /* Contenido centrado vertical en el espacio bajo el topbar; alineado a la izquierda con el resto. */
    .nf {
      min-height: calc(100dvh - 9rem);
      max-width: 52ch;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      padding: clamp(2.5rem, 6vw, 4rem) 0;
    }

    /* Código de error como metadato en mono (mismo registro que los números de sección del sitio). */
    .nf-code {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.95rem;
      letter-spacing: 0.02em;
    }

    .nf-title {
      margin: 1rem 0 0;
      color: var(--ink);
      font-size: clamp(2.6rem, 6vw, 5rem);
      font-weight: 600;
      letter-spacing: -0.045em;
      line-height: 1;
      text-wrap: balance;
    }

    .nf-text {
      margin: 1.2rem 0 2rem;
      max-width: 44ch;
      color: var(--muted);
      font-size: 1.1rem;
      line-height: 1.65;
      text-wrap: pretty;
    }
  `
})
export class NotFoundPageComponent {
  private readonly i18n = inject(LanguageService);
  protected readonly lang = this.i18n.lang;
  protected readonly t = computed(() => NOT_FOUND_TEXT[this.lang()]);
}

type NotFoundText = { title: string; text: string; cta: string };

const NOT_FOUND_TEXT: Record<'es' | 'en', NotFoundText> = {
  es: {
    title: 'Esta página no existe.',
    text:
      'El enlace que seguiste no lleva a ninguna parte, o la página se movió. Volvé al inicio y seguí desde ahí.',
    cta: 'Ir al inicio'
  },
  en: {
    title: "This page doesn't exist.",
    text:
      'The link you followed leads nowhere, or the page moved. Head back home and pick up from there.',
    cta: 'Back to home'
  }
};
