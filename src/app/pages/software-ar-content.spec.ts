import {
  SOFTWARE_AR,
  SOFTWARE_AR_EN,
  SOFTWARE_AR_LABELS,
  SOFTWARE_AR_LABELS_EN,
  SoftwareArContent,
  SoftwareArLink,
  getSoftwareArContent,
  getSoftwareArLabels,
  getSoftwareArPriceForSystem
} from './software-ar-content';

/**
 * Paridad ES/EN del hub «Desarrollo de software a medida en Argentina» (PLAN-FICHAS-NOLO.md,
 * contrato de la Ola 1): misma forma, mismos largos, mismos invariantes y mismas cifras; y el
 * inglés sin fugas de español, con la prueba de que el detector caza.
 */

// Regex de fuga del hub de Costa Rica, copiada tal cual (sin retipear).
const SPANISH_LEAK =
  /¿|ñ|[áéíóúÁÉÍÓÚ]|\b(de la|de los|para que|porque|también|desde|cada|sistemas?|empresas?|nosotros|contigo|puedes|tu|tus)\b/g;

// Nombres propios que el inglés conserva: se quitan antes de buscar fugas. Sin los de Costa Rica
// («Costa Rica», «San José», «Link Design»): ya no aparecen en este hub y dejarlos ablandaba el
// detector, porque «San José» lleva tilde.
const PROPER_NAMES =
  /Vértice Seguridad Industrial|Nolõ|Buenos Aires|Estudio Dental Mendieta|Tornos del Sur|Punto Cero|Mercado Pago|Argentina/g;

// Claves que no son texto (enlaces, identificadores): fuera del escaneo de fugas.
const NON_TEXT_KEYS = new Set(['href', 'system', 'icon']);

/** Quita las citas «…» (rótulos de los demos, en español a propósito) y los nombres propios. */
function stripAllowed(text: string): string {
  return text.replace(/«[^»]*»/g, '').replace(PROPER_NAMES, '');
}

/** Marcas de español que quedan en un texto inglés tras la limpieza. */
function leaks(text: string): string[] {
  return stripAllowed(text).match(SPANISH_LEAK) ?? [];
}

type Leaf = { path: string; value: string };

/** Todas las hojas string de un objeto, con su ruta (`faq[2].answer`) para que el fallo se lea. */
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

/** Estructura de un objeto (claves ordenadas y largos de listas), sin los textos. */
function shape(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(shape);
  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, shape(record[key])])
    );
  }
  return typeof node;
}

const digits = (text: string) => text.replace(/\D/g, '');

/** `href` de los trozos con enlace de cada párrafo de «Quiénes somos». */
function paragraphLinks(content: SoftwareArContent): SoftwareArLink[][] {
  return content.about.paragraphs.map((paragraph) =>
    typeof paragraph === 'string'
      ? []
      : paragraph.filter((part): part is SoftwareArLink => typeof part !== 'string')
  );
}

const LISTS: ReadonlyArray<[string, (c: SoftwareArContent) => ReadonlyArray<unknown>]> = [
  ['hero.stats', (c) => c.hero.stats],
  ['forWhom.fits', (c) => c.forWhom.fits],
  ['how.statement', (c) => c.how.statement],
  ['how.examples', (c) => c.how.examples],
  ['how.closing', (c) => c.how.closing],
  ['systems.integrations', (c) => c.systems.integrations],
  ['pricing.columns', (c) => c.pricing.columns],
  ['pricing.rows', (c) => c.pricing.rows],
  ['pricing.factors', (c) => c.pricing.factors],
  ['process.stages', (c) => c.process.stages],
  ['included.items', (c) => c.included.items],
  ['choose.items', (c) => c.choose.items],
  ['about.paragraphs', (c) => c.about.paragraphs],
  ['faq', (c) => c.faq]
];

