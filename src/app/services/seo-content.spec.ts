import { INDUSTRY_SLUGS } from '../pages/industries-content';
import { getSoftwareArCase, SOFTWARE_AR_CASE_SLUGS } from '../pages/software-ar-cases-content';
import { SYSTEM_SLUGS } from '../pages/systems-content';
import { Lang } from './language.service';
import { SEO_CONTENT, seoForUrl } from './seo-content';

/**
 * SEO del hub «Desarrollo de software a medida en Argentina» y de sus fichas en los dos idiomas
 * (PLAN-FICHAS-NOLO.md, Ola 2a, agente B5): canonical por idioma, sin `singleUrl`, descriptions de
 * 120 a 160 caracteres, título de ficha con sufijo corto, póster propio como og:image y
 * `dateModified`.
 *
 * Las catorce páginas son indexables desde el push: no declaran `robots`, así que SeoService les
 * aplica su valor por defecto, el mismo del resto del sitio («index, follow, max-image-preview:
 * large, max-snippet:-1, max-video-preview:-1»). La única ruta que sí declara `robots` es /404
 * (Nolo no tiene la página /ads de Link Design), y un test del final lo fija para que nadie la
 * encienda por accidente. El bloque «higiene de SEO_CONTENT» cubre el resto del sitio: rango de la
 * description, campos completos por idioma y ningún guion largo en los títulos.
 *
 * Grafía: en todo lo que lee un buscador la marca es «Nolo» sin virgulilla, que es lo que la gente
 * escribe. «Nolõ» queda para los textos visibles del sitio.
 */

// Regex de fuga de español, para las cadenas SEO en inglés.
const SPANISH_LEAK =
  /¿|ñ|[áéíóúÁÉÍÓÚ]|\b(de la|de los|para que|porque|también|desde|cada|sistemas?|empresas?|nosotros|contigo|puedes|podés|tu|tus)\b/g;
// Nombres propios que sí pueden aparecer en inglés (llevan tilde o parecen español, pero no lo son).
const PROPER_NAMES =
  /Vértice Seguridad Industrial|Estudio Dental Mendieta|Tornos del Sur|Punto Cero|Mercado Pago|Buenos Aires|Argentina|Link Design|Nolõ|Nolo/g;
const leaks = (text: string) =>
  text.replace(/«[^»]*»/g, '').replace(PROPER_NAMES, '').match(SPANISH_LEAK) ?? [];

const HUB = '/desarrollo-de-software-argentina';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LANGS: Lang[] = ['es', 'en'];

// Rutas que no se indexan: su título y su description no compiten por ningún recorte de Google.
// En Nolo la marca es corta («| Nolo»), así que «Page not found | Nolo» queda en 21 caracteres:
// por debajo del piso que el sitio se fija para un título que sí se muestra en resultados.
const NOT_INDEXED = ['/404'];

// El <title> de una ficha lleva siempre nombre del demo, categoría y marca. Con la marca corta de
// Nolo el más largo queda en 66, pero el margen se declara igual que en el sitio gemelo: si un
// nombre de demo crece, se prefiere que el buscador recorte la marca antes que soltar el nombre,
// que es lo que identifica la ficha y sin el cual el título queda casi igual al de la página de
// sistema de ERP. Por eso las fichas admiten 75 y el resto del sitio 70.
const CASE_TITLE_MAX = 75;
const caseTitle = (c: { name: string; category: string }) => `${c.name}: ${c.category} | Nolo`;

