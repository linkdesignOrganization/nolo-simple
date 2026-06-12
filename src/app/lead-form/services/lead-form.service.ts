import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LeadTrackingService } from './lead-tracking.service';
import {
  LeadFormRawValue,
  LeadPayload,
  LeadSubmitResult
} from '../models/lead-payload.model';
import {
  FormLocation,
  RATE_LIMIT_CONFIG,
  ANTI_SPAM_CONFIG,
  STORAGE_KEYS,
  PAYLOAD_SCHEMA_VERSION,
  GA_CONVERSION
} from '../models/lead-form-options';
import {
  lsGetJson,
  lsSetJson,
  ssGet,
  ssSet,
  safeUuid
} from '../utils/storage-safe';
import {
  sanitizeText,
  sanitizeLongText,
  sanitizeEmail,
  normalizePhoneE164,
  extractCountryPrefix
} from '../utils/sanitize';
import {
  computeLeadScore,
  LEAD_SCORE_ADS_VALUE
} from '../utils/lead-score';

declare var gtag: Function;

/**
 * Contexto adicional que el componente del form debe proveer al servicio
 * (no es parte de los valores del FormGroup pero sí del payload final).
 */
export interface LeadSubmitContext {
  formLocation: FormLocation;
  formLoadedAt: number;
  interactionCount: number;
}

/**
 * LeadFormService — orquesta el submit del lead.
 *
 * Flujo:
 *   1. canSubmit() → valida rate limit local
 *   2. validateAntiSpam() → honeypots, time check, interaction check
 *   3. sanitize + assemble → arma payload completo
 *   4. httpSubmit() → POST real al endpoint del CRM (en producción)
 *      o simulateSubmit() (en dev sin endpoint configurado)
 *   5. markSubmitted() + gtag conversion event con Enhanced Conversions
 *
 * TODO(CRM): client-side anti-spam es UX-only. La seguridad real debe vivir en
 * el endpoint CRM (IP rate-limit, dedup email/phone, re-validación server-side).
 */
@Injectable({ providedIn: 'root' })
export class LeadFormService {
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private tracking: LeadTrackingService,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Rate limiting (UX-only — NO es seguridad real)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Verifica si el usuario puede enviar (no excede rate limit local).
   */
  canSubmit(): { ok: boolean; reason?: 'too_soon' | 'too_many' } {
    if (!this.isBrowser) return { ok: true };

    const now = Date.now();

    // 1) Mínimo intervalo entre envíos
    const lastSubmitRaw = ssGet(STORAGE_KEYS.LAST_SUBMIT);
    const lastSubmit = lastSubmitRaw ? parseInt(lastSubmitRaw, 10) : 0;
    if (lastSubmit && now - lastSubmit < RATE_LIMIT_CONFIG.MIN_INTERVAL_MS) {
      return { ok: false, reason: 'too_soon' };
    }

    // 2) Máximo por hora
    const history = this.getSubmitHistory();
    const recentCount = history.filter(
      (ts) => now - ts < RATE_LIMIT_CONFIG.HISTORY_WINDOW_MS
    ).length;
    if (recentCount >= RATE_LIMIT_CONFIG.MAX_PER_HOUR) {
      return { ok: false, reason: 'too_many' };
    }

    return { ok: true };
  }

  /**
   * Registra un envío exitoso en el historial local.
   */
  markSubmitted(): void {
    if (!this.isBrowser) return;
    const now = Date.now();
    ssSet(STORAGE_KEYS.LAST_SUBMIT, String(now));

    const history = this.getSubmitHistory();
    history.push(now);
    // Mantener solo lo último de la ventana
    const fresh = history.filter(
      (ts) => now - ts < RATE_LIMIT_CONFIG.HISTORY_WINDOW_MS
    );
    lsSetJson(STORAGE_KEYS.SUBMIT_HISTORY, fresh);
  }

  private getSubmitHistory(): number[] {
    return lsGetJson<number[]>(STORAGE_KEYS.SUBMIT_HISTORY) || [];
  }

