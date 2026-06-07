import { Injectable, effect, signal } from '@angular/core';

export type Lang = 'es' | 'en';

const STORAGE_KEY = 'sowe-lang';

function readInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') {
      return saved;
    }
  } catch {
    // localStorage no disponible (modo privado, etc.): caemos al default.
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
}
