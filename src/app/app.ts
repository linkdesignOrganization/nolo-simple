import { DOCUMENT, Location } from '@angular/common';
import { Component, HostListener, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { LucideArrowLeft, LucideHeadset } from '@lucide/angular';
import { filter, map, startWith } from 'rxjs';

import { TechnicalGridSurfaceComponent } from './components/technical-grid-surface.component';
import { LanguageService } from './services/language.service';
import { AdsService } from './services/ads.service';
import { SeoService } from './services/seo.service';
import { seoForUrl } from './services/seo-content';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TechnicalGridSurfaceComponent, LucideHeadset, LucideArrowLeft],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly i18n = inject(LanguageService);
  private readonly ads = inject(AdsService);
  private readonly seo = inject(SeoService);
  private readonly doc = inject(DOCUMENT);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  // Idioma global (ES/EN). El toggle del nav lo alterna; todo el sitio reacciona sin recargar.
  protected readonly lang = this.i18n.lang;
  protected readonly t = computed(() => TOPBAR_TEXT[this.lang()]);

  // Prefija /en a enlaces internos cuando el idioma es inglés (para no salir del árbol EN).
  protected readonly localizeUrl = (path: string): string => this.i18n.link(path);

  // Path sin query/fragment y SIN el prefijo /en, para que las flags traten /en/x igual que /x
  // (mismo shell: grilla, header back-only, nav) en ambos idiomas.
  private readonly pathNoLang = computed(() => {
    const p = (this.currentUrl().split('#')[0].split('?')[0] || '/').replace(/^\/en(?=\/|$)/, '');
    return p === '' ? '/' : p;
  });
  protected readonly isHome = computed(() => this.pathNoLang() === '/');
  // /software es la landing; /software/<slug> es el detalle (terminal, header back-only).
  protected readonly isSoftware = computed(() => this.pathNoLang() === '/software');
  protected readonly isSystemDetail = computed(() => /^\/software\/[^/]+$/.test(this.pathNoLang()));
  protected readonly isContact = computed(() => this.pathNoLang().startsWith('/contacto'));
  protected readonly isPrivacy = computed(() => this.pathNoLang().startsWith('/politicas-de-privacidad'));
  protected readonly isNotFound = computed(() => this.pathNoLang().startsWith('/404'));
  // /industrias es el índice (header normal, sin links de nav); /industrias/<slug> es el detalle
  // (terminal, back-only). Ambos muestran la grilla del shell en su hero.
  protected readonly isIndustries = computed(() => this.pathNoLang() === '/industrias');
  protected readonly isIndustryDetail = computed(() => /^\/industrias\/[^/]+$/.test(this.pathNoLang()));

  // Rutas "terminales" cuyo topbar se reduce a una sola flecha de volver
  // (contacto, privacidad y el detalle de un sistema).
  protected readonly backOnly = computed(
    () => this.isContact() || this.isPrivacy() || this.isSystemDetail() || this.isIndustryDetail()
  );

  // Opciones del nav por landing: cada una apunta a una sección real de esa página.
  // /software → Sistemas, Proceso, Casos · /web → Capacidades, Servicios, Portfolio.
  // El href lleva la ruta completa porque con <base href="/"> un "#frag" suelto resolvería
  // contra la raíz (/#frag = home), no contra la página actual. El label se resuelve por idioma.
  protected readonly navLinks = computed<NavLink[]>(() =>
    this.isIndustries() ? [] : this.isSoftware() ? SOFTWARE_NAV : WEB_NAV
  );

  // Conversión de scroll (acción "Scroll" de Ads): una sola vez por página, se rearma al navegar.
  private scrollConversionSent = false;

  constructor() {
    // SEO por ruta + idioma: title, meta, OG, canonical y JSON-LD reaccionan al navegar y al toggle ES/EN.
    effect(() => {
      this.seo.apply(seoForUrl(this.currentUrl(), this.i18n.lang()));
    });

    // <html lang> sigue el idioma activo (a11y + señal de idioma correcta al togglear ES/EN).
    effect(() => {
      this.doc.documentElement.lang = this.i18n.lang() === 'en' ? 'en' : 'es';
    });

    // Rearma la conversión de scroll en cada navegación → una conversión por página (igual que el legacy).
    effect(() => {
      this.currentUrl();
      this.scrollConversionSent = false;
    });
  }

  protected toggleLang(): void {
    // Navega a la URL equivalente en el otro idioma (preservando el #fragment); el langGuard fija
    // el idioma al llegar. ES→EN antepone /en; EN→ES lo quita.
    const url = this.currentUrl();
    const hashIdx = url.indexOf('#');
    const fragment = hashIdx >= 0 ? url.slice(hashIdx + 1) : null;
    const path = (hashIdx >= 0 ? url.slice(0, hashIdx) : url).split('?')[0] || '/';
    const inEn = /^\/en(?=\/|$)/.test(path);
    const base = inEn ? path.replace(/^\/en(?=\/|$)/, '') || '/' : path;
    const target = inEn ? base : base === '/' ? '/en' : '/en' + base;
    this.router.navigateByUrl(fragment ? `${target}#${fragment}` : target);
  }

  // Click en el botón de WhatsApp del topbar → conversión de Google Ads.
  protected onWhatsapp(): void {
    this.ads.whatsapp();
  }

  // Scroll al 50% de la página → conversión "Scroll" de Ads, una sola vez por página.
  // Excluye privacidad y 404 (igual que el sitio legacy); se desactiva con el flag hasta navegar.
  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (this.scrollConversionSent) return;
    if (this.isPrivacy() || this.isNotFound()) return;
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    const reached = (scrolled + window.innerHeight) / document.documentElement.scrollHeight;
    if (reached >= 0.5) {
      this.ads.scroll();
      this.scrollConversionSent = true;
    }
  }

  // Flecha de "volver" del topbar en rutas terminales: vuelve a la página anterior, o al inicio si se
  // entró directo por URL (sin historial), para no salir del sitio.
  protected goBack(): void {
    if (typeof history !== 'undefined' && history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }
}

type NavLabel = { es: string; en: string };
type NavLink = { label: NavLabel; href: string };

const SOFTWARE_NAV: NavLink[] = [
  { label: { es: 'Sistemas', en: 'Systems' }, href: '/software#sistemas' },
  { label: { es: 'Proceso', en: 'Process' }, href: '/software#proceso' },
  { label: { es: 'Casos', en: 'Work' }, href: '/software#casos' }
];

const WEB_NAV: NavLink[] = [
  { label: { es: 'Capacidades', en: 'Capabilities' }, href: '/web#capacidades' },
  { label: { es: 'Servicios', en: 'Services' }, href: '/web#servicios' },
  { label: { es: 'Portafolio', en: 'Portfolio' }, href: '/web#portfolio' }
];

const TOPBAR_TEXT = {
  es: {
    talk: 'Hablemos',
    back: 'Volver',
    switchLang: 'Cambiar idioma',
    whatsapp: 'Escribinos por WhatsApp'
  },
  en: {
    talk: "Let's talk",
    back: 'Back',
    switchLang: 'Switch language',
    whatsapp: 'Message us on WhatsApp'
  }
} as const;
