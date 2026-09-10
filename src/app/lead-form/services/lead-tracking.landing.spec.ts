import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { Route, Routes } from '@angular/router';
import { Subject } from 'rxjs';

import { routes } from '../../app.routes';
import { ContactFooterComponent } from '../../components/contact-footer.component';
import { LanguageService } from '../../services/language.service';
import { SYSTEM_SLUGS } from '../../pages/systems-content';
import { INDUSTRY_SLUGS } from '../../pages/industries-content';
import { SOFTWARE_AR_CASE_SLUGS } from '../../pages/software-ar-cases-content';
import { SourceLanding } from '../models/lead-form-options';
import { ClickTrackingService } from './click-tracking.service';
import { LeadTrackingService } from './lead-tracking.service';
import { SectionTrackingService } from './section-tracking.service';
import { TimelineService } from './timeline.service';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BLOQUE 0.1 — La prueba que habría gritado en junio
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `detectLanding()` decide con qué etiqueta de origen entra cada lead al CRM, y
 * esa etiqueta suma o resta puntos (`landing_software` +10, `landing_corporate`
 * +5). La función se adaptó el 2026-06-07 a las cuatro páginas que existían ese
 * día y NADIE volvió a tocarla mientras el sitio crecía: llegaron el detalle por
 * sistema, las industrias, el hub de software de Argentina con sus fichas y,
 * sobre todo, el árbol completo en inglés bajo `/en`.
 *
 * Esta prueba NO trae una lista de rutas escrita a mano: recorre el árbol REAL
 * de `app.routes.ts`, detecta cuáles páginas montan el formulario (buscando
 * `ContactFooterComponent` en el grafo de dependencias del componente de la
 * página) y exige una expectativa declarada para cada una. Abrir una página
 * nueva con formulario y no clasificarla rompe esta prueba sola — que es
 * exactamente lo que no pasó siete veces.
 *
 * Expectativas: sección (d) de AUDITORIA-CALIFICACION-LEADS.md.
 */

// ──────────────────────────────────────────────────────────────────────────
// Expectativas por ruta de contenido (sin el prefijo de idioma)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Marcador para una ruta cuyo origen todavía no tiene valor decidido: lo único
 * exigible es que la página se reconozca por una regla explícita, es decir que
 * NO se clasifique igual que una URL inexistente.
 *
 * Hoy no lo usa ninguna ruta. Lo usaban las industrias mientras el vocabulario
 * estaba sin decidir; el bloque 2 les dio el valor `industries` y acá quedó el
 * marcador por el valor, tal como se dejó previsto. Se conserva para la próxima
 * página que nazca antes que su decisión.
 */
const RECONOCIDA = Symbol('debe reconocerse por una regla explícita');

type Expectativa = SourceLanding | typeof RECONOCIDA;

/** Ruta de contenido (tal como está escrita en `app.routes.ts`) → origen esperado. */
const ESPERADO: Record<string, Expectativa> = {
  'software': 'software',
  'software/:slug': 'software',
  'web': 'web',
  'contacto': 'contact',
  'industrias': 'industries',
  'industrias/:slug': 'industries',
  'desarrollo-de-software-argentina': 'software',
  'desarrollo-de-software-argentina/:slug': 'software'
};

/** Slug real de ejemplo para cada ruta paramétrica del árbol. */
const SLUG_DE_EJEMPLO: Record<string, string> = {
  'software/:slug': SYSTEM_SLUGS[0],
  'industrias/:slug': INDUSTRY_SLUGS[0],
  'desarrollo-de-software-argentina/:slug': SOFTWARE_AR_CASE_SLUGS[0]
};

/** URL que no corresponde a ninguna ruta: revela qué devuelve el cajón por defecto. */
const URL_INEXISTENTE = '/__esta-pagina-no-existe__/xyz';

// ──────────────────────────────────────────────────────────────────────────
// Descubrimiento de rutas desde el árbol real
// ──────────────────────────────────────────────────────────────────────────

interface RutaDescubierta {
  /** URL completa con la que navega el visitante, ya con el slug de ejemplo. */
  url: string;
  /** Ruta de contenido sin prefijo de idioma, tal como aparece en app.routes.ts. */
  contenido: string;
  lang: 'es' | 'en';
  conFormulario: boolean;
}

