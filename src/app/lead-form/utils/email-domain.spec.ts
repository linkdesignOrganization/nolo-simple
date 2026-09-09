import { classifyEmailDomain, registrableLabel } from './email-domain';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BLOQUE 1.1 — Proveedor personal vs. empresa
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * El factor que consume esto tiene veinte puntos de amplitud: +15 si el correo
 * es de empresa, −5 si es de un proveedor personal. Es el desvío más grande que
 * puede producir un solo factor del puntaje.
 *
 * Hasta el 2026-09-08 se comparaba el dominio completo contra catorce cadenas
 * exactas. `hotmail.com` estaba en la lista y `hotmail.com.ar` no, así que un
 * lead argentino con la casilla de consumo más común del país entraba al CRM
 * valiendo veinte puntos de más.
 *
 * Los casos de empresa de acá abajo salen de la base real de producción.
 */
describe('etiqueta registrable del dominio', () => {
  it('un dominio de dos etiquetas es su propia etiqueta', () => {
    expect(registrableLabel('gmail.com')).toBe('gmail');
    expect(registrableLabel('proton.me')).toBe('proton');
    expect(registrableLabel('web.de')).toBe('web');
  });

  it('reconoce el sufijo compuesto y no se queda con el país', () => {
    expect(registrableLabel('hotmail.com.ar')).toBe('hotmail');
    expect(registrableLabel('yahoo.com.mx')).toBe('yahoo');
    expect(registrableLabel('coopeagropal.co.cr')).toBe('coopeagropal');
    expect(registrableLabel('mep.go.cr')).toBe('mep');
    expect(registrableLabel('empresa.com.br')).toBe('empresa');
    expect(registrableLabel('empresa.co.uk')).toBe('empresa');
  });

  it('un subdominio no manda: `mail.empresa.com` NO es `mail.com`', () => {
    expect(registrableLabel('mail.empresa.com')).toBe('empresa');
    expect(registrableLabel('correo.mail.empresa.com')).toBe('empresa');
    expect(registrableLabel('mail.empresa.co.cr')).toBe('empresa');
  });

  it('tolera mayúsculas, espacios y el punto final', () => {
    expect(registrableLabel('  GMAIL.COM  ')).toBe('gmail');
    expect(registrableLabel('hotmail.com.ar.')).toBe('hotmail');
  });

  it('no revienta con basura', () => {
    expect(registrableLabel('')).toBe('');
    expect(registrableLabel(null)).toBe('');
    expect(registrableLabel(undefined)).toBe('');
    expect(registrableLabel('localhost')).toBe('localhost');
  });
});

describe('clasificación del correo', () => {
  it('los proveedores personales de la base real', () => {
    for (const email of [
      'ana@gmail.com',
      'ana@icloud.com',
      'ana@live.com'
    ]) {
      expect(classifyEmailDomain(email), email).toBe('personal');
    }
  });

  it('el país y el sufijo no importan: es el mismo proveedor', () => {
    for (const email of [
      'ana@hotmail.com',
      'ana@hotmail.es',
      'ana@hotmail.com.ar',
      'ana@hotmail.com.mx',
      'ana@yahoo.com.ar',
      'ana@outlook.com.br',
      'ana@gmail.com'
    ]) {
      expect(classifyEmailDomain(email), email).toBe('personal');
    }
  });

  it('cubre a los grandes por marca, no por dominio', () => {
    for (const email of [
      'ana@googlemail.com',
      'ana@msn.com',
      'ana@ymail.com',
      'ana@me.com',
      'ana@mac.com',
      'ana@aol.com',
      'ana@protonmail.com',
      'ana@proton.me',
      'ana@pm.me',
      'ana@gmx.net',
      'ana@zoho.com',
      'ana@yandex.ru',
      'ana@tutanota.com',
      'ana@fastmail.com',
      'ana@hey.com',
      'ana@mail.com',
      'ana@mail.ru',
      'ana@terra.com.br',
      'ana@uol.com.br',
      'ana@fibertel.com.ar',
      'ana@racsa.co.cr'
    ]) {
      expect(classifyEmailDomain(email), email).toBe('personal');
    }
  });

  it('los dominios de empresa de la base real cobran sus puntos', () => {
    for (const email of [
      'contacto@bsci.com',
      'contacto@cadsyst.com.ar',
      'contacto@coopeagropal.co.cr',
      'contacto@mep.go.cr',
      'contacto@pacificstar.com.mx',
      'contacto@loria.info'
    ]) {
      expect(classifyEmailDomain(email), email).toBe('corporate');
    }
  });

  it('un dominio de empresa con un proveedor en el subdominio sigue siendo empresa', () => {
    expect(classifyEmailDomain('ana@mail.empresa.com')).toBe('corporate');
    expect(classifyEmailDomain('ana@gmail.empresa.co.cr')).toBe('corporate');
  });

  /**
   * `ucr.ac.cr.com` apareció de verdad en la base. Es un dominio bien formado
   * terminado en `.com` cuya etiqueta registrable es `cr`: no es un proveedor
   * personal, así que cuenta como empresa. No se verifica que exista ni que
   * resuelva — eso pediría una consulta de red desde el navegador en pleno
   * envío, y no vale la latencia ni el riesgo por un factor de quince puntos.
   */
  it('el caso raro `ucr.ac.cr.com` cuenta como empresa, sin verificar existencia', () => {
    expect(registrableLabel('ucr.ac.cr.com')).toBe('cr');
    expect(classifyEmailDomain('alguien@ucr.ac.cr.com')).toBe('corporate');
  });

  it('un correo sin dominio se sigue tratando como antes', () => {
    expect(classifyEmailDomain('sin-arroba')).toBe('corporate');
    expect(classifyEmailDomain('')).toBe('corporate');
  });
});
