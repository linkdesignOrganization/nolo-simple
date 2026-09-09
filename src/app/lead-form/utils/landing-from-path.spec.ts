import {
  LANDING_BY_PATH_SEGMENT,
  LANGUAGE_PATH_PREFIXES
} from '../models/lead-form-options';
import { landingFromPath } from './landing-from-path';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BLOQUE 2.4 — Las propiedades de la clasificación, no una lista de rutas
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `lead-tracking.landing.spec.ts` recorre el árbol REAL de rutas y verifica
 * página por página. Esta prueba es la otra mitad: no conoce ninguna ruta, se
 * las pide a `LANDING_BY_PATH_SEGMENT` y fija las propiedades que hacen que la
 * clasificación no vuelva a envejecer.
 *
 * Escritas como propiedades a propósito: una lista de rutas a mano es
 * exactamente lo que se quedó viejo entre junio y septiembre de 2026.
 */
describe('landingFromPath — la clasificación de la página de origen', () => {
  describe('cada sección declarada', () => {
    for (const seccion of Object.keys(LANDING_BY_PATH_SEGMENT)) {
      const esperado = LANDING_BY_PATH_SEGMENT[seccion];

      it(`/${seccion} → ${esperado}, en los dos idiomas y con lo que cuelgue debajo`, () => {
        expect(landingFromPath(`/${seccion}`)).toBe(esperado);
        expect(landingFromPath(`/${seccion}/`)).toBe(esperado);
        // Una página nueva que nazca debajo se clasifica sola: es lo que no
        // pasaba con las fichas de sistema ni con las de industria.
        expect(landingFromPath(`/${seccion}/una-pagina-que-aun-no-existe`)).toBe(
          esperado
        );
        for (const prefijo of LANGUAGE_PATH_PREFIXES) {
          expect(landingFromPath(`/${prefijo}/${seccion}`)).toBe(esperado);
          expect(
            landingFromPath(`/${prefijo}/${seccion}/una-pagina-que-aun-no-existe`)
          ).toBe(esperado);
        }
      });
    }
  });

  it('la portada no es ningún brazo del negocio, en ningún idioma', () => {
    expect(landingFromPath('/')).toBe('other');
    for (const prefijo of LANGUAGE_PATH_PREFIXES) {
      expect(landingFromPath(`/${prefijo}`)).toBe('other');
      expect(landingFromPath(`/${prefijo}/`)).toBe('other');
    }
  });

  it('el cajón por defecto es inerte: ninguna sección real comparte su etiqueta', () => {
    expect(landingFromPath('/__esta-pagina-no-existe__/xyz')).toBe('other');
    expect(Object.values(LANDING_BY_PATH_SEGMENT)).not.toContain('other');
  });

  it('compara segmentos enteros, no prefijos de texto', () => {
    // La versión anterior usaba `path.startsWith('/web')`, así que cualquier
    // ruta que empezara con esas letras entraba al brazo web.
    expect(landingFromPath('/webinars')).toBe('other');
    expect(landingFromPath('/softwarehouse')).toBe('other');
  });

  it('ignora query string, hash, mayúsculas y la barra final', () => {
    expect(landingFromPath('/Software/?utm_source=x#hablemos')).toBe('software');
  });

  it('un path vacío o ausente no rompe', () => {
    expect(landingFromPath('')).toBe('other');
    expect(landingFromPath(null)).toBe('other');
    expect(landingFromPath(undefined)).toBe('other');
  });
});
