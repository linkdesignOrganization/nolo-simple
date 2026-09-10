import { Lang } from './language.service';
import { SeoData } from './seo.service';
import { getSystemDetail, SystemDetail } from '../pages/systems-content';
import { getIndustryDetail, IndustryDetail } from '../pages/industries-content';
import { getSoftwareArCase, SoftwareArCase } from '../pages/software-ar-cases-content';
import { environment } from '../../environments/environment';

/** Origen del sitio para las imágenes OG propias (el póster de cada ficha); igual que viewcases. */
const SITE_ORIGIN = (environment.siteUrl || 'https://nolo.ar').replace(/\/+$/, '');

/**
 * Contenido SEO por ruta e idioma (ES/EN) para Nolo (Argentina, voseo).
 * Las rutas de detalle de sistema (/software/<slug>) NO se listan acá: su SEO se deriva
 * del contenido del sistema en seoForUrl().
 */
export const SEO_CONTENT: Record<string, Record<Lang, SeoData>> = {
  '/': {
    es: {
      title: 'Nolo | Software y sitios web a medida en Argentina',
      description:
        'Construimos software a medida y sitios web con criterio técnico. CRM, ERP, e-commerce, automatización con IA y más, sobre la operación real de tu empresa.',
      keywords:
        'software a medida, desarrollo de software, sitios web, crm, erp, e-commerce, automatización, argentina, nolo',
      canonicalPath: '/'
    },
    en: {
      title: 'Nolo | Custom software and websites in Argentina',
      description:
        'We build custom software and websites with technical clarity. CRM, ERP, e-commerce, AI automation and more, built on your real operation.',
      keywords:
        'custom software, software development, websites, crm, erp, e-commerce, automation, argentina, nolo',
      canonicalPath: '/',
      locale: 'en_US'
    }
  },
  '/software': {
    es: {
      title: 'Desarrollo de software a medida en Argentina | Nolo',
      // 146: la frase «Empresa de desarrollo de software en Argentina» pasó al hub
      // (/desarrollo-de-software-argentina), que es la página que compite por esa consulta; acá
      // sobraba y dejaba la description en 194, fuera del recorte del buscador.
      description:
        'Sistemas internos construidos sobre tu operación real: CRM, ERP e inventario, e-commerce, ticketing, reservas, dashboards y automatización con IA.',
      keywords:
        'software a medida, sistemas internos, crm, erp, e-commerce, ticketing, reservas, dashboards, automatización, argentina',
      canonicalPath: '/software'
    },
    en: {
      title: 'Custom software development in Argentina | Nolo',
      description:
        'Internal systems built on your real operation: CRM, ERP and inventory, e-commerce, ticketing, booking, dashboards and applied AI automation.',
      keywords:
        'custom software, internal systems, crm, erp, e-commerce, ticketing, booking, dashboards, automation, argentina',
      canonicalPath: '/software',
      locale: 'en_US'
    }
  },
  '/web': {
    es: {
      title: 'Diseño y desarrollo de páginas web | Nolo',
      description:
        'Páginas web a medida con identidad propia, performance y SEO: landing pages, sitios corporativos y e-commerce, sin plantillas genéricas.',
      keywords:
        'desarrollo web, sitios a medida, landing page, sitio corporativo, e-commerce, diseño web, argentina',
      canonicalPath: '/web'
    },
    en: {
      title: 'Web design and development | Nolo',
      description:
        'Custom web design and development with its own identity, performance and SEO: landing pages, corporate sites and e-commerce, no generic templates.',
      keywords:
        'web development, custom websites, landing page, corporate site, e-commerce, web design, argentina',
      canonicalPath: '/web',
      locale: 'en_US'
    }
  },
  '/industrias': {
    es: {
      title: 'Soluciones a medida por industria | Nolo',
      description:
        'Software y sitios web a medida para tu sector: industria, distribución y logística, salud, servicios profesionales y técnicos, fitness y educación.',
      keywords: 'industrias, soluciones por industria, software a medida, sitios web, argentina, nolo',
      canonicalPath: '/industrias'
    },
    en: {
      title: 'Custom solutions by industry | Nolo',
      description:
        'Custom software and websites for your sector: industry, distribution and logistics, health, professional and technical services, fitness and education.',
      keywords: 'industries, solutions by industry, custom software, websites, argentina, nolo',
      canonicalPath: '/industrias',
      locale: 'en_US'
    }
  },
  '/contacto': {
    es: {
      title: 'Contacto y reunión de proyecto | Nolo',
      description:
        'Conversemos sobre tu proyecto de software o sitio web. Escribinos por correo o WhatsApp y agendá una reunión con el equipo de Nolo.',
      keywords: 'contacto, nolo, correo, whatsapp, reunión, argentina',
      canonicalPath: '/contacto'
    },
    en: {
      title: 'Contact & project meeting | Nolo',
      description:
        "Let's talk about your software or website project. Reach us by email or WhatsApp and book a meeting with the Nolo team in Argentina.",
      keywords: 'contact, nolo, email, whatsapp, meeting, argentina',
      canonicalPath: '/contacto',
      locale: 'en_US'
    }
  },
  '/politicas-de-privacidad': {
    es: {
      title: 'Política de privacidad y datos | Nolo',
      description:
        'Cómo recopilamos, usamos y protegemos tus datos personales en Nolo, incluyendo finalidades, derechos y medios de contacto.',
      keywords: 'política de privacidad, protección de datos, privacidad, nolo, argentina',
      canonicalPath: '/politicas-de-privacidad'
    },
    en: {
      title: 'Privacy & data policy | Nolo',
      description:
        'How we collect, use and protect your personal data at Nolo, including the purposes, your rights and the channels to contact us about privacy.',
      keywords: 'privacy policy, data protection, privacy, nolo, argentina',
      canonicalPath: '/politicas-de-privacidad',
      locale: 'en_US'
    }
  },
  // Landing «Desarrollo de software a medida en Argentina» (/desarrollo-de-software-argentina), en
  // ES y EN (/en/…): sin `singleUrl`, `withCanonical` antepone /en al canonical en inglés y
  // SeoService declara el par hreflang recíproco. Indexable desde el push: sin `robots` propio
  // hereda el del resto del sitio («index, follow, max-image-preview:large, …», el valor por
  // defecto de SeoService), y entra al sitemap y al llms.txt en el mismo commit. Las fichas
  // (/…/:slug) se resuelven en seoForUrl (rama caseMatch), con el mismo criterio.
  //
  // El título NO repite el de /software («Desarrollo de software a medida en Argentina | Nolo»):
  // las dos páginas competirían por la misma consulta. Acá la keyword es «empresa de desarrollo de
  // software en Argentina», que es lo que se busca cuando se busca proveedor.
  '/desarrollo-de-software-argentina': {
    es: {
      title: 'Empresa de desarrollo de software en Argentina | Nolo',
      // 150 caracteres: rango de la tabla de precios y llamada a la acción dentro del recorte de Google.
      description:
        'Empresa de desarrollo de software a medida en Argentina. Precios y plazos por tipo de sistema, de USD 1.500 a 15.000, y seis demos que podés recorrer.',
      keywords:
        'desarrollo de software argentina, empresa de desarrollo de software en argentina, software a medida argentina, nolo',
      canonicalPath: '/desarrollo-de-software-argentina',
      dateModified: '2026-09-09'
    },
    en: {
      title: 'Software development company in Argentina | Nolo',
      description:
        'Custom software development company in Argentina. Prices and timelines by system type, from USD 1,500 to 15,000, and six demos you can browse today.',
      keywords: 'software development argentina, custom software company argentina, nolo',
      canonicalPath: '/desarrollo-de-software-argentina',
      locale: 'en_US',
      dateModified: '2026-09-09'
    }
  },
  '/404': {
    es: {
      title: 'Página no encontrada | Nolo',
      description: 'La página que buscás no existe o se movió. Volvé al inicio de Nolo.',
      keywords: 'nolo, argentina',
      canonicalPath: '/404',
      robots: 'noindex, follow'
    },
    en: {
      title: 'Page not found | Nolo',
      description: "The page you're looking for doesn't exist or has moved. Head back to the Nolo home.",
      keywords: 'nolo, argentina',
      canonicalPath: '/404',
      locale: 'en_US',
      robots: 'noindex, follow'
    }
  }
};

