import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

import { environment } from '../../environments/environment';
import { COMPANY_LEGAL } from '../company-info';

export interface SeoData {
  title: string;
  description: string;
  keywords: string;
  /** Path canónico (ej. '/software'); se resuelve contra siteUrl. */
  canonicalPath?: string;
  /** Imagen OG/Twitter (URL absoluta); sin ella va la genérica del sitio, de 1200×630. */
  image?: string;
  /** Dimensiones de `image`; si no vienen se asumen las de la genérica (1200×630). */
  imageWidth?: number;
  imageHeight?: number;
  /** Texto alternativo de `image` (og:image:alt y twitter:image:alt); sin él va el del sitio por idioma. */
  imageAlt?: string;
  locale?: string;
  robots?: string;
  /** Última actualización del contenido (YYYY-MM-DD); va al `dateModified` del WebPage. */
  dateModified?: string;
  /**
   * Ruta fuera de los árboles de idioma: una sola URL sirve ES+EN (no existe la variante
   * `/en/...`). Mantiene el canonical sin prefijo y apunta los tres hreflang a esa misma URL,
   * en vez de declarar un `/en/...` que daría 404.
   */
  singleUrl?: boolean;
}

const SOFTWARE_AR_HUB = '/desarrollo-de-software-argentina';

// Nombres cortos de los niveles intermedios del breadcrumb, por idioma. SEO_CONTENT no tiene
// nombre corto (su title es largo para una miga) y este servicio no importa seo-content (sería un
// ciclo). `parent` declara un ancestro que la URL no revela: al hub de software AR solo se llega
// desde /software (la intro de los demos y la tabla de precios), así que su miga cuelga de ahí
// aunque su ruta sea de primer nivel. Sin `parent`, el ancestro es el primer segmento de la ruta.
const BREADCRUMB_NODES: Record<string, { es: string; en: string; parent?: string }> = {
  '/software': { es: 'Software', en: 'Software' },
  '/industrias': { es: 'Industrias', en: 'Industries' },
  [SOFTWARE_AR_HUB]: {
    es: 'Desarrollo de software Argentina',
    en: 'Software development Argentina',
    parent: '/software'
  }
};

// Ficha de la marca (Organization + WebSite) por idioma. Vivía estática en `src/index.html`, en
// español, y por eso salía igual en las páginas EN. Solo cambian los campos redactados; nombre,
// URL, logo, contacto, dirección y los @id son los mismos en los dos idiomas (es la misma entidad,
// referenciada por `Service.provider` y `WebPage.isPartOf`). `contactType` es un valor de la
// enumeración de schema.org: va en inglés siempre. El nombre va «Nolo» sin virgulilla: es lo que
// la gente escribe al buscar y lo que lee Google (la «Nolõ» del copy es solo para los textos
// visibles del sitio).
const BRAND: Record<'es' | 'en', { description: string; slogan: string; knowsAbout: string[] }> = {
  es: {
    description:
      'Estudio de desarrollo de software y sitios web a medida en Buenos Aires, Argentina. Software empresarial, aplicaciones internas, e-commerce y sitios corporativos construidos desde código.',
    slogan: 'Software y sitios web a medida, construidos desde código.',
    knowsAbout: [
      'Desarrollo de software a medida',
      'Desarrollo web',
      'E-commerce',
      'Aplicaciones empresariales internas',
      'Automatización con IA',
      'CRM',
      'ERP',
      'Angular',
      'Node.js'
    ]
  },
  en: {
    description:
      'Custom software and website development studio in Buenos Aires, Argentina. Business software, internal apps, e-commerce and corporate websites built from code.',
    slogan: 'Custom software and websites, built from code.',
    knowsAbout: [
      'Custom software development',
      'Web development',
      'E-commerce',
      'Internal business applications',
      'AI automation',
      'CRM',
      'ERP',
      'Angular',
      'Node.js'
    ]
  }
};

