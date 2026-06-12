/**
 * Mapeo de timezones IANA → códigos de país ISO 3166-1 alpha-2.
 *
 * Estrategia: el browser expone `Intl.DateTimeFormat().resolvedOptions().timeZone`
 * que devuelve algo como "America/Costa_Rica" o "Europe/Madrid". Este map nos
 * permite inferir el país sin llamar a ningún servicio externo.
 *
 * Cobertura: LATAM completo, US/Canada, España, principales países europeos.
 * Si el usuario está en otro país con timezone no listado, devuelve null y se
 * intenta fallback con `navigator.language`.
 */

const TZ_TO_COUNTRY: Record<string, string> = {
  // ──────────────────────────────────────────────────────
  // LATAM — mercado principal
  // ──────────────────────────────────────────────────────
  'America/Costa_Rica':        'CR',
  'America/Panama':            'PA',
  'America/Guatemala':         'GT',
  'America/El_Salvador':       'SV',
  'America/Tegucigalpa':       'HN',
  'America/Managua':           'NI',
  'America/Belize':            'BZ',

  // México
  'America/Mexico_City':       'MX',
  'America/Cancun':            'MX',
  'America/Merida':            'MX',
  'America/Monterrey':         'MX',
  'America/Matamoros':         'MX',
  'America/Mazatlan':          'MX',
  'America/Chihuahua':         'MX',
  'America/Hermosillo':        'MX',
  'America/Ojinaga':           'MX',
  'America/Tijuana':           'MX',
  'America/Bahia_Banderas':    'MX',

  // Sudamérica
  'America/Bogota':            'CO',
  'America/Lima':              'PE',
  'America/Caracas':           'VE',
  'America/La_Paz':            'BO',
  'America/Asuncion':          'PY',
  'America/Montevideo':        'UY',
  'America/Guayaquil':         'EC',
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Argentina/Cordoba':      'AR',
  'America/Argentina/Mendoza':      'AR',
  'America/Argentina/Salta':        'AR',
  'America/Argentina/Tucuman':      'AR',
  'America/Argentina/Ushuaia':      'AR',
  'America/Argentina/San_Juan':     'AR',
  'America/Argentina/San_Luis':     'AR',
  'America/Argentina/Rio_Gallegos': 'AR',
  'America/Argentina/Catamarca':    'AR',
  'America/Argentina/Jujuy':        'AR',
  'America/Argentina/La_Rioja':     'AR',
  'America/Santiago':          'CL',
  'America/Punta_Arenas':      'CL',
  'America/Sao_Paulo':         'BR',
  'America/Bahia':             'BR',
  'America/Fortaleza':         'BR',
  'America/Manaus':            'BR',
  'America/Recife':            'BR',
  'America/Belem':             'BR',
  'America/Cuiaba':            'BR',
  'America/Campo_Grande':      'BR',
  'America/Porto_Velho':       'BR',
  'America/Boa_Vista':         'BR',
  'America/Rio_Branco':        'BR',
  'America/Eirunepe':          'BR',

  // Caribe
  'America/Havana':            'CU',
  'America/Santo_Domingo':     'DO',
  'America/Port-au-Prince':    'HT',
  'America/Jamaica':           'JM',
  'America/Puerto_Rico':       'PR',
  'America/Nassau':            'BS',
  'America/Barbados':          'BB',

  // ──────────────────────────────────────────────────────
  // US (estados con timezone propia)
  // ──────────────────────────────────────────────────────
  'America/New_York':          'US',
  'America/Chicago':           'US',
  'America/Denver':            'US',
  'America/Los_Angeles':       'US',
  'America/Phoenix':           'US',
  'America/Anchorage':         'US',
  'America/Honolulu':          'US',
  'America/Detroit':           'US',
  'America/Indiana/Indianapolis': 'US',
  'America/Kentucky/Louisville':  'US',
  'America/Boise':             'US',
  'America/Juneau':            'US',
  'America/Sitka':             'US',
  'America/Yakutat':           'US',
  'America/Nome':              'US',
  'America/Adak':              'US',
  'America/Menominee':         'US',

  // ──────────────────────────────────────────────────────
  // Canada
  // ──────────────────────────────────────────────────────
  'America/Toronto':           'CA',
  'America/Vancouver':         'CA',
  'America/Montreal':          'CA',
  'America/Edmonton':          'CA',
  'America/Winnipeg':          'CA',
  'America/Halifax':           'CA',
  'America/St_Johns':          'CA',
  'America/Regina':            'CA',

  // ──────────────────────────────────────────────────────
  // Europa (ES principal, otros relevantes)
  // ──────────────────────────────────────────────────────
  'Europe/Madrid':             'ES',
  'Atlantic/Canary':           'ES',
  'Europe/Lisbon':             'PT',
  'Atlantic/Azores':           'PT',
  'Atlantic/Madeira':          'PT',
  'Europe/London':             'GB',
  'Europe/Paris':              'FR',
  'Europe/Berlin':             'DE',
  'Europe/Rome':               'IT',
  'Europe/Amsterdam':          'NL',
  'Europe/Brussels':           'BE',
  'Europe/Vienna':             'AT',
  'Europe/Zurich':             'CH',
  'Europe/Stockholm':          'SE',
  'Europe/Oslo':               'NO',
  'Europe/Copenhagen':         'DK',
  'Europe/Helsinki':           'FI',
  'Europe/Dublin':             'IE',
  'Europe/Warsaw':             'PL',
  'Europe/Prague':             'CZ',
  'Europe/Athens':             'GR',
  'Europe/Bucharest':          'RO',
  'Europe/Budapest':           'HU',
  'Europe/Istanbul':           'TR',
  'Europe/Moscow':             'RU',
  'Europe/Kyiv':               'UA',
  'Europe/Kiev':               'UA',

  // ──────────────────────────────────────────────────────
  // Asia + Oceanía (poco probable pero por completitud)
  // ──────────────────────────────────────────────────────
  'Asia/Tokyo':                'JP',
  'Asia/Shanghai':             'CN',
  'Asia/Hong_Kong':            'HK',
  'Asia/Singapore':            'SG',
  'Asia/Seoul':                'KR',
  'Asia/Kolkata':              'IN',
  'Asia/Dubai':                'AE',
  'Australia/Sydney':          'AU',
  'Australia/Melbourne':       'AU',
  'Pacific/Auckland':          'NZ'
};

/**
 * Devuelve el código ISO 3166-1 alpha-2 del país inferido del timezone.
 * Retorna `null` si el timezone no está mapeado.
 */
export function getCountryFromTimezone(timezone: string | null): string | null {
  if (!timezone) return null;
  return TZ_TO_COUNTRY[timezone] || null;
}