/** ¿El grafo de dependencias del componente monta el pie con formulario? */
function montaElFormulario(componente: unknown, vistos = new Set<unknown>()): boolean {
  if (!componente || vistos.has(componente)) return false;
  if (componente === ContactFooterComponent) return true;
  vistos.add(componente);

  const def = (componente as { ɵcmp?: { dependencies?: unknown } }).ɵcmp;
  if (!def) return false;
  let deps = def.dependencies;
  if (typeof deps === 'function') deps = (deps as () => unknown[])();
  if (!Array.isArray(deps)) return false;

  return deps.some((d) => montaElFormulario(d, vistos));
}

/**
 * Recorre el árbol real. Devuelve una entrada por ruta navegable, marcando si
 * lleva formulario. No conoce ninguna ruta de memoria: todo sale de `routes`.
 */
async function descubrirRutas(): Promise<RutaDescubierta[]> {
  const encontradas: RutaDescubierta[] = [];

  const recorrer = async (
    rutas: Routes,
    prefijoUrl: string,
    prefijoContenido: string,
    lang: 'es' | 'en'
  ): Promise<void> => {
    for (const ruta of rutas as Route[]) {
      const idioma = (ruta.data?.['lang'] as 'es' | 'en' | undefined) ?? lang;
      const segmento = ruta.path ?? '';

      // El catch-all y los redirects no son páginas.
      if (segmento === '**' || ruta.redirectTo) continue;

      const url = segmento ? `${prefijoUrl}/${segmento}` : prefijoUrl || '/';
      // El envoltorio de idioma (`{ path: 'en', data: { lang } }`) aporta segmento
      // a la URL pero NO a la ruta de contenido: `/en/software` y `/software` son
      // la misma página.
      const envoltorioDeIdioma = ruta.data?.['lang'] !== undefined;
      const contenido =
        segmento && !envoltorioDeIdioma
          ? [prefijoContenido, segmento].filter(Boolean).join('/')
          : prefijoContenido;

      if (ruta.children) {
        await recorrer(ruta.children, segmento ? url : prefijoUrl, contenido, idioma);
        continue;
      }
      if (!ruta.loadComponent && !ruta.component) continue;

      const componente = ruta.loadComponent
        ? await ruta.loadComponent()
        : ruta.component;

      // Las landings comparten componente: el formulario existe solo si la data
      // del idioma trae bloque de contacto (la home no lo trae).
      const data = ruta.data as Record<string, { contact?: unknown }> | undefined;
      const esLanding = !!(data && (data['es'] || data['en']));
      const conFormulario =
        montaElFormulario(componente) &&
        (!esLanding || !!data?.[idioma]?.contact);

      encontradas.push({ url, contenido, lang: idioma, conFormulario });
    }
  };

  await recorrer(routes, '', '', 'es');
  return encontradas;
}

/** Sustituye `:slug` por un slug real; falla si la ruta nueva no declaró uno. */
function urlConcreta(ruta: RutaDescubierta): string {
  if (!ruta.url.includes(':')) return ruta.url;
  const slug = SLUG_DE_EJEMPLO[ruta.contenido];
  if (!slug) {
    throw new Error(
      `La ruta paramétrica "${ruta.contenido}" no tiene slug de ejemplo declarado en SLUG_DE_EJEMPLO.`
    );
  }
  return ruta.url.replace(/:[^/]+/, slug);
}

// ──────────────────────────────────────────────────────────────────────────
// El clasificador real, con el pathname bajo control
// ──────────────────────────────────────────────────────────────────────────

/**
 * Instancia el LeadTrackingService REAL con un documento cuyo pathname podemos
 * mover. Router, idioma y los tres trackers van como dobles: `detectLanding()`
 * solo lee `document.location.pathname`.
 */