/**
 * SeoService — title + meta tags (description, keywords, robots), Open Graph,
 * Twitter card, canonical, hreflang y JSON-LD por ruta e idioma. Marca Nolo (AR).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteOrigin = this.normalizeOrigin(environment.siteUrl) || 'https://nolo.ar';
  private readonly defaultImage = 'https://nolo.ar/og-image.png';

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  apply(data: SeoData): void {
    const image = data.image || this.defaultImage;
    const locale = data.locale || 'es_AR';
    const isEn = locale === 'en_US';
    const imageAlt =
      data.imageAlt ||
      (isEn
        ? 'Nolo: custom software and web development in Argentina'
        : 'Nolo: desarrollo de software y sitios web a medida en Argentina');
    const robots =
      data.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    const url = this.absoluteUrl(data.canonicalPath ?? this.currentPath());

    this.title.setTitle(data.title);
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ name: 'keywords', content: data.keywords });
    this.meta.updateTag({ name: 'robots', content: robots });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:width', content: String(data.imageWidth ?? 1200) });
    this.meta.updateTag({ property: 'og:image:height', content: String(data.imageHeight ?? 630) });
    this.meta.updateTag({ property: 'og:image:alt', content: imageAlt });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: locale });
    // El otro idioma de la misma página. Las rutas sin par /en (`singleUrl`) no lo declaran, y hay
    // que quitarlo: el <head> sobrevive a la navegación y quedaría el de la página anterior.
    if (data.singleUrl) {
      this.meta.removeTag('property="og:locale:alternate"');
    } else {
      this.meta.updateTag({ property: 'og:locale:alternate', content: isEn ? 'es_AR' : 'en_US' });
    }

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: imageAlt });

    this.setCanonical(url);
    this.setHreflang(data.canonicalPath ?? this.currentPath(), data.singleUrl);
    this.setBrandJsonLd(isEn);
    this.setJsonLd(data, url);
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  // hreflang recíproco a partir del path base (ES, sin /en): cada página declara su par es↔en
  // + x-default (= ES). Vale igual en páginas ES y EN.
  // `singleUrl`: la ruta no tiene par /en (ver SeoData) → los tres apuntan a ella misma. Hay que
  // reescribirlos igual: los <link> viven en el <head> y sobreviven a la navegación, así que sin
  // esto quedarían los de la página anterior.
  private setHreflang(canonicalPath: string, singleUrl?: boolean): void {
    if (singleUrl) {
      const self = this.absoluteUrl(canonicalPath);
      this.setAlternate('es', self);
      this.setAlternate('en', self);
      this.setAlternate('x-default', self);
      return;
    }
    const base = (canonicalPath || '/').replace(/^\/en(?=\/|$)/, '') || '/';
    const enPath = base === '/' ? '/en' : '/en' + base;
    this.setAlternate('es', this.absoluteUrl(base));
    this.setAlternate('en', this.absoluteUrl(enPath));
    this.setAlternate('x-default', this.absoluteUrl(base));
  }

  private setAlternate(hreflang: string, url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${hreflang}"]`
    );
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  // JSON-LD por ruta: WebPage (inLanguage según idioma), Breadcrumb y Service para las dos líneas de
  // negocio. Se conecta por @id al Organization/WebSite que emite setBrandJsonLd.
  private setJsonLd(data: SeoData, url: string): void {
    const locale = data.locale || 'es_AR';
    const isEn = locale === 'en_US';
    const inLanguage = locale.replace('_', '-');
    // Path base (sin /en) SOLO para las comparaciones: así las rutas EN también reciben
    // Breadcrumb/Service correctos. `url` y los @id conservan la URL canónica (con /en).
    const path =
      ((data.canonicalPath ?? '/').split('#')[0].split('?')[0] || '/').replace(
        /^\/en(?=\/|$)/,
        ''
      ) || '/';
    const shortName = data.title.split('|')[0].trim();
    const langPrefix = isEn ? '/en' : '';

    const graph: Record<string, unknown>[] = [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: data.title,
        description: data.description,
        inLanguage,
        ...(data.dateModified ? { dateModified: data.dateModified } : {}),
        isPartOf: { '@id': `${this.siteOrigin}/#website` }
      }
    ];

    if (path !== '/') {
      // Inicio → ancestros declarados (ver BREADCRUMB_NODES) → página actual, con los nombres y
      // las URLs del idioma activo.
      const crumbs: { name: string; item: string }[] = [
        {
          name: isEn ? 'Home' : 'Inicio',
          item: isEn ? this.absoluteUrl('/en') : `${this.siteOrigin}/`
        }
      ];
      for (const ancestor of this.breadcrumbAncestors(path)) {
        const node = BREADCRUMB_NODES[ancestor];
        crumbs.push({
          name: isEn ? node.en : node.es,
          item: this.absoluteUrl(`${langPrefix}${ancestor}`)
        });
      }
      crumbs.push({ name: shortName, item: url });
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: crumbs.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          ...crumb
        }))
      });
    }

    const isIndustry = path === '/industrias' || path.startsWith('/industrias/');
    const isSoftwareAr = path === SOFTWARE_AR_HUB || path.startsWith(`${SOFTWARE_AR_HUB}/`);
    if (
      path === '/software' ||
      path === '/web' ||
      path.startsWith('/software/') ||
      isIndustry ||
      isSoftwareAr
    ) {
      graph.push({
        '@type': 'Service',
        '@id': `${url}#service`,
        name: shortName,
        description: data.description,
        // En el idioma de la página: /web es desarrollo web, las industrias cubren las dos líneas
        // y el resto (/software, /software/:slug y el hub de software AR con sus fichas) es
        // desarrollo de software a medida.
        serviceType:
          path === '/web'
            ? isEn
              ? 'Web development'
              : 'Desarrollo web'
            : isIndustry
              ? isEn
                ? 'Custom software & web development'
                : 'Desarrollo de software y sitios web a medida'
              : isEn
                ? 'Custom software development'
                : 'Desarrollo de software a medida',
        areaServed: { '@type': 'Country', name: 'Argentina' },
        provider: { '@id': `${this.siteOrigin}/#organization` },
        // Solo el hub: el rango que dicen su tabla de precios y la respuesta 01 de su FAQ.
        ...(path === SOFTWARE_AR_HUB
          ? {
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'USD',
                lowPrice: 1500,
                highPrice: 15000
              }
            }
          : {})
      });
    }

    this.writeJsonLd('route', { '@context': 'https://schema.org', '@graph': graph });
  }

  // Ancestros del breadcrumb, de la raíz hacia abajo. El primero sale de la URL (/a/b → /a) o de
  // `parent` cuando la ruta es de primer nivel, y a partir de ahí se sube por `parent`. Solo cuentan
  // los niveles declarados en BREADCRUMB_NODES: una ruta desconocida no agrega migas. El control de
  // repetidos corta cualquier ciclo si alguien declarara dos `parent` cruzados.
  private breadcrumbAncestors(path: string): string[] {
    const segments = path.split('/').filter(Boolean);
    let node = segments.length === 2 ? '/' + segments[0] : BREADCRUMB_NODES[path]?.parent;
    const chain: string[] = [];
    while (node && BREADCRUMB_NODES[node] && !chain.includes(node)) {
      chain.unshift(node);
      node = BREADCRUMB_NODES[node].parent;
    }
    return chain;
  }

  // Organization + WebSite, la ficha de la marca, en el idioma de la página. Los @id no dependen
  // del idioma: son la misma entidad en todo el sitio y los referencian `Service.provider` y
  // `WebPage.isPartOf`. `WebSite.inLanguage` lista los dos idiomas que sirve el sitio (propiedad
  // del sitio, no de la página; la del documento va en el `WebPage`).
  private setBrandJsonLd(isEn: boolean): void {
    const brand = isEn ? BRAND.en : BRAND.es;
    this.writeJsonLd('brand', {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${this.siteOrigin}/#organization`,
          name: 'Nolo',
          legalName: COMPANY_LEGAL.legalName,
          taxID: COMPANY_LEGAL.taxId,
          url: `${this.siteOrigin}/`,
          description: brand.description,
          slogan: brand.slogan,
          knowsAbout: brand.knowsAbout,
          logo: `${this.siteOrigin}/icon-512.png`,
          email: 'hola@nolo.ar',
          telephone: '+5491133337180',
          openingHours: 'Mo-Fr 09:00-18:00',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Buenos Aires',
            addressCountry: 'AR'
          },
          areaServed: { '@type': 'Country', name: 'Argentina' },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+5491133337180',
            email: 'hola@nolo.ar',
            contactType: 'customer service'
          }
        },
        {
          '@type': 'WebSite',
          '@id': `${this.siteOrigin}/#website`,
          url: `${this.siteOrigin}/`,
          name: 'Nolo',
          inLanguage: ['es-AR', 'en-US'],
          publisher: { '@id': `${this.siteOrigin}/#organization` }
        }
      ]
    });
  }

  // Un <script type="application/ld+json"> por clave. Al hidratar reutiliza el nodo que dejó el
  // prerender (SSG): crear uno nuevo dejaría el bloque duplicado en la página, como ya pasó con el
  // VideoObject de viewcases.
  private writeJsonLd(key: string, data: unknown): void {
    let script = this.doc.querySelector<HTMLScriptElement>(
      `script[type="application/ld+json"][data-seo="${key}"]`
    );
    if (!script) {
      script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo', key);
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  private currentPath(): string {
    return this.doc.location ? this.doc.location.pathname : '/';
  }

  private absoluteUrl(path: string): string {
    const clean = (path || '/').split('#')[0].split('?')[0];
    const normalized = clean === '/' ? '/' : '/' + clean.replace(/^\/+|\/+$/g, '');
    return `${this.siteOrigin}${normalized}`;
  }

  private normalizeOrigin(url?: string): string | null {
    if (!url) return null;
    try {
      return new URL(url).origin;
    } catch {
      return url.replace(/\/+$/, '');
    }
  }
}