describe('SOFTWARE_AR (paridad ES/EN del hub)', () => {
  it('keeps every list the same length in both languages', () => {
    for (const [name, pick] of LISTS) {
      expect(pick(SOFTWARE_AR).length, name).toBeGreaterThan(0);
      expect(pick(SOFTWARE_AR_EN).length, name).toBe(pick(SOFTWARE_AR).length);
    }
  });

  it('keeps the same keys and nesting in both languages', () => {
    expect(shape(SOFTWARE_AR_EN)).toEqual(shape(SOFTWARE_AR));
    expect(Object.keys(SOFTWARE_AR_LABELS_EN).sort()).toEqual(
      Object.keys(SOFTWARE_AR_LABELS).sort()
    );
  });

  it('copies the invariant fields verbatim: system, icon, order and the about links', () => {
    expect(SOFTWARE_AR_EN.pricing.rows.map((r) => r.system)).toEqual(
      SOFTWARE_AR.pricing.rows.map((r) => r.system)
    );
    expect(SOFTWARE_AR_EN.systems.integrations.map((i) => i.icon)).toEqual(
      SOFTWARE_AR.systems.integrations.map((i) => i.icon)
    );
    expect(SOFTWARE_AR_EN.process.stages.map((s) => s.order)).toEqual(
      SOFTWARE_AR.process.stages.map((s) => s.order)
    );

    // Nolõ es una empresa argentina con sede en Buenos Aires (decisión de Robert, 9 sep 2026), así
    // que «Quiénes somos» habla de sí misma y no enlaza a ningún estudio de afuera. El tipo admite
    // párrafos por trozos con enlace, pero hoy ninguno lo usa: si vuelve uno, tiene que ser en los
    // dos idiomas.
    const linksEs = paragraphLinks(SOFTWARE_AR);
    const linksEn = paragraphLinks(SOFTWARE_AR_EN);
    expect(linksEs.flat().map((l) => l.href)).toEqual([]);
    const hrefs = (links: SoftwareArLink[][]) => links.map((p) => p.map((l) => l.href));
    const texts = (links: SoftwareArLink[][]) => links.map((p) => p.map((l) => l.text));
    expect(hrefs(linksEn)).toEqual(hrefs(linksEs));
    expect(texts(linksEn)).toEqual(texts(linksEs));
  });

  it('presents Nolõ as an Argentine company, with no inherited studio, country or figures', () => {
    // Decisión de Robert, 9 sep 2026: Nolõ es una empresa propia argentina con sede en Buenos
    // Aires. El hub no nombra al estudio gemelo ni a su país, y no publica «desde 2020» ni los
    // «26 proyectos», que son cifras del otro sitio y acá se leerían como argentinas.
    const INHERITED = /Link Design|linkdesign|Costa Rica|San José|\b2020\b|\b26\b/gi;
    const leaves = [
      ...stringLeaves(SOFTWARE_AR, 'SOFTWARE_AR'),
      ...stringLeaves(SOFTWARE_AR_EN, 'SOFTWARE_AR_EN'),
      ...stringLeaves(SOFTWARE_AR_LABELS, 'SOFTWARE_AR_LABELS'),
      ...stringLeaves(SOFTWARE_AR_LABELS_EN, 'SOFTWARE_AR_LABELS_EN')
    ];
    const found = leaves
      .filter((leaf) => (leaf.value.match(INHERITED) ?? []).length > 0)
      .map((leaf) => `${leaf.path}: ${(leaf.value.match(INHERITED) ?? []).join(', ')}`);
    expect(found).toEqual([]);
    // El detector caza de verdad la frase que se quitó.
    expect('Desde 2020 llevamos 26 proyectos'.match(INHERITED)).toEqual(['2020', '26']);

    // Sede propia declarada en «Quiénes somos», en los dos idiomas.
    expect(String(SOFTWARE_AR.about.paragraphs[0])).toContain('Buenos Aires');
    expect(String(SOFTWARE_AR_EN.about.paragraphs[0])).toContain('Buenos Aires');
  });

  it('keeps the same figures in ranges, timelines, stats and durations', () => {
    const rowsEs = SOFTWARE_AR.pricing.rows;
    const rowsEn = SOFTWARE_AR_EN.pricing.rows;
    expect(rowsEn.map((r) => digits(r.range))).toEqual(rowsEs.map((r) => digits(r.range)));
    expect(rowsEn.map((r) => digits(r.timeline))).toEqual(rowsEs.map((r) => digits(r.timeline)));
    expect(SOFTWARE_AR_EN.hero.stats.map((s) => digits(s.value))).toEqual(
      SOFTWARE_AR.hero.stats.map((s) => digits(s.value))
    );
    expect(SOFTWARE_AR_EN.process.stages.map((s) => digits(s.duration))).toEqual(
      SOFTWARE_AR.process.stages.map((s) => digits(s.duration))
    );
    expect(digits(SOFTWARE_AR_EN.hero.updated)).toBe(digits(SOFTWARE_AR.hero.updated));

    // El asterisco sigue pegado al número y cada idioma usa su formato.
    for (const row of rowsEs) {
      expect(row.range).toMatch(/^\d{1,2}\.\d{3} a \d{1,2}\.\d{3}( o más)?\*$/);
      expect(row.timeline).toMatch(/^\d+ a \d+ (semanas|meses)\*$/);
    }
    for (const row of rowsEn) {
      expect(row.range).toMatch(/^\d{1,2},\d{3} to \d{1,2},\d{3}( or more)?\*$/);
      expect(row.timeline).toMatch(/^\d+ to \d+ (weeks|months)\*$/);
    }
    expect(SOFTWARE_AR_EN.pricing.columns).toEqual([
      'System type',
      'Investment (USD)*',
      'Typical timeline*'
    ]);

    // Los rangos y los plazos son los mismos que publica el hub de Costa Rica (decisión de
    // Robert, 9 sep 2026): ninguna cifra nueva.
    expect(rowsEs.map((r) => `${r.range} / ${r.timeline}`)).toEqual([
      '1.500 a 4.000* / 4 a 6 semanas*',
      '2.600 a 8.000* / 6 a 10 semanas*',
      '1.600 a 3.500* / 6 a 10 semanas*',
      '4.000 a 9.000* / 8 a 12 semanas*',
      '2.800 a 6.000* / 8 a 12 semanas*',
      '4.500 a 8.000* / 10 a 14 semanas*',
      '2.000 a 5.000* / 4 a 10 semanas*',
      '9.000 a 15.000 o más* / 3 a 5 meses*'
    ]);

    // Contacto de Nolõ, idéntico en los dos idiomas (mismos datos que el footer del sitio).
    for (const content of [SOFTWARE_AR, SOFTWARE_AR_EN]) {
      expect(content.about.contact).toContain('hola@nolo.ar');
      expect(content.about.contact).toContain('+54 9 11 3333-7180');
    }
  });

  it('has no Spanish leaks in the English copy', () => {
    const leaves = [
      ...stringLeaves(SOFTWARE_AR_EN, 'SOFTWARE_AR_EN', NON_TEXT_KEYS),
      ...stringLeaves(SOFTWARE_AR_LABELS_EN, 'SOFTWARE_AR_LABELS_EN')
    ];
    // El recorrido de verdad visita el copy (153 cadenas traducidas + 13 rótulos).
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
      leaks('The dashboard («Panel de operación») for Vértice Seguridad Industrial')
    ).toEqual([]);
    expect(leaks('The dashboard (Panel de operación) for the chain')).toEqual(['ó']);
  });

  it('uses no em dashes in either language', () => {
    const leaves = [
      ...stringLeaves(SOFTWARE_AR, 'SOFTWARE_AR'),
      ...stringLeaves(SOFTWARE_AR_EN, 'SOFTWARE_AR_EN'),
      ...stringLeaves(SOFTWARE_AR_LABELS, 'SOFTWARE_AR_LABELS'),
      ...stringLeaves(SOFTWARE_AR_LABELS_EN, 'SOFTWARE_AR_LABELS_EN')
    ];
    expect(leaves.filter((leaf) => leaf.value.includes('—')).map((leaf) => leaf.path)).toEqual([]);
  });

  it('writes the Spanish copy in Argentine voseo, with no leftover tuteo', () => {
    const TUTEO =
      /\b(puedes|tienes|quieres|necesitas|debes|prefieres|decides|buscas|reconoces|escríbenos|revisa|pregunta|confirma|desconfía|entra a|contigo|tú)\b/gi;
    const leaves = [
      ...stringLeaves(SOFTWARE_AR, 'SOFTWARE_AR'),
      ...stringLeaves(SOFTWARE_AR_LABELS, 'SOFTWARE_AR_LABELS')
    ];
    const found = leaves
      .filter((leaf) => (leaf.value.match(TUTEO) ?? []).length > 0)
      .map((leaf) => `${leaf.path}: ${(leaf.value.match(TUTEO) ?? []).join(', ')}`);
    expect(found).toEqual([]);
    // El detector de tuteo caza de verdad.
    expect('Si tienes dudas, escríbenos'.match(TUTEO)).toEqual(['tienes', 'escríbenos']);
  });

  it('resolves content, labels and price rows by language', () => {
    expect(getSoftwareArContent('en')).toBe(SOFTWARE_AR_EN);
    expect(getSoftwareArContent('es')).toBe(SOFTWARE_AR);
    expect(getSoftwareArLabels('en')).toBe(SOFTWARE_AR_LABELS_EN);
    expect(getSoftwareArLabels('es')).toBe(SOFTWARE_AR_LABELS);

    expect(getSoftwareArPriceForSystem('crm-a-medida', 'en')?.range).toContain('2,600 to 8,000');
    expect(getSoftwareArPriceForSystem('crm-a-medida', 'en')?.type).toBe('Custom CRM');
    expect(getSoftwareArPriceForSystem('crm-a-medida', 'es')?.range).toContain('2.600 a 8.000');
    expect(getSoftwareArPriceForSystem('no-existe', 'en')).toBeNull();
    expect(getSoftwareArPriceForSystem(null, 'en')).toBeNull();
  });
});
