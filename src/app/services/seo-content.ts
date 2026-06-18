import { Lang } from './language.service';
import { SeoData } from './seo.service';
import { getSystemDetail, SystemDetail } from '../pages/systems-content';
import { getIndustryDetail, IndustryDetail } from '../pages/industries-content';

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
      title: 'Software a medida para empresas | Nolo',
      description:
        'Sistemas internos construidos sobre tu operación real: CRM, ERP e inventario, e-commerce, ticketing, reservas, dashboards y automatización con IA.',
      keywords:
        'software a medida, sistemas internos, crm, erp, e-commerce, ticketing, reservas, dashboards, automatización, argentina',
      canonicalPath: '/software'
    },
    en: {
      title: 'Custom software for companies | Nolo',
      description:
        'Internal systems built on your real operation: CRM, ERP and inventory, e-commerce, ticketing, booking, dashboards and AI automation.',
      keywords:
        'custom software, internal systems, crm, erp, e-commerce, ticketing, booking, dashboards, automation, argentina',
      canonicalPath: '/software',
      locale: 'en_US'
    }
  },
  '/web': {
    es: {
      title: 'Desarrollo web a medida | Nolo',
      description:
        'Sitios web a medida con identidad propia, performance y SEO: landing pages, sitios corporativos y e-commerce, sin plantillas genéricas.',
      keywords:
        'desarrollo web, sitios a medida, landing page, sitio corporativo, e-commerce, diseño web, argentina',
      canonicalPath: '/web'
    },
    en: {
      title: 'Custom web development | Nolo',
      description:
        'Custom websites with their own identity, performance and SEO: landing pages, corporate sites and e-commerce, no generic templates.',
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
        'Conversemos sobre tu proyecto. Escribinos por correo o WhatsApp y agendá una reunión con el equipo de Nolo.',
      keywords: 'contacto, nolo, correo, whatsapp, reunión, argentina',
      canonicalPath: '/contacto'
    },
    en: {
      title: 'Contact & project meeting | Nolo',
      description:
        "Let's talk about your project. Reach us by email or WhatsApp and book a meeting with the Nolo team.",
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
        'How we collect, use and protect your personal data at Nolo, including purposes, rights and contact channels.',
      keywords: 'privacy policy, data protection, privacy, nolo, argentina',
      canonicalPath: '/politicas-de-privacidad',
      locale: 'en_US'
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
// del sistema y la descripción es su párrafo "Qué es" recortado a ~160 chars para el meta).
// Recorta el primer párrafo de "Qué es" a una meta-descripción limpia (~158 chars): prioriza
// terminar en fin de oración; si no entra, cierra en el ":" de una enumeración; en último caso
// corta en límite de palabra + elipsis. Nunca corta a media palabra (lo que se veía roto en SERP).
function lastSentenceBoundary(s: string, punct: string): number {
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === punct && (i + 1 >= s.length || s[i + 1] === ' ')) return i;
  }
  return -1;
}

function metaDescription(text: string, max = 158): string {
  const para = text.split('\n\n')[0].trim();
  if (para.length <= max) return para;

  const window = para.slice(0, max + 1);
  const sentenceEnd = Math.max(
    lastSentenceBoundary(window, '.'),
    lastSentenceBoundary(window, '!'),
    lastSentenceBoundary(window, '?')
  );
  if (sentenceEnd >= 80) return para.slice(0, sentenceEnd + 1).trim();

  const colon = window.lastIndexOf(':');
  if (colon >= 80) return para.slice(0, colon).trim() + '.';

  const cut = para.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

function systemSeo(detail: SystemDetail, lang: Lang): SeoData {
  const description = metaDescription(detail.whatItIs);
  const suffix = lang === 'en' ? 'Custom software — Nolo' : 'Software a medida — Nolo';
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
    title: `${detail.pageTitle} | Nolo`,
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
  const withCanonical = (data: SeoData): SeoData => ({
    ...data,
    canonicalPath: toCanonical(data.canonicalPath ?? base)
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

  const entry = SEO_CONTENT[base] ?? SEO_FALLBACK;
  return withCanonical(entry[lang]);
}