  private getRateLimitRemaining(): number {
    const history = this.getSubmitHistory();
    const now = Date.now();
    const recent = history.filter(
      (ts) => now - ts < RATE_LIMIT_CONFIG.HISTORY_WINDOW_MS
    ).length;
    return Math.max(0, RATE_LIMIT_CONFIG.MAX_PER_HOUR - recent - 1); // -1 porque este intento contará
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Anti-spam validation
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Valida los checks anti-spam.
   * Devuelve flags individuales para incluir en el payload (telemetría útil para CRM).
   */
  private validateAntiSpam(
    raw: LeadFormRawValue,
    context: LeadSubmitContext
  ): {
    passed_honeypot: boolean;
    passed_time_check: boolean;
    passed_interaction_check: boolean;
    isSpam: boolean;
  } {
    const passed_honeypot = !raw.website && !raw.url;

    const elapsed = Date.now() - context.formLoadedAt;
    const passed_time_check = elapsed >= ANTI_SPAM_CONFIG.MIN_TIME_TO_SUBMIT_MS;

    const passed_interaction_check =
      context.interactionCount >= ANTI_SPAM_CONFIG.MIN_INTERACTIONS;

    const isSpam = !passed_honeypot || !passed_time_check || !passed_interaction_check;

    return { passed_honeypot, passed_time_check, passed_interaction_check, isSpam };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Submit
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Punto de entrada principal — orquesta validación + payload + envío.
   */
  submit(
    raw: LeadFormRawValue,
    context: LeadSubmitContext
  ): Observable<LeadSubmitResult> {
    // 1) Rate limit
    const rl = this.canSubmit();
    if (!rl.ok) {
      return of({
        status: 'rate_limited',
        message:
          rl.reason === 'too_soon'
            ? 'Esperá un momento antes de enviar otro mensaje.'
            : 'Ya recibimos tu mensaje. Te contactaremos pronto.'
      } as LeadSubmitResult);
    }

    // 2) Anti-spam
    const spam = this.validateAntiSpam(raw, context);
    if (spam.isSpam) {
      // Silencio: devolvemos "success" falso para no informar al bot
      // pero internamente registramos como spam_detected en el log
      // y NO contamos en el rate limit (para no entorpecer a un user real)
      if (this.isBrowser) {
        // eslint-disable-next-line no-console
        console.warn('[LeadForm] Spam detected, silently rejecting.', {
          passed_honeypot: spam.passed_honeypot,
          passed_time_check: spam.passed_time_check,
          passed_interaction_check: spam.passed_interaction_check
        });
      }
      return of({ status: 'spam_detected' } as LeadSubmitResult).pipe(delay(1200));
    }

    // 3) Sanitize + assemble payload
    const payload = this.assemblePayload(raw, context, spam);

    // 4) Submit — HTTP real al CRM si está configurado, simulado en dev
    const submission$ = environment.crmEndpoint
      ? this.httpSubmit(payload)
      : this.simulateSubmit(payload);

    return submission$.pipe(
      tap((result) => {
        if (result.status === 'success') {
          this.markSubmitted();
          this.fireConversionEvent(payload);
        }
      })
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Payload assembly
  // ──────────────────────────────────────────────────────────────────────────

  private assemblePayload(
    raw: LeadFormRawValue,
    context: LeadSubmitContext,
    spam: {
      passed_honeypot: boolean;
      passed_time_check: boolean;
      passed_interaction_check: boolean;
    }
  ): LeadPayload {
    const trackingCtx = this.tracking.getTrackingContext(context.formLocation);

    // Sanitización defensiva
    const name = sanitizeText(raw.name, 80);
    const company = sanitizeText(raw.company, 120) || null;
    const email = sanitizeEmail(raw.email);
    const message = sanitizeLongText(raw.message, 1000) || null;
    const phoneE164 = normalizePhoneE164(raw.phone);
    const phoneCountryPrefix = extractCountryPrefix(phoneE164);

    return {
      lead_id: safeUuid(),
      submitted_at: new Date().toISOString(),
      schema_version: PAYLOAD_SCHEMA_VERSION,
      contact: {
        name,
        company,
        email,
        email_domain_type: this.tracking.getEmailDomainType(email),
        phone: phoneE164,
        phone_country_prefix: phoneCountryPrefix
      },
      intent: {
        // need: array (opcional, puede venir vacío)
        need: Array.isArray(raw.need) ? raw.need : [],
        // preferred_contact: array (mínimo 1, validado por arrayRequiredValidator)
        preferred_contact: Array.isArray(raw.preferred_contact) ? raw.preferred_contact : [],
        message
      },
      source: trackingCtx.source,
      attribution: trackingCtx.attribution,
      session: {
        ...trackingCtx.session,
        form_load_to_submit_ms: Date.now() - context.formLoadedAt,
        interaction_count: context.interactionCount
      },
      anti_spam: {
        passed_honeypot: spam.passed_honeypot,
        passed_time_check: spam.passed_time_check,
        passed_interaction_check: spam.passed_interaction_check,
        rate_limit_remaining: this.getRateLimitRemaining()
      }
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HTTP submit al endpoint del CRM
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * POST al endpoint del CRM (Azure App Service).
   * Contrato: ver docs/HANDOFF-SITIO.md.
   *
   * Respuestas:
   *   - 201: lead nuevo, OK
   *   - 200: duplicate (dedup por lead_id), también OK desde el POV del usuario
   *   - 400: validation_failed (no debería pasar si front valida bien)
   *   - 401: unauthorized (API key incorrecta u Origin no permitido)
   *   - 429: rate_limited
   *   - 5xx: internal_error
   */
  private httpSubmit(payload: LeadPayload): Observable<LeadSubmitResult> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'X-API-Key': environment.crmApiKey,
      'Idempotency-Key': payload.lead_id
    });

    // Log diagnóstico — útil para detectar problemas con lead_id, UTM, etc.
    if (this.isBrowser) {
      // eslint-disable-next-line no-console
      console.info(
        `%c[LeadForm] Enviando al CRM — lead_id=${payload.lead_id}`,
        'color:#874FE8;font-weight:bold;'
      );
    }

    // observe: 'response' nos da acceso al status code (201 vs 200 son ambos éxito)
    return this.http
      .post<{ lead_id: string; status: string; received_at: string }>(
        environment.crmEndpoint,
        payload,
        { headers, observe: 'response' }
      )
      .pipe(
        map((response): LeadSubmitResult => ({
          status: 'success',
          lead_id: response.body?.lead_id || payload.lead_id
        })),
        catchError((err: HttpErrorResponse): Observable<LeadSubmitResult> => {
          // 429 → rate limited (mensaje específico para el usuario)
          if (err.status === 429) {
            const retryAfter = err.error?.retry_after_seconds || 3600;
            return of({
              status: 'rate_limited',
              message: `Demasiados envíos. Intenta de nuevo en ${Math.ceil(retryAfter / 60)} minutos.`
            });
          }

          // 401 → token o Origin inválido. Para el usuario: error genérico.
          if (err.status === 401) {
            if (this.isBrowser) {
              // eslint-disable-next-line no-console
              console.error('[LeadForm] CRM rechazó la request (401). Verificar API key y Origin allowlist.');
            }
            return of({
              status: 'error',
              message: 'No pudimos enviar tu mensaje. Por favor intentá de nuevo.'
            });
          }

          // 400 → validación. Esto NO debería pasar (el front valida primero),
          // así que si pasa es un bug. Loggear para debugging.
          if (err.status === 400) {
            if (this.isBrowser) {
              // eslint-disable-next-line no-console
              console.error('[LeadForm] CRM rechazó payload (400):', err.error);
            }
            // Mensaje específico si el CRM nos dice qué campo falló
            const fields = err.error?.fields;
            let detail = '';
            if (fields && typeof fields === 'object') {
              const list = Object.entries(fields)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
              detail = ` (${list})`;
            }
            return of({
              status: 'error',
              message: `Validación del CRM falló${detail}. Avisanos por WhatsApp.`
            });
          }

          // 0 → red/CORS/offline
          if (err.status === 0) {
            return of({
              status: 'error',
              message: 'Sin conexión. Verificá tu internet e intentá de nuevo.'
            });
          }

          // 5xx → server error
          return of({
            status: 'error',
            message: 'Estamos teniendo un problema. Intentá de nuevo en unos minutos.'
          });
        })
      );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Simulated submit (fallback para dev sin endpoint configurado)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Simula el envío con un delay realista. Útil en dev (localhost) donde el
   * Origin allowlist del CRM bloquea la request real.
   * Loggea el payload completo en console para inspeccionarlo.
   */
  private simulateSubmit(payload: LeadPayload): Observable<LeadSubmitResult> {
    if (this.isBrowser) {
      // eslint-disable-next-line no-console
      console.groupCollapsed(
        `%c[LeadForm] Payload listo para CRM (simulado) — lead_id=${payload.lead_id}`,
        'color:#874FE8;font-weight:bold;'
      );
      // eslint-disable-next-line no-console
      console.log(payload);
      // eslint-disable-next-line no-console
      console.info(
        '%cTODO: conectar este payload con el endpoint del CRM en environment.crmEndpoint',
        'color:#888;font-style:italic;'
      );
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    return of<LeadSubmitResult>({
      status: 'success',
      lead_id: payload.lead_id
    }).pipe(delay(1200));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Google Ads conversion event
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Dispara el evento de conversión de Google Ads con TODOS los datos
   * necesarios para que Ads:
   *
   *   1. Cuente la conversión con value dinámico según qué tan caliente es el lead.
   *      El value se deriva de la categoría calculada con `computeLeadScore`
   *      (misma fórmula que el CRM aplica en server, ver utils/lead-score.ts):
   *        hot=30, warm=24, cold=18, nurture=15.
   *      Si la categoría es `suspicious` la conversión NO se dispara (defensa
   *      contra leads de bajísima calidad que pasaron el anti-spam local pero
   *      tienen señales muy negativas; Smart Bidding no debe optimizar por ellos).
   *
   *   2. Pueda hacer **Enhanced Conversions**: matchear el lead con el click
   *      original que vino de un ad usando email/phone hasheados.
   *
   *   3. Tenga el `transaction_id` (lead_id) para evitar duplicados Y para
   *      hacer **offline conversion upload** después (cuando el lead se
   *      convierte en cliente cerrado, el CRM puede mandar a Google Ads:
   *      "este lead_id se cerró por $X" → cierre del loop de atribución).
   *
   * Si gtag no está disponible (ad-blocker, página sin GA), falla silenciosamente.
   *
   * NOTA SOBRE ENHANCED CONVERSIONS:
   *   Para que Google haga el matching, en la cuenta de Google Ads debe estar
   *   activado: Conversions → tu conversion action → Enhanced Conversions ON.
   *   Si no está activado, el `user_data` se ignora — no rompe nada.
   *   Google hashea automáticamente los campos (SHA-256) antes de enviarlos.
   */
  private fireConversionEvent(payload: LeadPayload): void {
    if (!this.isBrowser) return;
    if (typeof gtag !== 'function') return;

    const scoring = computeLeadScore(payload);
    const value = LEAD_SCORE_ADS_VALUE[scoring.category];

    if (value === null) {
      // Categoría 'suspicious' — no reportar conversión a Ads
      // eslint-disable-next-line no-console
      console.info(
        `[LeadForm] Lead categorizado como '${scoring.category}' (score=${scoring.score}); conversión NO enviada a Ads.`
      );
      return;
    }

    try {
      // Enhanced Conversions: datos de usuario para que Ads matchee el lead
      // con el ad click que lo trajo. Google los hashea automáticamente.
      const userData: Record<string, string | object> = {
        email: payload.contact.email
      };
      if (payload.contact.phone) {
        userData['phone_number'] = payload.contact.phone; // ya viene en E.164
      }
      if (payload.contact.name) {
        const nameParts = payload.contact.name.trim().split(/\s+/);
        userData['address'] = {
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || ''
        };
      }

      gtag('set', 'user_data', userData);

      gtag('event', GA_CONVERSION.EVENT_NAME, {
        send_to: GA_CONVERSION.SEND_TO,
        value,
        currency: GA_CONVERSION.CURRENCY,
        // transaction_id = lead_id → dedupe + offline conversion upload futuro
        transaction_id: payload.lead_id
      });

      // Evento custom de GA4 para reporting interno (opcional pero útil).
      // Si tienen GA4 configurado, esto les da un evento "generate_lead"
      // estándar que se usa en muchos dashboards out-of-the-box.
      gtag('event', 'generate_lead', {
        currency: GA_CONVERSION.CURRENCY,
        value,
        lead_id: payload.lead_id,
        // Scoring (mismas etiquetas que el CRM, para que GA4 y CRM sean comparables)
        lead_score: scoring.score,
        lead_score_bucket: scoring.category,
        // Dimensiones útiles para segmentar leads en GA4:
        source_landing: payload.source.landing,
        form_location: payload.source.form_location,
        device_type: payload.session.device_type,
        country: payload.session.country || 'unknown',
        email_domain_type: payload.contact.email_domain_type,
        // Servicios solicitados (separados por coma, GA4 acepta strings)
        need_services: payload.intent.need.join(',') || 'none_selected',
        preferred_contact: payload.intent.preferred_contact.join(','),
        // Atribución
        utm_source: payload.attribution.utm_source || 'direct',
        utm_medium: payload.attribution.utm_medium || 'none',
        utm_campaign: payload.attribution.utm_campaign || 'none'
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[LeadForm] gtag conversion failed:', err);
    }
  }
}