describe('seoForUrl (hub de software AR y fichas)', () => {
  it('resolves the hub in English with a /en canonical, indexable and no singleUrl', () => {
    const seo = seoForUrl(`/en${HUB}`, 'en');

    expect(seo.canonicalPath).toBe(`/en${HUB}`);
    // Sin `robots` propio: SeoService aplica el «index, follow, …» del resto del sitio.
    expect(seo.robots).toBeUndefined();
    expect(seo.singleUrl).toBeFalsy();
    expect(seo.locale).toBe('en_US');
    expect(seo.title).toBe(SEO_CONTENT[HUB].en.title);
    expect(seo.dateModified).toMatch(ISO_DATE);
    // El hub usa la imagen genérica del sitio (la pone SeoService).
    expect(seo.image).toBeUndefined();
    expect(leaks(`${seo.title} ${seo.description} ${seo.keywords}`)).toEqual([]);

    // El fragment del nav (#precios) y el query no cambian el canonical.
    expect(seoForUrl(`/en${HUB}#precios`, 'en').canonicalPath).toBe(`/en${HUB}`);
    expect(seoForUrl(`/en${HUB}?x=1`, 'en').canonicalPath).toBe(`/en${HUB}`);
  });

  it('resolves the hub in Spanish without the language prefix', () => {
    const seo = seoForUrl(HUB, 'es');

    expect(seo.canonicalPath).toBe(HUB);
    expect(seo.robots).toBeUndefined();
    expect(seo.singleUrl).toBeFalsy();
    expect(seo.title).toBe(SEO_CONTENT[HUB].es.title);
    expect(seo.dateModified).toMatch(ISO_DATE);
  });

  it('keeps the hub title away from the one /software already uses', () => {
    // Las dos páginas hablan de desarrollo de software en Argentina: si comparten el título compiten
    // entre sí por la misma consulta.
    expect(SEO_CONTENT[HUB].es.title).not.toBe(SEO_CONTENT['/software'].es.title);
    expect(SEO_CONTENT[HUB].en.title).not.toBe(SEO_CONTENT['/software'].en.title);
    expect(SEO_CONTENT[HUB].es.description).not.toBe(SEO_CONTENT['/software'].es.description);
    expect(SEO_CONTENT[HUB].en.description).not.toBe(SEO_CONTENT['/software'].en.description);
  });

  it('resolves an English case with its English category and description under /en', () => {
    const seo = seoForUrl(`/en${HUB}/pulso`, 'en');

    expect(seo.title).toBe('Pulso: Gym & wellness management system | Nolo');
    expect(seo.description).toBe(
      'Working demo of a custom gym & wellness management system built in Argentina: it costs USD 4,000 to 7,500 and takes 8 to 12 weeks. Browse the full Pulso demo.'
    );
    expect(seo.canonicalPath).toBe(`/en${HUB}/pulso`);
    expect(seo.robots).toBeUndefined();
    expect(seo.singleUrl).toBeFalsy();
    expect(seo.locale).toBe('en_US');
    expect(seo.keywords).toContain('nolo');
    // Póster propio del demo como og:image, con sus dimensiones y su alt.
    expect(seo.image).toMatch(/^https?:\/\/.+\/media\/software\/pulso\.jpg$/);
    expect(seo.imageWidth).toBe(1280);
    expect(seo.imageHeight).toBe(682);
    expect(seo.imageAlt).toBe('Pulso: Gym & wellness management system');
    expect(seo.dateModified).toMatch(ISO_DATE);
    expect(leaks(`${seo.title} ${seo.description} ${seo.keywords}`)).toEqual([]);
  });

  it('resolves every case in English from its own English content', () => {
    for (const slug of SOFTWARE_AR_CASE_SLUGS) {
      const c = getSoftwareArCase(slug, 'en')!;
      const seo = seoForUrl(`/en${HUB}/${slug}`, 'en');

      expect(seo.title, slug).toBe(caseTitle(c));
      // «software» es incontable: la categoría que termina en «software» va sin artículo.
      expect(seo.description, slug).toMatch(/^Working demo of (?:a )?custom /);
      expect(seo.description, slug).toContain('built in Argentina');
      // El asterisco de la nota al pie no llega al resultado de búsqueda.
      expect(seo.description, slug).toContain(c.range.replace('*', ''));
      expect(seo.description, slug).toContain(c.timeline.replace('*', ''));
      expect(seo.description, slug).not.toContain('*');
      expect(seo.description, slug).toMatch(/Browse the full (?:.+ )?demo\.$/);
      expect(seo.keywords, slug).toContain(c.category.toLowerCase());
      expect(seo.canonicalPath, slug).toBe(`/en${HUB}/${slug}`);
      expect(seo.image, slug).toMatch(new RegExp(`^https?://.+${c.poster.replace('.', '\\.')}$`));
      expect(seo.imageAlt, slug).toBe(`${c.name}: ${c.category}`);
      expect(seo.robots, slug).toBeUndefined();
      expect(seo.singleUrl, slug).toBeFalsy();
      expect(leaks(`${seo.title} ${seo.description} ${seo.keywords}`), slug).toEqual([]);
    }
  });

  it('resolves the Spanish case with the Spanish sentence and no prefix', () => {
    const seo = seoForUrl(`${HUB}/pulso`, 'es');

    expect(seo.title).toBe('Pulso: Sistema de gestión para gimnasios y wellness | Nolo');
    expect(seo.description).toBe(
      'Demo de un sistema de gestión para gimnasios y wellness hecho a medida en Argentina: cuesta USD 4.000 a 7.500 y toma 8 a 12 semanas. Recorrelo completo.'
    );
    expect(seo.canonicalPath).toBe(`${HUB}/pulso`);
    expect(seo.robots).toBeUndefined();
    expect(seo.singleUrl).toBeFalsy();
    expect(seo.imageAlt).toBe('Pulso: Sistema de gestión para gimnasios y wellness');
  });

  it('resolves every case in Spanish with category, country, range and timeline', () => {
    for (const slug of SOFTWARE_AR_CASE_SLUGS) {
      const c = getSoftwareArCase(slug, 'es')!;
      const seo = seoForUrl(`${HUB}/${slug}`, 'es');

      expect(seo.title, slug).toBe(caseTitle(c));
      expect(seo.description, slug).toMatch(/^Demo de un /);
      expect(seo.description, slug).toContain('hecho a medida en Argentina');
      // El asterisco de la nota al pie no llega al resultado de búsqueda.
      expect(seo.description, slug).toContain(c.range.replace('*', ''));
      expect(seo.description, slug).toContain(c.timeline.replace('*', ''));
      expect(seo.description, slug).not.toContain('*');
      // Voseo: «Recorrelo», no «Recórrelo».
      expect(seo.description, slug).toMatch(/Recorrelo completo\.$/);
      expect(seo.canonicalPath, slug).toBe(`${HUB}/${slug}`);
      expect(seo.robots, slug).toBeUndefined();
      expect(seo.dateModified, slug).toMatch(ISO_DATE);
    }
  });

  it('lowercases the category inside the description unless it starts with an acronym', () => {
    expect(seoForUrl(`${HUB}/cumbre`, 'es').description).toContain(
      'Demo de un sistema de gestión de RRHH hecho'
    );
    expect(seoForUrl(`${HUB}/tornos-del-sur`, 'es').description).toContain(
      'Demo de un ERP industrial hecho'
    );
    expect(seoForUrl(`/en${HUB}/cumbre`, 'en').description).toContain(
      'Working demo of a custom HR management system built'
    );
    expect(seoForUrl(`/en${HUB}/tornos-del-sur`, 'en').description).toContain(
      'Working demo of a custom industrial ERP built'
    );
  });

  it('drops the indefinite article when the English category ends in «software»', () => {
    // «a custom clinic management software» es agramatical: software es incontable.
    expect(seoForUrl(`/en${HUB}/estudio-dental-mendieta`, 'en').description).toMatch(
      /^Working demo of custom clinic management software built in Argentina/
    );
  });

  it('keeps the demo name in the English call to action only when it fits in 158 characters', () => {
    expect(seoForUrl(`/en${HUB}/pulso`, 'en').description).toMatch(/Browse the full Pulso demo\.$/);
    expect(seoForUrl(`/en${HUB}/estudio-dental-mendieta`, 'en').description).toMatch(
      /weeks\. Browse the full demo\.$/
    );
  });

  it('keeps every description of the hub and the twelve cases between 120 and 158 characters', () => {
    const pages = [
      seoForUrl(HUB, 'es'),
      seoForUrl(`/en${HUB}`, 'en'),
      ...SOFTWARE_AR_CASE_SLUGS.flatMap((slug) => [
        seoForUrl(`${HUB}/${slug}`, 'es'),
        seoForUrl(`/en${HUB}/${slug}`, 'en')
      ])
    ];

    expect(pages).toHaveLength(14);
    for (const page of pages) {
      expect(page.description.length, page.canonicalPath).toBeLessThanOrEqual(158);
      expect(page.description.length, page.canonicalPath).toBeGreaterThanOrEqual(120);
      // Ni un asterisco huérfano en el snippet, ni en el hub ni en las fichas.
      expect(page.description, page.canonicalPath).not.toContain('*');
    }
  });

  it('gives the six cases six different titles in each language', () => {
    // Si `caseMatch` no engancha, las fichas heredan el SEO del hub y los seis títulos se repiten.
    for (const lang of LANGS) {
      const titles = SOFTWARE_AR_CASE_SLUGS.map(
        (slug) => seoForUrl(lang === 'en' ? `/en${HUB}/${slug}` : `${HUB}/${slug}`, lang).title
      );
      expect(new Set(titles).size, lang).toBe(6);
      expect(titles, lang).not.toContain(SEO_CONTENT[HUB][lang].title);
    }
  });

  it('keeps /404 out of the index in both languages', () => {
    for (const lang of LANGS) {
      const seo = seoForUrl('/404', lang);
      expect(seo.robots, lang).toBe('noindex, follow');
    }
  });
});

