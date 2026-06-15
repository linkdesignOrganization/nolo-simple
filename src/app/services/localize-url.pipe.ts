import { Pipe, PipeTransform, inject } from '@angular/core';

import { LanguageService } from './language.service';

/**
 * Prefija `/en` a un path interno cuando el idioma activo es inglés (deja externos/relativos
 * sin tocar). Impuro: se reevalúa en cada CD para reflejar el cambio de idioma/navegación.
 * Usar en `routerLink`/`href` de enlaces internos para no salir del árbol del idioma actual.
 */
@Pipe({ name: 'localizeUrl', standalone: true, pure: false })
export class LocalizeUrlPipe implements PipeTransform {
  private readonly i18n = inject(LanguageService);

  transform(path: string): string {
    return this.i18n.link(path);
  }
}
