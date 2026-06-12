/**
 * Validators custom para el form de leads.
 * Todos son funciones puras (SSR-safe).
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DISPOSABLE_EMAIL_DOMAINS } from '../models/lead-form-options';

/**
 * Validator de "required" para arrays (multi-select).
 * Falla si el valor no es array o está vacío.
 */
export function arrayRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!Array.isArray(value) || value.length === 0) {
      return { required: true };
    }
    return null;
  };
}

/**
 * Email más estricto que el default de Angular.
 * Rechaza:
 *   - emails sin TLD ('a@b')
 *   - TLD numérico ('a@b.123')
 *   - dominios desechables
 *   - longitud > 254
 */
export function emailStrictValidator(): ValidatorFn {
  // Regex práctico (no RFC 5322 completo, pero cubre 99% de casos reales).
  const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value || '').toString().trim().toLowerCase();
    if (!value) return null; // dejar required validator hacer su trabajo

    if (value.length > 254) return { emailTooLong: true };
    if (!EMAIL_RE.test(value)) return { emailInvalid: true };

    const domain = value.split('@')[1] || '';
    if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
      return { emailDisposable: true };
    }
    return null;
  };
}

/**
 * Phone validator flexible:
 *   - Si empieza con "+506 " seguido de 8 dígitos: válido (Costa Rica)
 *   - Si empieza con "+" cualquier código: valida formato E.164 (7-15 dígitos totales sin contar el +)
 *   - Sin "+": rechaza
 *
 * Acepta espacios, guiones y paréntesis como separadores visuales — se ignoran.
 */
export function phoneFlexibleValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = (control.value || '').toString().trim();
    if (!raw) return null; // required se encarga

    // Quitar caracteres no significativos
    const cleaned = raw.replace(/[\s\-().]/g, '');

    if (!cleaned.startsWith('+')) {
      return { phoneNeedsPrefix: true };
    }

    const digits = cleaned.slice(1); // todo después del +
    if (!/^\d+$/.test(digits)) {
      return { phoneInvalidChars: true };
    }

    // E.164 estándar: 7-15 dígitos
    if (digits.length < 7) return { phoneTooShort: true };
    if (digits.length > 15) return { phoneTooLong: true };

    // Costa Rica: +506 + 8 dígitos = 11 dígitos totales
    if (cleaned.startsWith('+506')) {
      const local = cleaned.slice(4);
      if (local.length !== 8) return { phoneInvalidCR: true };
    }

    return null;
  };
}

/**
 * Rechaza si el valor contiene URLs/enlaces.
 * Usado en name y company donde no debería haber links.
 */
export function noLinksValidator(): ValidatorFn {
  const LINK_PATTERNS = [
    /https?:\/\//i,
    /www\./i,
    /\.(com|net|org|io|co|cr|es|mx|ar|cl|pe)\b/i,
    /<a\s/i
  ];

  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value || '').toString();
    if (!value) return null;

    for (const re of LINK_PATTERNS) {
      if (re.test(value)) return { containsLinks: true };
    }
    return null;
  };
}

/**
 * Para el textarea de mensaje: permite hasta 1 URL.
 * Rechaza si hay >1 URL o si menciona keywords típicos de spam.
 */
export function noExcessiveLinksValidator(): ValidatorFn {
  const URL_RE = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  const SPAM_KEYWORDS = [
    'casino', 'viagra', 'cialis', 'porn', 'xxx',
    'seo services', 'cheap loans', 'crypto pump', 'forex trading',
    'click here to', 'congratulations you won', 'work from home easy money'
  ];

  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value || '').toString();
    if (!value) return null;

    const matches = value.match(URL_RE) || [];
    if (matches.length > 1) return { tooManyLinks: true };

    const lower = value.toLowerCase();
    for (const kw of SPAM_KEYWORDS) {
      if (lower.includes(kw)) return { spamKeyword: true };
    }
    return null;
  };
}