/**
 * Higiene de la tabla SEO de todo el sitio, no solo del hub: largo de la description, campos
 * completos por idioma y nada de guiones largos en los títulos (el sitio los prohíbe en sus copys).
 */
describe('SEO_CONTENT (todo el sitio)', () => {
  const INDEXABLE = Object.keys(SEO_CONTENT).filter((route) => !NOT_INDEXED.includes(route));

  it('declares robots only on /404', () => {
    const withRobots = Object.entries(SEO_CONTENT)
      .filter(([, entry]) => LANGS.some((lang) => entry[lang].robots))
      .map(([route]) => route);

    expect(withRobots.sort()).toEqual(['/404']);
  });

  it('keeps every indexable description between 120 and 160 characters', () => {
    for (const route of INDEXABLE) {
      for (const lang of LANGS) {
        const { description } = SEO_CONTENT[route][lang];
        expect(description.length, `${route} (${lang})`).toBeGreaterThanOrEqual(120);
        expect(description.length, `${route} (${lang})`).toBeLessThanOrEqual(160);
      }
    }
  });

  it('fills title, description, keywords and canonicalPath in both languages', () => {
    for (const [route, entry] of Object.entries(SEO_CONTENT)) {
      for (const lang of LANGS) {
        const data = entry[lang];
        expect(data.title.length, `${route} (${lang})`).toBeGreaterThan(0);
        expect(data.keywords.length, `${route} (${lang})`).toBeGreaterThan(0);
        expect(data.canonicalPath, `${route} (${lang})`).toBe(route);
      }
      // El idioma que le toca a cada entrada: la inglesa marca su locale y ninguna repite el texto
      // de la otra (síntoma de haber copiado la entrada del otro idioma).
      expect(entry.en.locale, route).toBe('en_US');
      expect(entry.es.locale, route).toBeUndefined();
      expect(entry.en.title, route).not.toBe(entry.es.title);
      expect(entry.en.description, route).not.toBe(entry.es.description);
      // Las keywords sí pueden coincidir: las de /404 son solo nombres propios, iguales en los dos
      // idiomas por definición.
      // Sin restos del español en la entrada inglesa.
      const en = `${entry.en.title} ${entry.en.description} ${entry.en.keywords}`;
      expect(leaks(en), route).toEqual([]);
    }
  });

  it('resolves the canonical of every route by language, except the single-URL ones', () => {
    for (const [route, entry] of Object.entries(SEO_CONTENT)) {
      expect(seoForUrl(route, 'es').canonicalPath, route).toBe(route);

      const en = seoForUrl(route === '/' ? '/en' : `/en${route}`, 'en');
      expect(en.canonicalPath, route).toBe(
        entry.en.singleUrl ? route : `/en${route === '/' ? '' : route}`
      );
    }
  });
});

