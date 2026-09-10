import {
  SOFTWARE_AR_CASES,
  SOFTWARE_AR_CASES_EN,
  SOFTWARE_AR_CASE_LABELS,
  SOFTWARE_AR_CASE_LABELS_EN,
  SOFTWARE_AR_CASE_SLUGS,
  SoftwareArCase,
  getSoftwareArCase,
  getSoftwareArCaseForSystem,
  getSoftwareArCaseLabels,
  getSoftwareArCases
} from './software-ar-cases-content';

/**
 * Paridad ES/EN de las fichas de los demos (PLAN-FICHAS-NOLO.md, Ola 1 · A2): el inglés es una capa
 * sobre el español que conserva enlaces, media, cifras y los rótulos citados de los demos. Sin fugas
 * de español, con prueba de que el detector caza.
 *
 * El cruce de cada ficha con su tarjeta del bloque `viewcases` de app.routes.ts (categoría, detail,
 * link, poster y video) NO va acá: vive en components/viewcases-data.spec.ts, porque necesita el
 * campo `detail` del tipo `Viewcase`, que llega con la infraestructura del sitio (B3).
 */

// Regex de fuga del spec de Link Design, copiada tal cual (sin retipear).
const SPANISH_LEAK =
  /¿|ñ|[áéíóúÁÉÍÓÚ]|\b(de la|de los|para que|porque|también|desde|cada|sistemas?|empresas?|nosotros|contigo|puedes|tu|tus)\b/g;

// Nombres propios que el inglés conserva: se quitan antes de buscar fugas.
const PROPER_NAMES =
  /Vértice Seguridad Industrial|Nolõ|Estudio Dental Mendieta|Tornos del Sur|Punto Cero|Mercado Pago|Link Design/g;

// Campos que no son texto traducible: vienen del ES y quedan fuera del escaneo de fugas.
const INVARIANT_KEYS = new Set(['slug', 'system', 'poster', 'video', 'link']);

/** Quita las citas «…» (rótulos de los demos, en español a propósito) y los nombres propios. */
function stripAllowed(text: string): string {
  return text.replace(/«[^»]*»/g, '').replace(PROPER_NAMES, '');
}

/** Marcas de español que quedan en un texto inglés tras la limpieza. */
function leaks(text: string): string[] {
  return stripAllowed(text).match(SPANISH_LEAK) ?? [];
}

type Leaf = { path: string; value: string };

/** Todas las hojas string de un objeto, con su ruta (`pulso.inside[2]`) para leer el fallo. */
function stringLeaves(node: unknown, path: string, skip: ReadonlySet<string> = new Set()): Leaf[] {
  if (typeof node === 'string') return [{ path, value: node }];
  if (Array.isArray(node)) {
    return node.flatMap((item, i) => stringLeaves(item, `${path}[${i}]`, skip));
  }
  if (node && typeof node === 'object') {
    return Object.entries(node as Record<string, unknown>)
      .filter(([key]) => !skip.has(key))
      .flatMap(([key, value]) => stringLeaves(value, `${path}.${key}`, skip));
  }
  return [];
}

const digits = (text: string) => text.replace(/\D/g, '');
const quotes = (text: string) => text.match(/«[^»]*»/g) ?? [];

