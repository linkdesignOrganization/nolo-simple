/**
 * Wrapper SSR-safe para localStorage / sessionStorage / cookies.
 *
 * En SSR (Angular Universal) no existe `window` ni `document`,
 * por lo que cualquier acceso directo crashea el render del server.
 * Estos helpers devuelven null/false silenciosamente en server.
 */

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

// ────────────────────────────────────────────────────────────────────────────
// localStorage
// ────────────────────────────────────────────────────────────────────────────

export function lsGet(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function lsSet(key: string, value: string): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function lsRemove(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Guarda un objeto JSON con TTL.
 * Si vence, lsGetJsonWithTtl devuelve null y limpia.
 */
export function lsSetJsonWithTtl<T>(key: string, value: T, ttlMs: number): boolean {
  return lsSet(key, JSON.stringify({ value, expiresAt: Date.now() + ttlMs }));
}

export function lsGetJsonWithTtl<T>(key: string): T | null {
  const raw = lsGet(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { value: T; expiresAt: number };
    if (typeof parsed.expiresAt !== 'number' || parsed.expiresAt < Date.now()) {
      lsRemove(key);
      return null;
    }
    return parsed.value;
  } catch {
    lsRemove(key);
    return null;
  }
}

export function lsGetJson<T>(key: string): T | null {
  const raw = lsGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function lsSetJson<T>(key: string, value: T): boolean {
  return lsSet(key, JSON.stringify(value));
}

// ────────────────────────────────────────────────────────────────────────────
// sessionStorage
// ────────────────────────────────────────────────────────────────────────────

export function ssGet(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function ssSet(key: string, value: string): boolean {
  if (!isBrowser()) return false;
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Cookies
// ────────────────────────────────────────────────────────────────────────────

export function cookieGet(name: string): string | null {
  if (!isBrowser()) return null;
  try {
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// UUID v4 generation — siempre fuerza v4 explícitamente
// ────────────────────────────────────────────────────────────────────────────

/**
 * Genera un UUID v4 (RFC 4122) usando bytes aleatorios criptográficamente seguros.
 *
 * ¿Por qué NO usar `crypto.randomUUID()` directamente?
 * Por spec WHATWG `crypto.randomUUID()` debe devolver v4, y hoy todos los browsers
 * mayoritarios lo hacen. PERO:
 *   - Chrome tiene un flag experimental para retornar v7
 *   - Algunas extensiones de browser pueden monkey-patchear crypto.randomUUID
 *   - Polyfills en SSR pueden delegar a libs que generen v7 (uuid@9+, ulid, nanoid)
 *
 * Si el CRM exige v4 estricto (su regex `[...]-4[hex]{3}-[89ab][...]`), un v7
 * accidental rompe la integración. Para blindarnos generamos los 16 bytes con
 * crypto.getRandomValues() y seteamos manualmente los bits de versión (4) y
 * variant (RFC 4122 = 10xx) antes de formatear.
 *
 * Resultado: UUID v4 100% garantizado, con la misma calidad de entropía que
 * crypto.randomUUID() (ambos usan el mismo CSPRNG subyacente).
 */
export function safeUuid(): string {
  if (isBrowser() && typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set version a 4: byte 6, los 4 bits altos = 0100
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set variant a RFC 4122: byte 8, los 2 bits altos = 10
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Último fallback (Math.random) — no criptográfico pero suficiente para lead_id
  // y mantiene el formato v4 literal (`4` en la posición de versión)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