/** Fallback (home) para rutas no mapeadas. */
export const SEO_FALLBACK = SEO_CONTENT['/'];

// SEO derivado del contenido aprobado de cada sistema (no es copy nuevo: el title usa el nombre
// del sistema y la descripción es su párrafo "Qué es" recortado a ~160 chars para el meta). El
// separador es la barra, como en el resto de los títulos del sitio: el guion largo está prohibido
// en los copys y salía en el <title> de las siete páginas de sistema.
// Recorta el primer párrafo de "Qué es" a una meta-descripción limpia (~158 chars): prioriza
// terminar en fin de oración; si no entra, cierra con punto en el ":" o en la última "," de la
// enumeración; en último caso corta en límite de palabra + elipsis. Nunca corta a media palabra
// (lo que se veía roto en SERP).
function lastSentenceBoundary(s: string, punct: string): number {
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === punct && (i + 1 >= s.length || s[i + 1] === ' ')) return i;
  }
  return -1;
}

/** Tope de ancho del <title> que el sitio se fija para que el buscador no lo recorte. */
const TITLE_MAX = 70;

function fitsTitle(title: string): boolean {
  return title.length <= TITLE_MAX;
}

// `min` es el piso del rango que el sitio se fija para las descriptions (120 a 160): un corte
// limpio por oración solo se acepta si llega a ese piso; si no, se busca el corte de cláusula más
// largo que entre en `max` (el ":" que abre una enumeración o la última "," de esa enumeración) y
// se cierra con punto, porque una description de 101 caracteres desaprovecha el snippet. Sin ese
// piso, «Automatización con IA aplicada» cerraba en «dentro de tu operación.» (101 en español, 96
// en inglés) y el ERP en inglés quedaba en 116. La elipsis queda de último recurso, y nunca se
// agrega texto que no esté en el contenido.
function metaDescription(text: string, max = 158, min = 120): string {
  const para = text.split('\n\n')[0].trim();
  if (para.length <= max) return para;

  const window = para.slice(0, max + 1);
  const sentenceEnd = Math.max(
    lastSentenceBoundary(window, '.'),
    lastSentenceBoundary(window, '!'),
    lastSentenceBoundary(window, '?')
  );
  if (sentenceEnd + 1 >= min) return para.slice(0, sentenceEnd + 1).trim();

  const clause = Math.max(window.lastIndexOf(':'), window.lastIndexOf(','));
  if (clause >= min) return para.slice(0, clause).trimEnd() + '.';

  const cut = para.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  const word = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd();
  // Sin conjunción ni puntuación colgando: cortar en «… capacitación profesional y…» deja la frase
  // en el aire, y es lo que pasaba en la industria de educación y formación.
  return word.replace(/\s+\b(y|e|o|u|and|or)$/i, '').replace(/[,;:]$/, '') + '…';
}

