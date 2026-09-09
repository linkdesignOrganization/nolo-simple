import {
  LANDING_BY_PATH_SEGMENT,
  LANGUAGE_PATH_PREFIXES,
  SourceLanding
} from '../models/lead-form-options';

const LANGUAGE_PREFIXES = new Set(LANGUAGE_PATH_PREFIXES);

/**
 * Clasifica el path de una página en el brazo de negocio del que viene el lead.
 *
 * Función pura: recibe el `pathname` y no toca `window` ni el servicio, así que
 * se prueba sin montar nada. `LeadTrackingService.detectLanding()` solo delega.
 *
 * Dos decisiones, las dos por lo mismo — que la clasificación no vuelva a
 * envejecer cada vez que el sitio crece:
 *
 *   1. **El prefijo de idioma se descarta antes de mirar la página.** `/en/software`
 *      y `/software` son la misma página y valen lo mismo.
 *   2. **Solo se mira el PRIMER segmento**, contra `LANDING_BY_PATH_SEGMENT`. Una
 *      página nueva bajo una sección que ya existe se clasifica sola. Lo que no
 *      esté en la tabla es `other`: un cajón por defecto inerte, que no comparte
 *      etiqueta con ninguna página real.
 *
 * Comparar por segmento y no por prefijo de texto además arregla un error
 * silencioso de la versión anterior: `path.startsWith('/web')` clasificaba
 * `/webinars` como brazo web.
 */
export function landingFromPath(
  pathname: string | null | undefined
): SourceLanding {
  if (!pathname) return 'other';

  const segments = pathname
    .toLowerCase()
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean);

  if (segments.length > 0 && LANGUAGE_PREFIXES.has(segments[0])) {
    segments.shift();
  }

  // Sin segmentos es la portada, en cualquier idioma: no es ningún brazo.
  const section = segments[0];
  if (!section) return 'other';

  return LANDING_BY_PATH_SEGMENT[section] ?? 'other';
}
