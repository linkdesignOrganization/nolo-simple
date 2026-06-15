import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  effect,
  inject,
  input
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideArrowUpRight } from '@lucide/angular';

import { environment } from '../../environments/environment';
import { LanguageService } from '../services/language.service';
import { LocalizeUrlPipe } from '../services/localize-url.pipe';

export type ServiceItem = {
  body: string;
  chips: string[];
  title: string;
  /** Si está, el título enlaza a /software/<slug> (página de detalle del sistema). */
  slug?: string;
};

@Component({
  selector: 'app-services-stack',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideArrowUpRight, LocalizeUrlPipe],
  host: {
    'class': 'services-stack'
  },
  template: `
    <div class="services-stack__intro">
      <h2>{{ heading() }}</h2>
      <p>{{ intro() }}</p>
    </div>

    <div class="services-stack__list">
      @for (item of items(); track item.title; let i = $index) {
        <header class="ss-item__head" [style.--i]="i">
          <span class="ss-item__num">{{ pad(i) }}</span>
          @if (item.slug) {
            <h3 class="ss-item__title">
              <a class="ss-item__link" [routerLink]="('/software/' + item.slug) | localizeUrl">
                <span class="ss-item__title-text">{{ item.title }}</span>
                <span class="ss-item__arrow" aria-hidden="true">
                  <svg lucideArrowUpRight [size]="26" [strokeWidth]="1"></svg>
                </span>
              </a>
            </h3>
          } @else {
            <h3 class="ss-item__title">{{ item.title }}</h3>
          }
        </header>
        <div class="ss-item__body">
          <p class="ss-item__txt">{{ item.body }}</p>
          @if (item.chips.length) {
            <ul class="ss-item__chips">
              @for (chip of item.chips; track chip) {
                <li>{{ chip }}</li>
              }
            </ul>
          }
        </div>
      }
      <div class="ss-spacer" aria-hidden="true"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
      padding: var(--section-py) 0;
    }

    /* Fondo sólido full-bleed: tapa la grilla técnica también en los márgenes. */
    :host::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: var(--surface);
    }

    .services-stack__intro {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1.5rem;
      align-items: start;
      margin-bottom: clamp(2.5rem, 6vw, 5rem);
    }

    .services-stack__intro h2 {
      grid-column: span 7;
      margin: 0;
      color: var(--ink);
      font-size: clamp(2.1rem, 5vw, 4rem);
      font-weight: 400;
      letter-spacing: -0.055em;
      line-height: 1;
      text-wrap: balance;
    }

    .services-stack__intro p {
      grid-column: 9 / span 4;
      margin: 0;
      color: var(--ink);
      font-size: 1.02rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* El header es sticky y se apila; el body scrollea por detrás (z menor)
       y desaparece bajo las franjas ya apiladas. */
    .ss-item__head {
      position: sticky;
      top: 0;
      z-index: 2;
      display: grid;
      grid-template-columns: 2.4rem minmax(0, 1fr);
      align-items: baseline;
      gap: 1rem;
      padding: 1.15rem 0;
    }

    .ss-item__head::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: hsl(0 0% calc(97% - var(--i, 0) * 2.6%));
    }

    .ss-item__num {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.02em;
      line-height: 1;
    }

    .ss-item__title {
      margin: 0;
      color: var(--ink);
      font-size: clamp(1.5rem, 3.2vw, 2.2rem);
      font-weight: 400;
      letter-spacing: -0.04em;
      line-height: 1.04;
      text-wrap: balance;
    }

    /* Título como enlace al detalle del sistema: flecha pegada al texto + underline que
       entra de izquierda a derecha, y el ícono cambia de color en hover. */
    .ss-item__link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      width: fit-content;
      color: inherit;
      text-decoration: none;
    }

    .ss-item__title-text {
      position: relative;
    }

    .ss-item__title-text::after {
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

    .ss-item__arrow {
      display: inline-flex;
      flex-shrink: 0;
      color: var(--muted);
      transition: color 200ms ease, transform 200ms ease;
    }

    .ss-item__link:hover .ss-item__title-text::after,
    .ss-item__link:focus-visible .ss-item__title-text::after {
      transform: scaleX(1);
    }

    .ss-item__link:hover .ss-item__arrow,
    .ss-item__link:focus-visible .ss-item__arrow {
      color: var(--accent);
      transform: translate(2px, -2px);
    }

    .ss-item__link:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
      border-radius: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .ss-item__title-text::after,
      .ss-item__arrow {
        transition: none;
      }
    }

    .ss-item__body {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 2.4rem minmax(0, 1fr);
      gap: 1rem;
      padding: 1.6rem 0 3.2rem;
    }

    .ss-item__txt {
      grid-column: 2;
      max-width: 64ch;
      margin: 0;
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    .ss-item__chips {
      grid-column: 2;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.4rem 0 0;
      padding: 0;
      list-style: none;
    }

    .ss-item__chips li {
      padding: 0.42rem 0.6rem;
      border-radius: 0.4rem;
      background: rgba(61, 81, 255, 0.1);
      color: var(--accent);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      line-height: 1;
      text-transform: uppercase;
    }

    @media (max-width: 760px) {
      .services-stack__intro {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .services-stack__intro h2,
      .services-stack__intro p {
        grid-column: auto;
      }

      .ss-item__head {
        grid-template-columns: 2rem minmax(0, 1fr);
        gap: 0.75rem;
        padding: 0.9rem 0;
      }

      .ss-item__body {
        grid-template-columns: 1fr;
        gap: 0;
        padding: 1.2rem 0 2.4rem;
      }

      .ss-item__txt,
      .ss-item__chips {
        grid-column: auto;
      }
    }
  `
})
export class ServicesStackComponent implements AfterViewInit, OnDestroy {
  readonly heading = input.required<string>();
  readonly intro = input.required<string>();
  readonly items = input.required<ServiceItem[]>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private readonly i18n = inject(LanguageService);

