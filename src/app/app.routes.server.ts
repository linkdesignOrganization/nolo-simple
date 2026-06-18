import { RenderMode, ServerRoute } from '@angular/ssr';

import { SYSTEM_SLUGS } from './pages/systems-content';
import { INDUSTRY_SLUGS } from './pages/industries-content';

/**
 * Todas las rutas se prerenderan a HTML estático (SSG) para SEO y LLMs.
 * Las 7 páginas de detalle de sistema (/software/:slug) se enumeran con getPrerenderParams
 * para que cada una genere su propio index.html con su contenido y SEO.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'software/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => SYSTEM_SLUGS.map((slug) => ({ slug }))
  },
  {
    path: 'en/software/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => SYSTEM_SLUGS.map((slug) => ({ slug }))
  },
  {
    path: 'industrias/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => INDUSTRY_SLUGS.map((slug) => ({ slug }))
  },
  {
    // EN: la página existe para que el toggle funcione; el contenido cae a ES hasta tener copy EN.
    path: 'en/industrias/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => INDUSTRY_SLUGS.map((slug) => ({ slug }))
  },
  { path: '**', renderMode: RenderMode.Prerender }
];
