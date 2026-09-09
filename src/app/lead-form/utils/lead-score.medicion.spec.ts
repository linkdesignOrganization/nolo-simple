import { computeLeadScore, stripLeadContextPrefix } from './lead-score';
import { LeadPayload } from '../models/lead-payload.model';
import { BASE_PAYLOAD, buildVectorPayload } from './lead-score-vectors.shared';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BLOQUE 1.2 y 1.4 — De dónde saca la fórmula el mensaje y los tiempos
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * No se toca ni un peso ni un umbral: lo que cambia es de qué campo sale cada
 * dato. Estas pruebas fijan esa procedencia.
 *
 * Los mismos casos existen en el CRM (`web-lead.scoring.spec.ts`), porque el
 * puntaje se calcula en los dos lados sobre el mismo envío y tiene que dar
 * igual. Si algún día dejan de coincidir, la fórmula se separó.
 */

/** Payload neutro de la suite compartida (score 0), con los campos que la
 *  fórmula lee y los vectores no declaran. */
function pago(over: Partial<{ intent: object; session: object }> = {}): LeadPayload {
  const base = buildVectorPayload({
    name: 'base',
    over: {},
    expected: { score: 0, category: 'nurture' }
  }) as unknown as Record<string, Record<string, unknown>>;
  return {
    ...base,
    intent: { ...base['intent'], ...(over.intent ?? {}) },
    session: { ...base['session'], ...(over.session ?? {}) }
  } as unknown as LeadPayload;
}

function factores(p: LeadPayload): string[] {
  return computeLeadScore(p).breakdown.map((f) => f.factor);
}

/** El prefijo más largo que produce el sitio hoy: 105 caracteres él solo. */
const PREFIJO_DEMO =
  '[Consulta desde la página del sistema: Demo Vértice Seguridad Industrial (ERP comercial y de inventario)]';

describe('el mensaje que se puntúa es el que escribió la persona', () => {
  it('la línea de contexto del sitio no cuenta como mensaje', () => {
    expect(stripLeadContextPrefix(`${PREFIJO_DEMO}\n\nHola`)).toBe('Hola');
    expect(stripLeadContextPrefix(PREFIJO_DEMO)).toBe('');
    expect(stripLeadContextPrefix('[Lead from the industry page: Retail]\n\nHi')).toBe('Hi');
  });

  it('un mensaje normal no se toca', () => {
    expect(stripLeadContextPrefix('Necesito un sistema de inventario')).toBe(
      'Necesito un sistema de inventario'
    );
    expect(stripLeadContextPrefix(null)).toBe('');
  });

  it('unos corchetes en medio de la primera línea NO son contexto del sitio', () => {
    // El sitio siempre deja el prefijo solo en su línea. Esto lo escribió una persona.
    expect(stripLeadContextPrefix('[urgente] necesito ayuda')).toBe(
      '[urgente] necesito ayuda'
    );
  });

  it('el prefijo solo ya no cobra los +12 de «mensaje detallado»', () => {
    expect(PREFIJO_DEMO.length).toBeGreaterThan(100);
    expect(factores(pago({ intent: { message: PREFIJO_DEMO } }))).not.toContain(
      'mensaje_largo'
    );
  });

  it('un mensaje realmente largo los sigue cobrando, con prefijo o sin él', () => {
    const largo = 'a'.repeat(101);
    expect(factores(pago({ intent: { message: largo } }))).toContain('mensaje_largo');
    expect(
      factores(pago({ intent: { message: `${PREFIJO_DEMO}\n\n${largo}` } }))
    ).toContain('mensaje_largo');
  });

  /**
   * Bloque 2.4 bis. Desde la v1.6.0 el contexto viaja en `source.page_context` y
   * el mensaje llega limpio, así que el descuento no actúa sobre nada nuevo. La
   * función se conserva por los leads guardados, que SÍ llevan el prefijo
   * adentro y el CRM recalcula con esta misma fórmula. Este caso fija que las
   * dos formas del mismo mensaje —la de antes y la de ahora— dan el mismo
   * puntaje: sacar el prefijo del envío no le cambió el número a nadie.
   */
  it('el envío nuevo (sin prefijo) puntúa igual que el guardado (con prefijo)', () => {
    const escrito = 'Vimos la demo y nos sirve para la planta.';

    const nuevo = computeLeadScore(pago({ intent: { message: escrito } }));
    const historico = computeLeadScore(
      pago({ intent: { message: `${PREFIJO_DEMO}\n\n${escrito}` } })
    );

    expect(nuevo.score).toBe(historico.score);
    expect(nuevo.category).toBe(historico.category);
    expect(nuevo.breakdown).toEqual(historico.breakdown);
  });

  it('un sistema con nombre de mes ya no regala los +10 de plazos', () => {
    // Basta que alguien bautice un sistema «Mantenimiento mensual» para que
    // todos los leads de esa página cobren diez puntos que nadie pidió.
    const conMes = '[Consulta desde la página del sistema: Mantenimiento de marzo]';
    expect(factores(pago({ intent: { message: conMes } }))).not.toContain(
      'mensaje_menciona_tiempo_o_presupuesto'
    );
    // Y si lo escribe la persona, se sigue cobrando.
    expect(
      factores(pago({ intent: { message: `${conMes}\n\nLo necesito en marzo` } }))
    ).toContain('mensaje_menciona_tiempo_o_presupuesto');
  });
});

describe('los tiempos que puntúan son el activo y el de llenado real', () => {
  it('una pestaña olvidada media hora no cobra el bono de atención', () => {
    const f = factores(
      pago({
        session: { time_on_site_ms: 30 * 60_000, time_on_site_active_ms: 8_000 }
      })
    );
    expect(f).not.toContain('time_on_site_>2min');
    expect(f).toContain('time_on_site_<30s');
  });

  it('el tiempo activo largo sí lo cobra', () => {
    expect(
      factores(
        pago({
          session: { time_on_site_ms: 130_000, time_on_site_active_ms: 130_000 }
        })
      )
    ).toContain('time_on_site_>2min');
  });

  it('el llenado se mide desde el primer foco, no desde que cargó la página', () => {
    const f = factores(
      pago({
        session: {
          form_load_to_submit_ms: 600_000,
          form_first_interaction_to_submit_ms: 8_000
        }
      })
    );
    expect(f).toContain('form_llenado_<10s');
  });

  it('sin los campos nuevos se lee el reloj de pared, como antes', () => {
    // Payloads anteriores a la v1.1.0: el CRM los completa con 0 y no hay forma
    // de distinguir el cero de la ausencia. El respaldo mantiene su puntaje.
    expect(BASE_PAYLOAD.session).not.toHaveProperty('time_on_site_active_ms');
    expect(computeLeadScore(pago()).score).toBe(0);
  });
});
