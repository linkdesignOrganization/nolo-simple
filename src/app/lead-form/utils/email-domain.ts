import {
  EmailDomainType,
  PERSONAL_EMAIL_PROVIDERS,
  PUBLIC_SUFFIX_SECOND_LEVEL
} from '../models/lead-form-options';

/**
 * Clasificación del dominio de un correo: proveedor personal o empresa.
 *
 * El factor que consume esto vale veinte puntos de amplitud (+15 si es de
 * empresa, −5 si es personal), el desvío más grande que puede producir un solo
 * factor del scoring. Hasta el 2026-09-08 se comparaba el dominio completo
 * contra una lista de catorce cadenas exactas, así que `hotmail.com` era
 * personal y `hotmail.com.ar` —de uso masivo en Argentina— pasaba por empresa.
 *
 * Ahora se compara la **etiqueta registrable**: `hotmail`, sin importar si
 * termina en `.com`, `.es`, `.com.ar` o `.com.mx`. Criterio de Robert: la lista
 * es de PROVEEDORES, no de dominios, y el país no cuenta.
 */

const PROVIDERS = new Set(PERSONAL_EMAIL_PROVIDERS);
const SECOND_LEVEL = new Set(PUBLIC_SUFFIX_SECOND_LEVEL);

/**
 * Etiqueta registrable de un dominio: la parte que alguien registró, sin el
 * sufijo público.
 *
 *   gmail.com            → gmail
 *   hotmail.com.ar       → hotmail       (el sufijo es `com.ar`, no `ar`)
 *   coopeagropal.co.cr   → coopeagropal
 *   mep.go.cr            → mep
 *   mail.empresa.com     → empresa       (NO `mail`: el subdominio no manda)
 *   web.de               → web           (dos etiquetas: el dominio ES `web.de`)
 *
 * El sufijo compuesto solo se reconoce con un ccTLD de dos letras y cuando
 * queda algo delante; así `web.de` sigue siendo `web` y no se descarta entero.
 * No se consulta la Public Suffix List completa: alcanza con los sufijos de
 * segundo nivel de `PUBLIC_SUFFIX_SECOND_LEVEL`, y errar de más ahí solo
 * produce un "corporate" que ya iba a serlo.
 */
export function registrableLabel(domain: string | null | undefined): string {
  const clean = (domain || '')
    .toLowerCase()
    .trim()
    .replace(/\.+$/, '');
  if (!clean) return '';

  const parts = clean.split('.').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];

  const tld = parts[parts.length - 1];
  const second = parts[parts.length - 2];

  if (parts.length >= 3 && tld.length === 2 && SECOND_LEVEL.has(second)) {
    return parts[parts.length - 3];
  }
  return second;
}

/**
 * Clasifica el dominio de un correo. Todo lo que no sea un proveedor personal
 * conocido es de empresa y cobra sus puntos.
 *
 * Un correo sin `@` o sin dominio se sigue clasificando como "corporate", igual
 * que antes: el formulario valida el formato antes de llegar acá, así que ese
 * caso no existe en la práctica y no se toca el eje del puntaje.
 *
 * NO se verifica que el dominio exista ni que resuelva. `ucr.ac.cr.com`, que
 * apareció en la base real, es un dominio bien formado terminado en `.com`: su
 * etiqueta registrable es `cr`, no está en la lista de proveedores, y por lo
 * tanto cuenta como empresa. Comprobar la existencia de un dominio pide una
 * consulta de red desde el navegador en pleno envío: no vale el riesgo ni la
 * latencia para un factor de quince puntos.
 */
export function classifyEmailDomain(
  email: string | null | undefined
): EmailDomainType {
  const domain = ((email || '').split('@')[1] || '').toLowerCase().trim();
  if (!domain) return 'corporate';
  return PROVIDERS.has(registrableLabel(domain)) ? 'personal' : 'corporate';
}
