import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { environment } from '../../../environments/environment';
import { ContactFooterComponent, ContactInfo } from '../../components/contact-footer.component';
import { SYSTEMS_CONTENT, SYSTEM_SLUGS } from '../../pages/systems-content';
import { LeadPayload } from '../models/lead-payload.model';
import { computeLeadScore } from '../utils/lead-score';
import { LeadTrackingService } from './lead-tracking.service';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BLOQUE 0.2 — El envío tal como lo arma el formulario
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * La suite de vectores compartida protege la FÓRMULA con payloads escritos a
 * mano: empieza donde termina el problema. Estas pruebas hacen lo contrario —
 * no tocan la fórmula: montan el pie de página REAL, lo llenan como una
 * persona, lo envían, e interceptan el POST al CRM para mirar exactamente el
 * JSON que sale del navegador.
 *
 * Se verifican los tres datos que la auditoría encontró mal medidos:
 *   · el contador de páginas contra el recorrido que él mismo adjunta (nota E),
 *   · el mensaje, que viaja con el texto que antepone el sitio (nota B),
 *   · los tiempos, medidos con el reloj de pared en vez de con el tiempo activo
 *     y el tiempo desde la primera interacción, que ya viajan sin usarse
 *     (notas D y G).
 *
 * Ninguna de las tres toca `lead-score.ts` ni el servicio: solo miran el envío.
 */

const CRM_DE_PRUEBA = 'https://crm.example.test/api/v1/leads';

const info: ContactInfo = {
  email: 'hola@test.com',
  location: 'Buenos Aires, Argentina',
  whatsappLink: '#',
  calendarLink: '#'
};

/** Ruta muda: el contador de páginas necesita navegaciones reales del Router. */
@Component({ standalone: true, template: '' })
class PaginaMuda {}

/** El nombre de sistema más largo del contenido real: es el peor prefijo posible. */
const SISTEMA_MAS_LARGO = SYSTEM_SLUGS.map((slug) => ({
  slug,
  name: SYSTEMS_CONTENT[slug].es.name
})).sort((a, b) => b.name.length - a.name.length)[0];

/** Lo que escribe la persona: deliberadamente corto (no es un «mensaje detallado»). */
const MENSAJE_DE_LA_PERSONA = 'Vimos la demo y nos sirve para la planta.';

let ahora = 0;

function crearPie(systemContext: { name: string; slug: string } | null = null) {
  const fixture = TestBed.createComponent(ContactFooterComponent);
  fixture.componentRef.setInput('info', info);
  if (systemContext) {
    fixture.componentRef.setInput('systemContext', systemContext);
  }
  fixture.detectChanges();
  return fixture;
}

function escribir(root: HTMLElement, selector: string, value: string): void {
  const campo = root.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
  campo.value = value;
  campo.dispatchEvent(new Event('input'));
}

/** Llena el formulario con un envío mínimo válido, como lo haría una persona. */
function llenarFormulario(root: HTMLElement, mensaje: string): void {
  escribir(root, '#cf-name', 'Ada Lovelace');
  escribir(root, '#cf-company', 'Fábrica Analítica');
  escribir(root, '#cf-email', 'ada@fabrica-analitica.cr');
  escribir(root, '#cf-phone', '+506 8888 8888');
  escribir(root, '#cf-message', mensaje);
  const metodos = root
    .querySelectorAll('.cf-chips')[1]
    .querySelectorAll<HTMLButtonElement>('.cf-chip');
  metodos[0].click();
}

function enviar(root: HTMLElement): void {
  root.querySelector('.cf-form')!.dispatchEvent(new Event('submit'));
}

/** El JSON exacto que el navegador le manda al CRM. */
function interceptarEnvio(): LeadPayload {
  const http = TestBed.inject(HttpTestingController);
  const req = http.expectOne(CRM_DE_PRUEBA);
  const payload = req.request.body as LeadPayload;
  req.flush({ lead_id: payload.lead_id, status: 'created', received_at: '' });
  return payload;
}

