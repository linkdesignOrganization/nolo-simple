import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { Lang, LanguageService } from './language.service';

/**
 * Fija el idioma a partir de la ruta (`data.lang`). Se attachea a los dos árboles de rutas
 * (raíz = es, /en = en) y corre en el prerender (server, antes de renderizar el componente) y en
 * cada navegación cliente. Así la URL es la autoridad del idioma: /en/... = en, resto = es.
 */
export const langGuard: CanActivateFn = (route) => {
  const lang = (route.data['lang'] as Lang) ?? 'es';
  inject(LanguageService).set(lang);
  return true;
};