/**
 * Títulos derivados (sistemas, industrias y fichas): el separador es la barra y nunca el guion
 * largo, que el sitio prohíbe en sus copys y que hasta este cambio salía en el <title> de las siete
 * páginas de sistema.
 */
describe('títulos derivados', () => {
  // Las páginas de detalle, que componen su SEO en seo-content.ts y no en la tabla.
  const derived = () => [
    ...SYSTEM_SLUGS.flatMap((slug) => [
      seoForUrl(`/software/${slug}`, 'es'),
      seoForUrl(`/en/software/${slug}`, 'en')
    ]),
    ...INDUSTRY_SLUGS.flatMap((slug) => [
      seoForUrl(`/industrias/${slug}`, 'es'),
      seoForUrl(`/en/industrias/${slug}`, 'en')
    ]),
    ...SOFTWARE_AR_CASE_SLUGS.flatMap((slug) => [
      seoForUrl(`${HUB}/${slug}`, 'es'),
      seoForUrl(`/en${HUB}/${slug}`, 'en')
    ])
  ];

  const everySeo = () => [
    ...Object.keys(SEO_CONTENT).flatMap((route) => [
      seoForUrl(route, 'es'),
      seoForUrl(route === '/' ? '/en' : `/en${route}`, 'en')
    ]),
    ...derived()
  ];

  it('never uses an em dash anywhere in the SEO strings', () => {
    for (const seo of everySeo()) {
      expect(`${seo.title} ${seo.description} ${seo.keywords}`, seo.canonicalPath).not.toContain(
        '—'
      );
      expect(seo.title, seo.canonicalPath).toContain('Nolo');
    }
  });

  it('closes every derived title with the brand', () => {
    // La tabla no entra: el título del home abre con la marca en vez de cerrar con ella.
    for (const seo of derived()) {
      expect(seo.title, seo.canonicalPath).toMatch(/\| Nolo$/);
    }
  });

  it('keeps every derived description between 120 and 160 characters', () => {
    // Las páginas de sistema y de industria derivan su description del contenido de la página, y
    // `metaDescription()` la cierra en fin de oración o en el corte de cláusula más largo que entre
    // en 158, nunca a media palabra.
    for (const seo of derived()) {
      expect(seo.description.length, seo.canonicalPath).toBeGreaterThanOrEqual(120);
      expect(seo.description.length, seo.canonicalPath).toBeLessThanOrEqual(160);
    }
  });

  it('never closes a description on a dangling conjunction', () => {
    for (const seo of derived()) {
      expect(seo.description, seo.canonicalPath).not.toMatch(/\b(y|e|o|u|and|or)…$/);
    }
  });

  it('keeps every title between 25 and 70 characters, 75 in the case pages', () => {
    for (const seo of everySeo()) {
      const path = seo.canonicalPath ?? '';
      const max = path.includes(`${HUB}/`) ? CASE_TITLE_MAX : 70;
      expect(seo.title.length, path).toBeLessThanOrEqual(max);
      // El piso solo aplica a lo que se muestra en resultados: /404 no se indexa.
      if (!NOT_INDEXED.some((route) => path === route || path === `/en${route}`)) {
        expect(seo.title.length, path).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it('keeps the seven system titles under 70 characters', () => {
    for (const slug of SYSTEM_SLUGS) {
      for (const lang of LANGS) {
        const seo = seoForUrl(lang === 'en' ? `/en/software/${slug}` : `/software/${slug}`, lang);
        expect(seo.title.length, `${slug} (${lang})`).toBeLessThanOrEqual(70);
        const tail = `| ${lang === 'en' ? 'Custom software' : 'Software a medida'} | Nolo`;
        expect(seo.title, `${slug} (${lang})`).toContain(tail);
      }
    }
  });

  it('opens every case title with the demo name, in both languages', () => {
    for (const slug of SOFTWARE_AR_CASE_SLUGS) {
      for (const lang of LANGS) {
        const c = getSoftwareArCase(slug, lang)!;
        const path = lang === 'en' ? `/en${HUB}/${slug}` : `${HUB}/${slug}`;
        expect(seoForUrl(path, lang).title, path).toMatch(
          new RegExp(`^${c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: `)
        );
        expect(seoForUrl(path, lang).title, path).toMatch(/\| Nolo$/);
      }
    }
  });

  it('gives the two languages of a page the same title shape', () => {
    const shape = (title: string) => title.split(': ').length;
    for (const slug of SOFTWARE_AR_CASE_SLUGS) {
      const es = seoForUrl(`${HUB}/${slug}`, 'es').title;
      const en = seoForUrl(`/en${HUB}/${slug}`, 'en').title;
      expect(shape(en), slug).toBe(shape(es));
    }
    for (const slug of INDUSTRY_SLUGS) {
      const es = seoForUrl(`/industrias/${slug}`, 'es').title;
      const en = seoForUrl(`/en/industrias/${slug}`, 'en').title;
      expect(en.startsWith('Custom solutions for'), slug).toBe(
        es.startsWith('Soluciones a medida para')
      );
    }
  });
});
