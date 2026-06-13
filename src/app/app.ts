import { Location } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { LucideArrowLeft, LucideHeadset } from '@lucide/angular';
import { filter, map, startWith } from 'rxjs';

import { TechnicalGridSurfaceComponent } from './components/technical-grid-surface.component';
import { LanguageService } from './services/language.service';
import { AdsService } from './services/ads.service';

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

  protected readonly isHome = computed(() => this.currentUrl() === '/');
  protected readonly isSoftware = computed(() => this.currentUrl().startsWith('/software'));
  protected readonly isContact = computed(() => this.currentUrl().startsWith('/contacto'));
  protected readonly isPrivacy = computed(() => this.currentUrl().startsWith('/politicas-de-privacidad'));

  // Rutas "terminales" cuyo topbar se reduce a una sola flecha de volver (contacto + privacidad).
  protected readonly backOnly = computed(() => this.isContact() || this.isPrivacy());

  // Opciones del nav por landing: cada una apunta a una sección real de esa página.
  // /software → Sistemas, Proceso, Casos · /web → Capacidades, Servicios, Portfolio.
  // El href lleva la ruta completa porque con <base href="/"> un "#frag" suelto resolvería
  // contra la raíz (/#frag = home), no contra la página actual. El label se resuelve por idioma.
  protected readonly navLinks = computed<NavLink[]>(() =>
    this.isSoftware() ? SOFTWARE_NAV : WEB_NAV
  );

  protected toggleLang(): void {
    this.i18n.toggle();
  }

  // Click en el botón de WhatsApp del topbar → conversión de Google Ads.
  protected onWhatsapp(): void {
    this.ads.whatsapp();
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
