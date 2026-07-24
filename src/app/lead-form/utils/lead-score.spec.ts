import {
  scoreSessionSignals,
  sessionQualityFactor,
  modulateValueBySession,
  SessionSignals
} from './lead-score';

// Sesión "ideal": vino de un ad de búsqueda (cpc + gclid), en /software,
// >2 min, 5 páginas, país con timezone+locale coincidentes.
const ideal: SessionSignals = {
  landing: 'software',
  utm_medium: 'cpc',
  gclid: 'abc123',
  time_on_site_ms: 130_000,
  pages_visited: 5,
  country: 'CR',
  country_source: 'both'
};

// Sesión "pobre" (rebote): directo, home, <30 s, 1 página, país desconocido.
const poor: SessionSignals = {
  landing: 'corporate',
  utm_medium: null,
  gclid: null,
  time_on_site_ms: 10_000,
  pages_visited: 1,
  country: null,
  country_source: null
};

// Sesión "media": directo, home, ~1 min, 2 páginas.
const neutral: SessionSignals = {
  landing: 'corporate',
  utm_medium: null,
  gclid: null,
  time_on_site_ms: 60_000,
  pages_visited: 2,
  country: null,
  country_source: null
};

describe('scoreSessionSignals', () => {
  it('puntúa una sesión ideal en el tope esperado (+56)', () => {
    expect(scoreSessionSignals(ideal).score).toBe(56);
  });

  it('penaliza una sesión pobre (rebote) en negativo (-13)', () => {
    expect(scoreSessionSignals(poor).score).toBe(-13);
  });

  it('solo incluye señales de sesión, nunca factores de formulario', () => {
    const factors = scoreSessionSignals(ideal).breakdown.map((b) => b.factor);
    for (const formFactor of [
      'email_corporativo',
      'need_software',
      'anti_spam_pasa_todo',
      'interaction_<3',
      'form_llenado_<10s'
    ]) {
      expect(factors).not.toContain(formFactor);
    }
  });
});

describe('sessionQualityFactor (Opción A: solo penaliza, techo 1.0)', () => {
  it('floja (score < 0) → 0.7', () => {
    expect(sessionQualityFactor(-13)).toBe(0.7);
    expect(sessionQualityFactor(-1)).toBe(0.7);
  });
  it('media (0–19) → 0.8', () => {
    expect(sessionQualityFactor(0)).toBe(0.8);
    expect(sessionQualityFactor(19)).toBe(0.8);
  });
  it('buena (20–39) → 0.9', () => {
    expect(sessionQualityFactor(20)).toBe(0.9);
    expect(sessionQualityFactor(39)).toBe(0.9);
  });
  it('excelente (≥ 40) → 1.0, nunca más', () => {
    expect(sessionQualityFactor(40)).toBe(1.0);
    expect(sessionQualityFactor(999)).toBe(1.0);
  });
});

describe('modulateValueBySession (tabla Opción A acordada)', () => {
  it('agendar (base 60): floja → 42, excelente → 60', () => {
    expect(modulateValueBySession(60, poor)).toBe(42);
    expect(modulateValueBySession(60, ideal)).toBe(60);
  });
  it('correo (base 50): media → 40, excelente → 50', () => {
    expect(modulateValueBySession(50, neutral)).toBe(40);
    expect(modulateValueBySession(50, ideal)).toBe(50);
  });
  it('whatsapp (base 10): floja → 7, excelente → 10', () => {
    expect(modulateValueBySession(10, poor)).toBe(7);
    expect(modulateValueBySession(10, ideal)).toBe(10);
  });
  it('nunca supera el value base (techo en la mejor sesión)', () => {
    expect(modulateValueBySession(60, ideal)).toBeLessThanOrEqual(60);
    expect(modulateValueBySession(10, ideal)).toBeLessThanOrEqual(10);
  });
});
