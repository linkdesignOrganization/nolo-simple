import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

import { environment } from '../../environments/environment';

export interface SeoData {
  title: string;
  description: string;
  keywords: string;
  /** Path canónico (ej. '/software'); se resuelve contra siteUrl. */
  canonicalPath?: string;
  image?: string;
  locale?: string;
  robots?: string;
}

/**
 * SeoService — title + meta tags (description, keywords, robots), Open Graph,
 * Twitter card, canonical, hreflang y JSON-LD por ruta e idioma. Marca Sowe (AR).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteOrigin = this.normalizeOrigin(environment.siteUrl) || 'https://sowe.ar';
  private readonly defaultImage = 'https://sowe.ar/og-image.png';

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  apply(data: SeoData): void {
    const image = data.image || this.defaultImage;
    const locale = data.locale || 'es_AR';
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
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: locale });

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
    this.setHreflang(data.canonicalPath ?? this.currentPath());
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
  private setHreflang(canonicalPath: string): void {
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

  // JSON-LD por ruta: WebPage (inLanguage según idioma), Breadcrumb y Service para software/web
  // y las páginas de detalle de sistema. Se conecta al Organization/WebSite del index.html por @id.
  private setJsonLd(data: SeoData, url: string): void {
    const inLanguage = (data.locale || 'es_AR').replace('_', '-');
    const path = (data.canonicalPath ?? '/').split('#')[0].split('?')[0] || '/';
    const shortName = data.title.split('|')[0].trim();

    const graph: Record<string, unknown>[] = [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: data.title,
        description: data.description,
        inLanguage,
        isPartOf: { '@id': `${this.siteOrigin}/#website` }
      }
    ];

    if (path !== '/') {
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${this.siteOrigin}/` },
          { '@type': 'ListItem', position: 2, name: shortName, item: url }
        ]
      });
    }

    if (path === '/software' || path === '/web' || path.startsWith('/software/')) {
      graph.push({
        '@type': 'Service',
        '@id': `${url}#service`,
        name: shortName,
        description: data.description,
        serviceType: path === '/web' ? 'Web development' : 'Custom software development',
        areaServed: 'AR',
        provider: { '@id': `${this.siteOrigin}/#organization` }
      });
    }

    let script = this.doc.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"][data-seo="route"]'
    );
    if (!script) {
      script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo', 'route');
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
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