// Baja la inicial de la categoría para meterla dentro de una frase, salvo si la primera palabra es
// una sigla (ERP, RRHH, CRM): la misma regla que demoIntro en system-detail-page.ts.
function lowerFirst(text: string): string {
  const first = text.split(' ')[0];
  if (first.length > 1 && first === first.toUpperCase()) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

// Tope de la description de una ficha. 158 y no 160 para que Google no la corte al ras (contrato
// del plan: descriptions de 120 a 158).
const CASE_DESCRIPTION_MAX = 158;

// Description de una ficha, entre 120 y 158 caracteres: categoría, país, rango, plazo y llamada a la
// acción, en voseo. En EN la llamada lleva el nombre del demo; si con él se pasa del tope (Estudio
// Dental Mendieta, Punto Cero y Vértice Seguridad Industrial) va sin nombre, porque recortarla con
// metaDescription() dejaría la ficha sin llamada. El helper queda como último resguardo.
function caseDescription(c: SoftwareArCase, lang: Lang): string {
  const category = lowerFirst(c.category);
  // El asterisco de la nota al pie no viaja al resultado de búsqueda: en el snippet no hay ninguna
  // nota que lo explique y se lee como un error de tipeo. Misma regla que en sitemap-videos.xml.
  const range = c.range.replace('*', '');
  const timeline = c.timeline.replace('*', '');
  if (lang !== 'en') {
    return metaDescription(
      `Demo de un ${category} hecho a medida en Argentina: cuesta ${range} y toma ${timeline}. Recorrelo completo.`,
      CASE_DESCRIPTION_MAX
    );
  }
  // «software» es incontable en inglés y no acepta artículo indefinido: «a custom clinic management
  // software» es agramatical. La categoría publicada no se toca, se condiciona el artículo.
  const article = /software$/i.test(category) ? '' : 'a ';
  const lead = `Working demo of ${article}custom ${category} built in Argentina: it costs ${range} and takes ${timeline}.`;
  const named = `${lead} Browse the full ${c.name} demo.`;
  return metaDescription(
    named.length <= CASE_DESCRIPTION_MAX ? named : `${lead} Browse the full demo.`,
    CASE_DESCRIPTION_MAX
  );
}

function systemSeo(detail: SystemDetail, lang: Lang): SeoData {
  const description = metaDescription(detail.whatItIs);
  const suffix = lang === 'en' ? 'Custom software | Nolo' : 'Software a medida | Nolo';
  const keywords =
    lang === 'en'
      ? `${detail.name.toLowerCase()}, custom software, software development, argentina, nolo`
      : `${detail.name.toLowerCase()}, software a medida, desarrollo de software, argentina, nolo`;
  return {
    title: `${detail.name} | ${suffix}`,
    description,
    keywords,
    canonicalPath: `/software/${detail.slug}`,
    locale: lang === 'en' ? 'en_US' : 'es_AR'
  };
}

// SEO derivado del contenido de cada industria (title = "Título de página" del .md; description =
// el subtítulo recortado a ~158). Mismo patrón que systemSeo.
function industrySeo(detail: IndustryDetail, lang: Lang): SeoData {
  const description = metaDescription(detail.subtitle);
  const keywords =
    lang === 'en'
      ? `${detail.name.toLowerCase()}, custom software, web development, argentina, nolo`
      : `${detail.name.toLowerCase()}, software a medida, sitios web, argentina, nolo`;
  return {
    // El h1 usa `pageTitle` completo; el <title> cae al nombre de la industria cuando ese
    // encabezado no cabe en el ancho que muestra el buscador (regla del sitio: 70 caracteres).
    title: fitsTitle(`${detail.pageTitle} | Nolo`)
      ? `${detail.pageTitle} | Nolo`
      : `${detail.name} | Nolo`,
    description,
    keywords,
    canonicalPath: `/industrias/${detail.slug}`,
    locale: lang === 'en' ? 'en_US' : 'es_AR'
  };
}

/**
 * Resuelve el contenido SEO de una URL (limpiando query/fragment). El diccionario usa rutas SIN
 * prefijo de idioma; acá se quita el `/en` para el lookup y se deriva el `canonicalPath` por idioma
 * (EN → `/en/...`), así cada página declara su URL canónica correcta. Maneja /software/<slug>.
 */
export function seoForUrl(url: string, lang: Lang): SeoData {
  const raw = (url || '/').split('#')[0].split('?')[0] || '/';
  const base = raw.replace(/^\/en(?=\/|$)/, '') || '/';
  const toCanonical = (p: string) => (lang === 'en' ? '/en' + (p === '/' ? '' : p) : p);
  // `singleUrl` (rutas sin variante /en) conserva su canonical tal cual: prefijarlo apuntaría
  // a una URL que no existe cuando el idioma activo es inglés. Hoy ninguna ruta de Nolo lo usa.
  const withCanonical = (data: SeoData): SeoData => ({
    ...data,
    canonicalPath: data.singleUrl
      ? (data.canonicalPath ?? base)
      : toCanonical(data.canonicalPath ?? base)
  });

  // Detalle de sistema: /software/<slug>
  const detailMatch = base.match(/^\/software\/([^/]+)$/);
  if (detailMatch) {
    const detail = getSystemDetail(detailMatch[1], lang);
    if (detail) return withCanonical(systemSeo(detail, lang));
  }

  // Detalle de industria: /industrias/<slug>
  const industryMatch = base.match(/^\/industrias\/([^/]+)$/);
  if (industryMatch) {
    const detail = getIndustryDetail(industryMatch[1], lang);
    if (detail) return withCanonical(industrySeo(detail, lang));
  }

  // Ficha de un demo de la landing de software AR: /desarrollo-de-software-argentina/<slug>, en ES
  // y EN (/en/…). Sin `singleUrl`: withCanonical antepone /en al canonical en inglés y SeoService
  // declara el par hreflang recíproco. Indexable como el hub: sin `robots` propio hereda el
  // «index, follow, …» de SeoService, y las doce URLs (seis fichas × dos idiomas) entran al
  // sitemap, al de videos y al llms.txt en el mismo push.
  const caseMatch = base.match(/^\/desarrollo-de-software-argentina\/([^/]+)$/);
  if (caseMatch) {
    const c = getSoftwareArCase(caseMatch[1], lang);
    if (c) {
      return withCanonical({
        // Sufijo corto: la categoría ya es la keyword de la ficha y el país va en la description.
        // El nombre del demo se conserva siempre: es lo que identifica la ficha en la pestaña y en
        // el resultado, y sin él el título queda casi igual al de la página de sistema de ERP.
        title: `${c.name}: ${c.category} | Nolo`,
        description: caseDescription(c, lang),
        keywords:
          lang === 'en'
            ? `${c.category.toLowerCase()}, custom software argentina, nolo`
            : `${c.category.toLowerCase()}, software a medida argentina, nolo`,
        canonicalPath: `/desarrollo-de-software-argentina/${c.slug}`,
        // Póster propio del demo (1280×682) en vez de la imagen genérica del sitio.
        image: SITE_ORIGIN + c.poster,
        imageWidth: 1280,
        imageHeight: 682,
        imageAlt: `${c.name}: ${c.category}`,
        dateModified: '2026-09-09',
        ...(lang === 'en' ? { locale: 'en_US' } : {})
      });
    }
  }

  const entry = SEO_CONTENT[base] ?? SEO_FALLBACK;
  return withCanonical(entry[lang]);
}
