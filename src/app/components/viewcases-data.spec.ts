import { routes } from '../app.routes';
import type { Lang } from '../services/language.service';
import type { LandingData } from '../pages/landing-page';
import {
  SOFTWARE_AR_CASE_SLUGS,
  getSoftwareArCase
} from '../pages/software-ar-cases-content';
import type { Viewcase } from './viewcases.component';

/**
 * Cruce entre la tarjeta de un demo (bloque `viewcases` de /software, en app.routes.ts) y su ficha
 * (software-ar-cases-content.ts). Son dos archivos que nadie edita a la vez, así que acá se fija
 * que digan lo mismo: la misma categoría, el mismo demo, el mismo media y un `detail` que apunte a
 * la ficha del slug correcto, en los dos idiomas.
 *
 * Vive fuera de software-ar-cases-content.spec.ts a propósito: necesita el campo `detail` del tipo
 * `Viewcase`, que llegó con la infraestructura del sitio (PLAN-FICHAS-NOLO.md, Ola 2b · B3).
 */

/** Tarjetas del bloque `viewcases` de /software en app.routes.ts, por árbol de idioma. */
function viewcaseItems(lang: Lang): Viewcase[] {
  const tree = routes.find((r) => r.path === (lang === 'en' ? 'en' : ''));
  const software = tree?.children?.find((r) => r.path === 'software');
  const data = software?.data?.[lang] as LandingData | undefined;
  return data?.viewcases?.items ?? [];
}

describe('tarjetas de /software ↔ fichas de /desarrollo-de-software-argentina', () => {
  it('los dos árboles de idioma traen las seis tarjetas', () => {
    expect(viewcaseItems('es').length).toBe(6);
    expect(viewcaseItems('en').length).toBe(6);
  });

  for (const slug of SOFTWARE_AR_CASE_SLUGS) {
    describe(slug, () => {
      const es = getSoftwareArCase(slug, 'es')!;
      const en = getSoftwareArCase(slug, 'en')!;

      it('says the same category as its card in the viewcases block of /software', () => {
        const cardEs = viewcaseItems('es').find((v) => v.label === es.name);
        const cardEn = viewcaseItems('en').find((v) => v.label === es.name);
        expect(cardEs, `tarjeta ES de ${es.name}`).toBeDefined();
        expect(cardEn, `tarjeta EN de ${es.name}`).toBeDefined();

        expect(en.category).toBe(cardEn!.category);
        expect(es.category).toBe(cardEs!.category);
        for (const card of [cardEs!, cardEn!]) {
          expect(card.detail).toBe(`/desarrollo-de-software-argentina/${slug}`);
          expect(card.link).toBe(es.link);
          expect(card.poster).toBe(es.poster);
          expect(card.videoSrc).toBe(es.video);
        }
      });
    });
  }
});
