import { Injectable, effect, signal } from '@angular/core';

export type Lang = 'es' | 'en';

const STORAGE_KEY = 'nolo-lang';

function readInitialLang(): Lang {
  // El idioma lo manda la URL: /en/... → en, resto → es. Así el cliente arranca en el mismo
  // idioma que el HTML prerenderizado (evita mismatch de hidratación). En server cae a 'es';
  // el langGuard lo corrige por ruta durante el prerender.
  if (typeof location !== 'undefined' && /^\/en(?=\/|$)/.test(location.pathname)) {
    return 'en';
  }
  return 'es';
}

/**
 * Idioma del sitio (ES/EN), client-side y sin recarga. El valor inicial se lee de forma
 * síncrona en el constructor (antes del primer render), así el contenido correcto aparece
 * desde el primer frame, sin flash de claves. Persiste la elección y mantiene `<html lang>`.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _lang = signal<Lang>(readInitialLang());

  /** Idioma actual (solo lectura). */
  readonly lang = this._lang.asReadonly();

  constructor() {
    effect(() => {
      const current = this._lang();
      try {
        localStorage.setItem(STORAGE_KEY, current);
      } catch {
        // ignorar si no se puede persistir
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = current;
      }
    });
  }

  toggle(): void {
    this._lang.update((current) => (current === 'es' ? 'en' : 'es'));
  }

  set(lang: Lang): void {
    this._lang.set(lang);
  }

  /**
   * Prefija `/en` a un path interno cuando el idioma activo es inglés (preservando el #fragment),
   * para mantener los enlaces dentro del árbol del idioma actual. Externos/relativos: sin tocar.
   */
  link(path: string): string {
    if (this.lang() !== 'en') return path;
    if (!path || path[0] !== '/') return path;
    if (path === '/') return '/en';
    if (/^\/en(?=[/#]|$)/.test(path)) return path;
    return '/en' + path;
  }
}