describe('SOFTWARE_AR_CASES (paridad ES/EN de las fichas)', () => {
  it('lists the six demos in the hub order and resolves them by language', () => {
    expect(SOFTWARE_AR_CASE_SLUGS).toEqual([
      'pulso',
      'cumbre',
      'estudio-dental-mendieta',
      'tornos-del-sur',
      'punto-cero',
      'vertice-seguridad-industrial'
    ]);
    expect(getSoftwareArCases('es')).toBe(SOFTWARE_AR_CASES);
    expect(getSoftwareArCases('en').map((c) => c.slug)).toEqual(SOFTWARE_AR_CASE_SLUGS);
    expect(Object.keys(SOFTWARE_AR_CASES_EN).sort()).toEqual([...SOFTWARE_AR_CASE_SLUGS].sort());

    expect(getSoftwareArCase('no-existe', 'en')).toBeNull();
    expect(getSoftwareArCase(null, 'en')).toBeNull();
  });

  for (const slug of SOFTWARE_AR_CASE_SLUGS) {
    describe(slug, () => {
      const es = getSoftwareArCase(slug, 'es')!;
      const en = getSoftwareArCase(slug, 'en')!;

      it('keeps slug, system, media, link and name from the Spanish source', () => {
        expect(en).not.toBe(es);
        expect(en.slug).toBe(es.slug);
        expect(en.system).toBe(es.system);
        expect(en.poster).toBe(es.poster);
        expect(en.video).toBe(es.video);
        expect(en.link).toBe(es.link);
        expect(en.name).toBe(es.name);
        // La capa EN se aplicó de verdad: el texto cambia.
        expect(en.category).not.toBe(es.category);
        expect(en.summary).not.toBe(es.summary);
      });

      it('keeps list lengths and the same figures', () => {
        expect(es.copied.length).toBeGreaterThan(0);
        expect(es.inside.length).toBeGreaterThan(0);
        expect(en.copied.length).toBe(es.copied.length);
        expect(en.inside.length).toBe(es.inside.length);

        expect(digits(en.range)).toBe(digits(es.range));
        expect(digits(en.timeline)).toBe(digits(es.timeline));
        expect(es.range).toMatch(/^USD \d{1,2}\.\d{3} a \d{1,2}\.\d{3}\*$/);
        expect(es.timeline).toMatch(/^\d+ a \d+ semanas\*$/);
        expect(en.range).toMatch(/^USD \d{1,2},\d{3} to \d{1,2},\d{3}\*$/);
        expect(en.timeline).toMatch(/^\d+ to \d+ weeks\*$/);
      });

      it('keeps every quoted demo label «…» verbatim in the same English item', () => {
        es.inside.forEach((item, i) => {
          for (const quote of quotes(item)) {
            expect(en.inside[i], `${slug}.inside[${i}]`).toContain(quote);
          }
        });
        // Y el inglés no inventa ni pierde citas: las mismas, ítem por ítem.
        expect(en.inside.map(quotes)).toEqual(es.inside.map(quotes));
        const allQuotes = (c: SoftwareArCase) =>
          stringLeaves(c, slug, INVARIANT_KEYS)
            .flatMap((leaf) => quotes(leaf.value))
            .sort();
        expect(allQuotes(en)).toEqual(allQuotes(es));
      });
    });
  }

  it('finds the demo of a system type page by language', () => {
    const crmEn = getSoftwareArCaseForSystem('crm-a-medida', 'en');
    const crmEs = getSoftwareArCaseForSystem('crm-a-medida', 'es');
    expect(crmEn?.name).toBe('Vértice Seguridad Industrial');
    expect(crmEn?.category).toBe('Commercial & inventory ERP');
    expect(crmEs?.name).toBe('Vértice Seguridad Industrial');
    expect(getSoftwareArCaseForSystem('dashboards-y-reporting', 'en')?.slug).toBe('pulso');
    expect(getSoftwareArCaseForSystem('no-existe', 'en')).toBeNull();
    expect(getSoftwareArCaseForSystem(null, 'en')).toBeNull();
  });

  it('keeps the same label keys and adds only the demo-language note in English', () => {
    expect(Object.keys(SOFTWARE_AR_CASE_LABELS_EN).sort()).toEqual(
      Object.keys(SOFTWARE_AR_CASE_LABELS).sort()
    );
    expect(getSoftwareArCaseLabels('en')).toBe(SOFTWARE_AR_CASE_LABELS_EN);
    expect(getSoftwareArCaseLabels('es')).toBe(SOFTWARE_AR_CASE_LABELS);
    // La única afirmación que el EN agrega sobre el ES.
    expect(SOFTWARE_AR_CASE_LABELS_EN.confidentiality).toMatch(
      /The demos are in Spanish, with sample data\.$/
    );
    expect(SOFTWARE_AR_CASE_LABELS.confidentiality).not.toMatch(/español/);
  });

  it('has no Spanish leaks in the English copy', () => {
    const leaves = [
      ...getSoftwareArCases('en').flatMap((c) => stringLeaves(c, c.slug, INVARIANT_KEYS)),
      ...stringLeaves(SOFTWARE_AR_CASE_LABELS_EN, 'SOFTWARE_AR_CASE_LABELS_EN')
    ];
    // El recorrido de verdad visita el copy (6 fichas + 19 rótulos: 136 cadenas).
    expect(leaves.length).toBeGreaterThan(100);

    const found = leaves
      .filter((leaf) => leaks(leaf.value).length > 0)
      .map((leaf) => `${leaf.path}: ${leaks(leaf.value).join(', ')}`);
    expect(found).toEqual([]);
  });

  it('proves the leak detector catches a planted Spanish sentence', () => {
    expect(leaks('¿Prueba para que la vea?')).toEqual(['¿', 'para que']);
    // La limpieza ignora las citas «…» y los nombres propios, pero no el texto suelto.
    expect(
      leaks('Members at churn risk («Socios en zona roja») at Estudio Dental Mendieta')
    ).toEqual([]);
    expect(leaks('Members at churn risk (Socios en zona roja)')).toEqual([]);
    expect(leaks('Members at churn risk (Socios en zona roja) para que la vea')).toEqual([
      'para que'
    ]);
  });

  it('uses no em dashes in either language', () => {
    const leaves = [
      ...SOFTWARE_AR_CASES.flatMap((c) => stringLeaves(c, `es.${c.slug}`)),
      ...getSoftwareArCases('en').flatMap((c) => stringLeaves(c, `en.${c.slug}`)),
      ...stringLeaves(SOFTWARE_AR_CASE_LABELS, 'SOFTWARE_AR_CASE_LABELS'),
      ...stringLeaves(SOFTWARE_AR_CASE_LABELS_EN, 'SOFTWARE_AR_CASE_LABELS_EN')
    ];
    expect(leaves.filter((leaf) => leaf.value.includes('—')).map((leaf) => leaf.path)).toEqual([]);
  });
});