function crearClasificador(): (pathname: string) => SourceLanding {
  const location = { pathname: '/', href: 'https://nolo.ar/', search: '', hostname: 'nolo.ar' };
  const documento = {
    location,
    referrer: '',
    visibilityState: 'visible',
    addEventListener: () => undefined
  } as unknown as Document;

  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: documento },
      { provide: Router, useValue: { events: new Subject<never>() } },
      { provide: LanguageService, useValue: { lang: () => 'es' } },
      { provide: SectionTrackingService, useValue: { getSnapshot: () => [] } },
      { provide: ClickTrackingService, useValue: { getSnapshot: () => [] } },
      { provide: TimelineService, useValue: { log: () => undefined, getSnapshot: () => [] } }
    ]
  });

  const servicio = TestBed.inject(LeadTrackingService);
  return (pathname: string) => {
    location.pathname = pathname;
    return servicio.detectLanding();
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Las pruebas
// ──────────────────────────────────────────────────────────────────────────

describe('detectLanding() — todas las rutas con formulario del árbol real', () => {
  let descubiertas: RutaDescubierta[];
  let conFormulario: RutaDescubierta[];
  let clasificar: (pathname: string) => SourceLanding;

  beforeAll(async () => {
    descubiertas = await descubrirRutas();
    conFormulario = descubiertas.filter((r) => r.conFormulario);
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    clasificar = crearClasificador();
  });

  it('el árbol real trae páginas con formulario en los dos idiomas', () => {
    expect(conFormulario.length).toBeGreaterThan(0);
    expect(conFormulario.some((r) => r.lang === 'es')).toBe(true);
    expect(conFormulario.some((r) => r.lang === 'en')).toBe(true);
  });

  /**
   * El guardia del inventario: si mañana se abre una página con formulario y
   * nadie declara qué origen le corresponde, esta prueba se pone roja sola.
   */
  it('toda página con formulario tiene una expectativa de origen declarada', () => {
    const sinDeclarar = conFormulario
      .map((r) => r.contenido)
      .filter((c) => !(c in ESPERADO));

    expect([...new Set(sinDeclarar)]).toEqual([]);
  });

  it('ninguna expectativa declarada sobra (todas apuntan a una ruta viva)', () => {
    const vivas = new Set(conFormulario.map((r) => r.contenido));
    const sobrantes = Object.keys(ESPERADO).filter((c) => !vivas.has(c));

    expect(sobrantes).toEqual([]);
  });

  /**
   * Una prueba por ruta con formulario. Ver la tabla de la sección (d) de la
   * auditoría: hoy solo cuatro rutas en español se clasifican bien.
   */
  describe('cada ruta se clasifica como corresponde', () => {
    // El árbol se descubre de forma asíncrona, así que las rutas concretas se
    // resuelven dentro de cada prueba a partir del descubrimiento compartido.
    for (const contenido of Object.keys(ESPERADO)) {
      for (const lang of ['es', 'en'] as const) {
        const esperado = ESPERADO[contenido];
        const etiqueta =
          esperado === RECONOCIDA
            ? 'se reconoce por una regla explícita'
            : `→ ${esperado}`;

        it(`[${lang}] ${contenido || '/'} ${etiqueta}`, () => {
          const ruta = conFormulario.find(
            (r) => r.contenido === contenido && r.lang === lang
          );
          expect(ruta, `la ruta ${lang}:${contenido} no existe en el árbol`).toBeDefined();

          const url = urlConcreta(ruta!);
          const obtenido = clasificar(url);

          if (esperado === RECONOCIDA) {
            // Indistinguible de una URL inexistente = cayó en el cajón por defecto.
            expect(
              obtenido,
              `${url} se clasifica igual que una URL inexistente: es el cajón por defecto, no una clasificación`
            ).not.toBe(clasificar(URL_INEXISTENTE));
          } else {
            expect(obtenido, `${url} se clasificó como "${obtenido}"`).toBe(esperado);
          }
        });
      }
    }
  });

  /**
   * La prueba que habría cazado el acierto por casualidad de `/en/web`: el
   * valor es el correcto, pero lo devuelve el `return` final, no una regla. Un
   * origen que también es el destino de las URLs inexistentes no distingue
   * nada. Se resuelve en el bloque 2, cuando el brazo web tenga nombre propio.
   */
  it('ninguna página con formulario comparte etiqueta con una URL inexistente', () => {
    const cajon = clasificar(URL_INEXISTENTE);
    const indistinguibles = conFormulario
      .map((r) => ({ url: urlConcreta(r), landing: clasificar(urlConcreta(r)) }))
      .filter((r) => r.landing === cajon)
      .map((r) => `${r.url} → ${r.landing}`);

    expect(indistinguibles).toEqual([]);
  });

  /**
   * El prefijo de idioma es una decisión de presentación, no de intención
   * comercial: la misma página vale lo mismo en español y en inglés.
   */
  it('la clasificación no depende del prefijo de idioma', () => {
    const discrepancias: string[] = [];
    for (const contenido of new Set(conFormulario.map((r) => r.contenido))) {
      const es = conFormulario.find((r) => r.contenido === contenido && r.lang === 'es');
      const en = conFormulario.find((r) => r.contenido === contenido && r.lang === 'en');
      if (!es || !en) continue;
      const a = clasificar(urlConcreta(es));
      const b = clasificar(urlConcreta(en));
      if (a !== b) discrepancias.push(`${contenido}: es=${a} en=${b}`);
    }

    expect(discrepancias).toEqual([]);
  });
});