  private resizeObserver: ResizeObserver | null = null;
  private lastWidth = 0;
  private itemListScript: HTMLScriptElement | null = null;

  constructor() {
    // ItemList JSON-LD: marca los sistemas (items con slug → páginas de detalle) como una lista de
    // servicios para Google. Se inyecta al <head> en el prerender (SSG). Solo emite donde hay items
    // con slug (la sección de sistemas en /software).
    effect(() => {
      const systems = this.items().filter((it) => !!it.slug);
      if (!systems.length) return;
      const origin = (environment.siteUrl || '').replace(/\/+$/, '');
      const data = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: systems.map((it, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: it.title,
          url: origin + this.i18n.link('/software/' + it.slug)
        }))
      };
      if (!this.itemListScript) {
        this.itemListScript = this.doc.createElement('script');
        this.itemListScript.setAttribute('type', 'application/ld+json');
        this.itemListScript.setAttribute('data-seo', 'itemlist');
        this.doc.head.appendChild(this.itemListScript);
      }
      this.itemListScript.textContent = JSON.stringify(data);
    });
  }

  // Índice con cero a la izquierda (01, 02, …), mismo formato que el FAQ.
  pad(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.lastWidth = this.hostRef.nativeElement.getBoundingClientRect().width;
      this.layoutStack();

      if (typeof ResizeObserver !== 'undefined') {
        // Recalcular solo cuando cambia el ancho. layoutStack ajusta la altura
        // del spacer, y reaccionar a ese cambio dispararía un loop de
        // ResizeObserver (con su warning en consola).
        this.resizeObserver = new ResizeObserver((entries) => {
          const width = entries[0]?.contentRect.width ?? this.lastWidth;
          if (Math.abs(width - this.lastWidth) < 1) {
            return;
          }
          this.lastWidth = width;
          requestAnimationFrame(() => this.layoutStack());
        });
        this.resizeObserver.observe(this.hostRef.nativeElement);
      }
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.itemListScript?.remove();
    this.itemListScript = null;
  }

  // Cada header se pega justo debajo de los anteriores: su top sticky es la
  // suma de las alturas de los headers previos.
  private layoutStack(): void {
    const host = this.hostRef.nativeElement as HTMLElement;
    const heads = host.querySelectorAll<HTMLElement>('.ss-item__head');
    let offset = 0;
    let lastHeadHeight = 0;

    heads.forEach((head: HTMLElement) => {
      head.style.top = `${offset}px`;
      offset += head.offsetHeight;
      lastHeadHeight = head.offsetHeight;
    });

    // El spacer solo necesita una cola corta: una vez apilado el último header y
    // oculto su texto detrás del stack, la sección suelta enseguida. Antes usaba
    // `offset` (la suma de TODOS los headers) y eso dejaba ~1 stack de altura de
    // scroll vacío al final (el "espacio muerto").
    const spacer = host.querySelector<HTMLElement>('.ss-spacer');
    if (spacer) {
      spacer.style.height = `${lastHeadHeight}px`;
    }
  }
}