describe('el envío que arma el formulario de verdad', () => {
  let endpointOriginal: string;
  let apiKeyOriginal: string;
  let visibilidad: 'visible' | 'hidden';

  beforeEach(() => {
    // El envío real: en dev el endpoint va vacío y el servicio simula. Acá se
    // apunta a un CRM de prueba para poder mirar el JSON que sale por el cable.
    endpointOriginal = environment.crmEndpoint;
    apiKeyOriginal = environment.crmApiKey;
    environment.crmEndpoint = CRM_DE_PRUEBA;
    environment.crmApiKey = 'clave-de-prueba';

    localStorage.clear();
    sessionStorage.clear();

    // Reloj bajo control: el anti-spam exige 5 s entre carga y envío, y los
    // tiempos de sesión son justamente lo que se está midiendo.
    ahora = Date.parse('2026-09-08T12:00:00.000Z');
    vi.spyOn(Date, 'now').mockImplementation(() => ahora);

    visibilidad = 'visible';
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibilidad
    });

    TestBed.configureTestingModule({
      imports: [ContactFooterComponent],
      providers: [
        provideRouter([
          { path: '', component: PaginaMuda },
          { path: 'software', component: PaginaMuda }
        ]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    environment.crmEndpoint = endpointOriginal;
    environment.crmApiKey = apiKeyOriginal;
    delete (document as unknown as Record<string, unknown>)['visibilityState'];
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  /**
   * Nota E de la auditoría. Desde el 2026-06-28 el servicio de seguimiento nace
   * en el arranque (AdsService lo inyecta en el componente raíz), o sea ANTES de
   * la primera navegación: cuenta la página inicial dos veces. El propio envío
   * se contradice — dice N páginas y adjunta un recorrido de N-1.
   *
   * Ojo al arreglar: la igualdad entre contador y recorrido vale para esta
   * visita corta, no como invariante universal. El recorrido descarta
   * navegaciones repetidas a la misma ruta y se corta en MAX_VISITED_PATHS.
   */
  it('el contador de páginas coincide con el recorrido que adjunta', async () => {
    // El seguimiento nace primero, como en el arranque real de la aplicación.
    TestBed.inject(LeadTrackingService);
    // …y recién después el router resuelve la primera navegación.
    await TestBed.inject(Router).navigateByUrl('/');

    const fixture = crearPie();
    const el = fixture.nativeElement as HTMLElement;
    llenarFormulario(el, MENSAJE_DE_LA_PERSONA);
    ahora += 20_000;
    fixture.detectChanges();
    enviar(el);

    const payload = interceptarEnvio();

    expect(
      payload.session.pages_visited,
      `dice ${payload.session.pages_visited} páginas y adjunta ${JSON.stringify(
        payload.session.pages_visited_paths
      )}`
    ).toBe(payload.session.pages_visited_paths.length);

    fixture.destroy();
  });

  /**
   * Nota B. Cuando el formulario vive en la página de un sistema, el sitio
   * antepone una línea al mensaje para que el CRM sepa de dónde vino el lead.
   * Ese texto lo escribe el sitio, no la persona, y viaja dentro del mismo campo
   * que después se puntúa.
   */
  it('el mensaje que viaja es el que escribió la persona', () => {
    const fixture = crearPie({
      name: SISTEMA_MAS_LARGO.name,
      slug: SISTEMA_MAS_LARGO.slug
    });
    const el = fixture.nativeElement as HTMLElement;
    llenarFormulario(el, MENSAJE_DE_LA_PERSONA);
    ahora += 20_000;
    fixture.detectChanges();
    enviar(el);

    const payload = interceptarEnvio();

    expect.soft(payload.intent.message).toBe(MENSAJE_DE_LA_PERSONA);

    // La consecuencia en puntos: la persona escribió menos de 100 caracteres,
    // así que su mensaje NO es «detallado» y no debería cobrar los +12.
    expect(MENSAJE_DE_LA_PERSONA.length).toBeLessThan(100);
    const factores = computeLeadScore(payload).breakdown.map((f) => f.factor);
    expect
      .soft(
        factores,
        `el mensaje que viajó mide ${payload.intent.message?.length} caracteres`
      )
      .not.toContain('mensaje_largo');

    fixture.destroy();
  });

  /**
   * Notas D y G. El puntaje mide con el reloj de pared: una pestaña olvidada en
   * segundo plano cobra el bono de «estuvo más de dos minutos», y el tiempo de
   * llenado se cuenta desde que cargó la página, no desde que la persona tocó el
   * formulario. Los dos datos buenos ya viajan en cada lead desde junio.
   */
  it('los tiempos que entran al puntaje son el activo y el de llenado real', () => {
    // El seguimiento nace con la página, con la pestaña visible.
    TestBed.inject(LeadTrackingService);
    const fixture = crearPie();
    const el = fixture.nativeElement as HTMLElement;

    // La pestaña se va a segundo plano diez minutos: tiempo de reloj, no de atención.
    visibilidad = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    ahora += 10 * 60_000;
    visibilidad = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));

    // Recién ahora la persona toca el formulario, y lo llena en ocho segundos.
    llenarFormulario(el, MENSAJE_DE_LA_PERSONA);
    ahora += 8_000;
    fixture.detectChanges();
    enviar(el);

    const payload = interceptarEnvio();

    // Los dos datos buenos viajan desde junio de 2026.
    expect(payload.session.time_on_site_active_ms).toBeLessThan(30_000);
    expect(payload.session.form_first_interaction_to_submit_ms).toBeLessThan(10_000);

    const factores = computeLeadScore(payload).breakdown.map((f) => f.factor);
    expect
      .soft(factores, 'estuvo 8 s de atención real, no diez minutos')
      .not.toContain('time_on_site_>2min');
    expect.soft(factores).toContain('time_on_site_<30s');
    expect
      .soft(factores, 'llenó el formulario en 8 s desde el primer foco')
      .toContain('form_llenado_<10s');

    fixture.destroy();
  });
});
