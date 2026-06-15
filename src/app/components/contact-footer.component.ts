import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LanguageService } from '../services/language.service';
import { LocalizeUrlPipe } from '../services/localize-url.pipe';
import { AdsService } from '../services/ads.service';
import { LeadFormService, LeadSubmitContext } from '../lead-form/services/lead-form.service';
import { LeadFormRawValue } from '../lead-form/models/lead-payload.model';
import { NeedOption, PreferredContactOption } from '../lead-form/models/lead-form-options';
import {
  LucideCalendar,
  LucideCheck,
  LucideCopy,
  LucideMail,
  LucideMessageCircle,
  LucidePhone
} from '@lucide/angular';

export type ContactInfo = {
  calendarLink: string;
  // Link de reunión en inglés (cal.com). Opcional: si falta, se usa calendarLink.
  calendarLinkEn?: string;
  email: string;
  location: string;
  whatsappLink: string;
};

/**
 * Contexto del sistema cuando el form vive en una página /software/<slug>.
 * Sirve para identificar mejor el lead del lado del CRM (qué sistema estaba viendo).
 */
export type SystemContext = {
  /** Nombre legible del sistema, ya resuelto al idioma activo (ej. "CRM a medida"). */
  name: string;
  /** Slug de la URL (ej. "crm-a-medida"). */
  slug: string;
};

type NeedChip = { key: string; es: string; en: string };
type ContactMethod = { key: string; icon: 'mail' | 'message' | 'phone'; es: string; en: string };

// Mapeo de las keys del form al contrato exacto que espera el CRM.
const NEED_MAP: Record<string, NeedOption> = {
  software: 'software_a_medida',
  web: 'sitio_web',
  ecommerce: 'ecommerce',
  other: 'otro'
};
const CONTACT_MAP: Record<string, PreferredContactOption> = {
  email: 'correo',
  whatsapp: 'whatsapp',
  call: 'llamada'
};

@Component({
  selector: 'app-contact-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LocalizeUrlPipe,
    LucideMail,
    LucidePhone,
    LucideCopy,
    LucideCalendar,
    LucideMessageCircle,
    LucideCheck
  ],
  host: {
    'class': 'contact-footer'
  },
  template: `
    <div class="cf-inner">
      <aside class="cf-aside">
        <h2 class="cf-title">{{ t().title }}</h2>
        <p class="cf-sub">{{ t().sub }}</p>

        <ul class="cf-contacts">
          <li class="cf-contact">
            <span class="cf-contact__icon" aria-hidden="true">
              <svg lucideMail [size]="20" [strokeWidth]="1"></svg>
            </span>
            <span class="cf-contact__label">{{ info().email }}</span>
            <button
              type="button"
              class="cf-copy"
              [attr.aria-label]="copied() ? t().copied : t().copy"
              (click)="copyEmail()"
            >
              @if (copied()) {
                <svg lucideCheck [size]="16" [strokeWidth]="1.5"></svg>
              } @else {
                <svg lucideCopy [size]="16" [strokeWidth]="1"></svg>
              }
            </button>
          </li>

          <li class="cf-contact">
            <a class="cf-contact__link" [href]="info().whatsappLink" (click)="onWhatsapp()">
              <span class="cf-contact__icon" aria-hidden="true">
                <svg lucideMessageCircle [size]="20" [strokeWidth]="1"></svg>
              </span>
              <span class="cf-contact__label">{{ t().whatsapp }}</span>
            </a>
          </li>

          <li class="cf-contact">
            <a class="cf-contact__link" [href]="lang() === 'en' && info().calendarLinkEn ? info().calendarLinkEn : info().calendarLink" target="_blank" rel="noopener noreferrer" (click)="onSchedule()">
              <span class="cf-contact__icon" aria-hidden="true">
                <svg lucideCalendar [size]="20" [strokeWidth]="1"></svg>
              </span>
              <span class="cf-contact__label">{{ t().calendar }}</span>
            </a>
          </li>
        </ul>

        <p class="cf-location">{{ info().location }}</p>
      </aside>

      <form class="cf-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (sent()) {
          <div class="cf-sent" role="status">
            <span class="cf-sent__icon" aria-hidden="true">
              <svg lucideCheck [size]="30" [strokeWidth]="1.5"></svg>
            </span>
            <h3>{{ t().sentTitle }}</h3>
            <p>{{ t().sentBody }}</p>
          </div>
        } @else {
          <div class="cf-grid">
            <div class="cf-field">
              <label for="cf-name">{{ t().name }} <span class="cf-req" aria-hidden="true">*</span></label>
              <input
                id="cf-name"
                type="text"
                formControlName="name"
                [placeholder]="t().namePh"
                autocomplete="name"
                [attr.aria-invalid]="invalid('name') || null"
              />
              @if (invalid('name')) {
                <span class="cf-error">{{ t().nameErr }}</span>
              }
            </div>

            <div class="cf-field">
              <label for="cf-company">{{ t().company }}</label>
              <input
                id="cf-company"
                type="text"
                formControlName="company"
                [placeholder]="t().companyPh"
                autocomplete="organization"
              />
            </div>

            <div class="cf-field">
              <label for="cf-email">{{ t().email }} <span class="cf-req" aria-hidden="true">*</span></label>
              <input
                id="cf-email"
                type="email"
                formControlName="email"
                [placeholder]="t().emailPh"
                autocomplete="email"
                [attr.aria-invalid]="invalid('email') || null"
              />
              @if (invalid('email')) {
                <span class="cf-error">{{ t().emailErr }}</span>
              }
            </div>

            <div class="cf-field">
              <label for="cf-phone">{{ t().phone }} <span class="cf-req" aria-hidden="true">*</span></label>
              <input
                id="cf-phone"
                type="tel"
                formControlName="phone"
                [placeholder]="t().phonePh"
                autocomplete="tel"
                [attr.aria-invalid]="invalid('phone') || null"
              />
              @if (invalid('phone')) {
                <span class="cf-error">{{ t().phoneErr }}</span>
              }
            </div>
          </div>

          <div class="cf-chips-row">
            <fieldset class="cf-chips">
              <legend class="cf-chips__label">{{ t().needsLegend }}</legend>
              <div class="cf-chips__row">
                @for (need of NEEDS; track need.key) {
                  <button
                    type="button"
                    class="cf-chip"
                    [class.is-active]="isNeed(need.key)"
                    [attr.aria-pressed]="isNeed(need.key)"
                    (click)="toggleNeed(need.key)"
                  >
                    {{ need[lang()] }}
                  </button>
                }
              </div>
            </fieldset>

            <fieldset class="cf-chips">
              <legend class="cf-chips__label">
                {{ t().contactLegend }} <span class="cf-req" aria-hidden="true">*</span>
              </legend>
              <div class="cf-chips__row">
                @for (method of CONTACT_METHODS; track method.key) {
                  <button
                    type="button"
                    class="cf-chip cf-chip--icon"
                    [class.is-active]="isContact(method.key)"
                    [attr.aria-pressed]="isContact(method.key)"
                    (click)="toggleContact(method.key)"
                  >
                    @switch (method.icon) {
                      @case ('mail') { <svg lucideMail [size]="14" [strokeWidth]="1"></svg> }
                      @case ('message') { <svg lucideMessageCircle [size]="14" [strokeWidth]="1"></svg> }
                      @case ('phone') { <svg lucidePhone [size]="14" [strokeWidth]="1"></svg> }
                    }
                    <span>{{ method[lang()] }}</span>
                  </button>
                }
              </div>
              @if (submitted() && contactPrefs().size === 0) {
                <span class="cf-error">{{ t().contactErr }}</span>
              }
            </fieldset>
          </div>

          <div class="cf-field">
            <label for="cf-message">{{ t().message }}</label>
            <textarea
              id="cf-message"
              formControlName="message"
              rows="4"
              [placeholder]="t().messagePh"
            ></textarea>
          </div>

          @if (submitError()) {
            <p class="cf-error" role="alert">{{ submitError() }}</p>
          }
          <button type="submit" class="cf-submit" [disabled]="submitting()">
            <span>{{ submitting() ? t().sending : t().submit }}</span>
            <span class="cf-submit__arrow" aria-hidden="true">→</span>
          </button>
        }
      </form>
    </div>

    <div class="cf-legal">
      <p class="cf-legal__copy">© {{ year }} Nolõ. {{ t().rights }}</p>
      <a class="cf-legal__link" [routerLink]="'/politicas-de-privacidad' | localizeUrl">{{ t().privacy }}</a>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
      /* Bottom chico: la barra legal es el cierre real del sitio, sin colchón debajo. */
      padding: var(--section-py) 0 clamp(1.8rem, 3.5vw, 2.5rem);
    }

    /* Fondo full-bleed: toma --surface (negro en tema oscuro) y tapa la grilla en los márgenes.
       Es la última sección → el negro llega hasta el fondo. */
    :host::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: var(--surface);
      transition: background-color 450ms ease;
    }

    .cf-inner {
      display: grid;
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
      gap: clamp(2.5rem, 5vw, 5rem);
      align-items: start;
    }

    /* Columna izquierda: datos de contacto. Texto claro hardcodeado (en oscuro --ink sigue negro). */
    .cf-title {
      margin: 0;
      max-width: 12ch;
      color: #f4f4f4;
      font-size: clamp(2.4rem, 5vw, 4rem);
      font-weight: 500;
      letter-spacing: -0.045em;
      line-height: 1;
      text-wrap: balance;
    }

    .cf-sub {
      margin: 1.3rem 0 0;
      color: #b2b2b2;
      font-family: var(--font-mono);
      font-size: 0.9rem;
    }

    .cf-contacts {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      margin: clamp(2rem, 4vw, 3rem) 0 0;
      padding: 0;
      list-style: none;
    }

    .cf-contact {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .cf-contact__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: #f0f0f0;
    }

    .cf-contact__label {
      color: #f0f0f0;
      font-size: 1.05rem;
    }

    .cf-contact__link {
      display: inline-flex;
      align-items: center;
      gap: 0.85rem;
      color: #f0f0f0;
      text-decoration: none;
      transition: color 180ms ease;
    }

    .cf-contact__link:hover .cf-contact__label,
    .cf-contact__link:focus-visible .cf-contact__label {
      color: #ffffff;
    }

    .cf-contact__link:hover .cf-contact__icon,
    .cf-contact__link:focus-visible .cf-contact__icon {
      color: var(--accent);
    }

    .cf-copy {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.3rem;
      border: 0;
      background: none;
      color: #8a8a8a;
      cursor: pointer;
      transition: color 180ms ease;
    }

    .cf-copy:hover,
    .cf-copy:focus-visible {
      color: #ffffff;
      outline: none;
    }

    .cf-location {
      margin: 1.6rem 0 0;
      color: #8a8a8a;
      font-family: var(--font-mono);
      font-size: 0.85rem;
    }

    /* Columna derecha: form minimal, sin panel ni cajas. Cada campo es una sola línea
       inferior (como el website): label en mayúsculas y el input en mono sobre el negro.
       Flex column para poder alinear el botón a la derecha. */
    .cf-form {
      display: flex;
      flex-direction: column;
      padding: 0;
    }

    .cf-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: clamp(1.1rem, 2.2vw, 1.5rem);
    }

    .cf-field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .cf-field label {
      color: #ececec;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .cf-req {
      color: var(--accent);
    }

    .cf-field input,
    .cf-field textarea {
      width: 100%;
      padding: 0.35rem 0;
      border: 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 0;
      background: transparent;
      color: #f0f0f0;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      transition: border-color 160ms ease;
    }

    .cf-field textarea {
      min-height: 4rem;
      resize: vertical;
    }

    .cf-field input::placeholder,
    .cf-field textarea::placeholder {
      color: #6f6f6f;
    }

    .cf-field input:focus,
    .cf-field textarea:focus {
      outline: none;
      border-bottom-color: var(--accent);
    }

    .cf-field input[aria-invalid='true'],
    .cf-field textarea[aria-invalid='true'] {
      border-bottom-color: #ff7a7a;
    }

    .cf-error {
      color: #ff9090;
      font-size: 0.72rem;
    }

    /* Los dos grupos de chips, uno al lado del otro. */
    .cf-chips-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: clamp(1.2rem, 2.4vw, 2.2rem);
      margin: clamp(1.2rem, 2.4vw, 1.7rem) 0 0;
    }

    /* Chips seleccionables (multi). Mismo lenguaje que el resto: acento al activar. */
    .cf-chips {
      margin: 0;
      padding: 0;
      border: 0;
      min-width: 0;
    }

    .cf-chips__label {
      margin-bottom: 0.65rem;
      padding: 0;
      color: #ececec;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .cf-chips__row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .cf-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.32rem 0.62rem;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 0.5rem;
      background: transparent;
      color: #d6d6d6;
      font: inherit;
      font-size: 0.74rem;
      cursor: pointer;
      transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
    }

    .cf-chip:hover {
      border-color: rgba(255, 255, 255, 0.4);
      color: #ffffff;
    }

    .cf-chip:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .cf-chip.is-active {
      border-color: var(--accent);
      background: rgba(61, 81, 255, 0.18);
      color: #ffffff;
    }

    /* Aire entre los chips y el campo Mensaje. */
    .cf-chips-row + .cf-field {
      margin-top: clamp(1.2rem, 2.4vw, 1.7rem);
    }

    /* Botón de envío: azul compacto, alineado a la derecha del form (no full-width). */
    .cf-submit {
      display: inline-flex;
      align-self: flex-end;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: auto;
      margin-top: clamp(1.4rem, 2.6vw, 1.9rem);
      padding: 0.7rem 1.3rem;
      border: 0;
      border-radius: 0.6rem;
      background: var(--accent);
      color: #ffffff;
      font: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      cursor: pointer;
      transition: background-color 180ms ease, transform 180ms ease;
    }

    .cf-submit:hover {
      background: #2f43f0;
      transform: translateY(-1px);
    }

    .cf-submit:focus-visible {
      outline: 2px solid #ffffff;
      outline-offset: 2px;
    }

    .cf-submit__arrow {
      font-size: 0.95rem;
    }

    /* Estado enviado: centrado en su columna, con un check de acento animado
       (pop-in + el trazo que se dibuja + un anillo que late) que acompaña al mensaje. */
    .cf-sent {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-height: clamp(14rem, 30vh, 20rem);
      padding: clamp(2rem, 5vw, 4rem) 0;
    }

    .cf-sent__icon {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1.5rem;
      border: 1px solid var(--accent);
      border-radius: 999px;
      background: rgba(61, 81, 255, 0.14);
      color: var(--accent);
      animation: cf-sent-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    /* Anillo que emana del check (latido sutil, en bucle). */
    .cf-sent__icon::after {
      content: '';
      position: absolute;
      inset: -1px;
      border: 1px solid var(--accent);
      border-radius: 999px;
      opacity: 0;
      animation: cf-sent-ring 2.4s ease-out 360ms infinite;
    }

    /* El check se dibuja solo al aparecer. */
    .cf-sent__icon svg {
      position: relative;
    }

    .cf-sent__icon svg path {
      stroke-dasharray: 28;
      stroke-dashoffset: 28;
      animation: cf-sent-check 460ms ease 300ms forwards;
    }

    @keyframes cf-sent-pop {
      0% {
        transform: scale(0.4);
        opacity: 0;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes cf-sent-ring {
      0% {
        transform: scale(1);
        opacity: 0.5;
      }
      80% {
        transform: scale(1.6);
        opacity: 0;
      }
      100% {
        transform: scale(1.6);
        opacity: 0;
      }
    }

    @keyframes cf-sent-check {
      to {
        stroke-dashoffset: 0;
      }
    }

    .cf-sent h3 {
      margin: 0 0 0.6rem;
      color: #f4f4f4;
      font-size: clamp(1.4rem, 2.5vw, 1.9rem);
      font-weight: 500;
      letter-spacing: -0.02em;
    }

    .cf-sent p {
      margin: 0;
      color: #b2b2b2;
      font-size: 1rem;
      line-height: 1.6;
    }

    /* Barra de cierre del sitio: copyright + privacidad, centrada. */
    .cf-legal {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;
      margin-top: clamp(3.5rem, 6vw, 5.5rem);
      text-align: center;
    }

    .cf-legal__copy {
      margin: 0;
      color: #9a9a9a;
      font-size: 0.92rem;
      letter-spacing: 0.01em;
    }

    .cf-legal__link {
      color: #c4c4c4;
      font-size: 0.92rem;
      text-decoration: none;
      transition: color 180ms ease;
    }

    .cf-legal__link:hover,
    .cf-legal__link:focus-visible {
      color: #ffffff;
    }

    @media (prefers-reduced-motion: reduce) {
      .cf-contact__link,
      .cf-copy,
      .cf-field input,
      .cf-field textarea,
      .cf-chip,
      .cf-legal__link,
      .cf-submit {
        transition: none;
      }

      .cf-submit:hover {
        transform: none;
      }

      .cf-sent__icon,
      .cf-sent__icon::after,
      .cf-sent__icon svg path {
        animation: none;
      }

      .cf-sent__icon svg path {
        stroke-dashoffset: 0;
      }
    }

    @media (max-width: 860px) {
      .cf-inner {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
    }

    /* Mobile: subir el cuerpo gris a casi-blanco para que se lea bien (en desktop el texto es mayor). */
    @media (max-width: 760px) {
      .cf-sub,
      .cf-sent p {
        color: #f4f4f4;
      }
    }

    @media (max-width: 560px) {
      .cf-grid,
      .cf-chips-row {
        grid-template-columns: 1fr;
      }

      /* Apilado a 1 columna: más aire vertical entre campos (los gap pensados para 2 columnas colapsaban). */
      .cf-grid {
        gap: 1.6rem;
      }

      .cf-field {
        gap: 0.5rem;
      }

      .cf-chips-row {
        gap: 1.5rem;
        margin-top: 1.7rem;
      }

      .cf-chips-row + .cf-field {
        margin-top: 1.7rem;
      }

      .cf-submit {
        align-self: stretch;
        width: 100%;
      }
    }
  `
})
export class ContactFooterComponent {
  readonly info = input.required<ContactInfo>();

  /**
   * Contexto opcional del sistema cuando el form se renderiza en una página /software/<slug>.
   * Si está presente, se antepone una línea al mensaje del lead para que el CRM identifique
   * qué sistema estaba viendo. Es el único canal viable sin redeploy del CRM: `message` es el
   * campo que viaja en el payload Y se muestra en el email de aviso a hola@nolo.ar; un campo
   * nuevo en el payload lo descartaría el esquema Zod del CRM (z.object → strip de claves
   * desconocidas). En el resto del sitio el input va ausente y el mensaje no se toca.
   */
  readonly systemContext = input<SystemContext | null>(null);

  private readonly i18n = inject(LanguageService);
  private readonly ads = inject(AdsService);
  protected readonly lang = this.i18n.lang;
  protected readonly t = computed(() => FOOTER_TEXT[this.lang()]);

  protected readonly year = new Date().getFullYear();

  protected readonly NEEDS: NeedChip[] = [
    { key: 'software', es: 'Software a medida', en: 'Custom software' },
    { key: 'web', es: 'Sitio web', en: 'Website' },
    { key: 'ecommerce', es: 'E-commerce', en: 'E-commerce' },
    { key: 'other', es: 'Otro', en: 'Other' }
  ];
  protected readonly CONTACT_METHODS: ContactMethod[] = [
    { key: 'email', icon: 'mail', es: 'Correo', en: 'Email' },
    { key: 'whatsapp', icon: 'message', es: 'WhatsApp', en: 'WhatsApp' },
    { key: 'call', icon: 'phone', es: 'Llamada', en: 'Call' }
  ];

  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    company: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    message: ['']
  });

  // Chips multi-selección: un Set por grupo; cada toggle crea un Set nuevo (OnPush refresca).
  protected readonly needs = signal<ReadonlySet<string>>(new Set());
  protected readonly contactPrefs = signal<ReadonlySet<string>>(new Set());

  protected readonly submitted = signal(false);
  protected readonly sent = signal(false);
  protected readonly copied = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  // CRM: servicio + contexto anti-spam (tiempo en el form + nº de interacciones).
  private readonly leadForm = inject(LeadFormService);
  private readonly formLoadedAt = Date.now();
  private interactionCount = 0;

  constructor() {
    // Cada cambio del form cuenta como interacción (anti-spam mínimo: ≥1).
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.interactionCount += 1;
    });
  }

  protected isNeed(label: string): boolean {
    return this.needs().has(label);
  }

  protected isContact(label: string): boolean {
    return this.contactPrefs().has(label);
  }

  protected toggleNeed(label: string): void {
    this.needs.set(toggleInSet(this.needs(), label));
  }

  protected toggleContact(label: string): void {
    this.contactPrefs.set(toggleInSet(this.contactPrefs(), label));
  }

  // Inválido y ya "tocado" (o tras intentar enviar): así no marcamos errores antes de tiempo.
  protected invalid(control: 'email' | 'name' | 'phone'): boolean {
    const ctrl = this.form.get(control);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted());
  }

  protected submit(): void {
    this.submitted.set(true);
    this.submitError.set(null);

    // El grupo de contacto es requerido (≥1); los campos los valida el FormGroup.
    if (this.form.invalid || this.contactPrefs().size === 0) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);

    const v = this.form.getRawValue();
    const raw: LeadFormRawValue = {
      name: v.name,
      company: v.company,
      email: v.email,
      phone: v.phone,
      message: this.withSystemContext(v.message),
      need: [...this.needs()].map((k) => NEED_MAP[k]).filter((x): x is NeedOption => !!x),
      preferred_contact: [...this.contactPrefs()]
        .map((k) => CONTACT_MAP[k])
        .filter((x): x is PreferredContactOption => !!x),
      // Honeypots: el form visible no los expone, así que van vacíos (= humano).
      website: '',
      url: ''
    };
    const context: LeadSubmitContext = {
      formLocation: 'footer',
      formLoadedAt: this.formLoadedAt,
      interactionCount: this.interactionCount
    };

    this.leadForm.submit(raw, context).subscribe((result) => {
      this.submitting.set(false);
      // 'spam_detected' se trata como éxito visual (no se le informa al bot).
      if (result.status === 'success' || result.status === 'spam_detected') {
        this.sent.set(true);
      } else {
        this.submitError.set(result.message);
      }
    });
  }

  // Si el form viene de la página de un sistema, antepone una línea limpia y legible al
  // mensaje para que el CRM (email de aviso + detalle) identifique qué sistema veía el lead.
  // Si no hay contexto, devuelve el mensaje sin tocar. El prefijo es corto (no arriesga el
  // tope de 1000 chars que recorta el sanitizado del servicio).
  private withSystemContext(message: string): string {
    const sys = this.systemContext();
    if (!sys) {
      return message;
    }
    const note =
      this.lang() === 'en'
        ? `[Lead from the system page: ${sys.name}]`
        : `[Consulta desde la página del sistema: ${sys.name}]`;
    const body = message.trim();
    return body ? `${note}\n\n${body}` : note;
  }

  protected copyEmail(): void {
    this.ads.emailCopy();
    const email = this.info().email;
    const clip = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (!clip) {
      return;
    }
    clip
      .writeText(email)
      .then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 1800);
      })
      .catch(() => {});
  }

  protected onWhatsapp(): void {
    this.ads.whatsapp();
  }

  protected onSchedule(): void {
    this.ads.scheduleMeeting();
  }
}

function toggleInSet(current: ReadonlySet<string>, value: string): ReadonlySet<string> {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

const FOOTER_TEXT = {
  es: {
    title: 'Comencemos a trabajar hoy',
    sub: 'Esperamos tu mensaje',
    whatsapp: 'Mandar WhatsApp',
    calendar: 'Agendar reunión',
    copy: 'Copiar correo',
    copied: 'Correo copiado',
    name: 'Nombre',
    company: 'Empresa',
    email: 'Correo',
    phone: 'WhatsApp / Teléfono',
    message: 'Mensaje',
    namePh: 'Tu nombre',
    companyPh: 'Nombre de tu empresa (opcional)',
    emailPh: 'tu@correo.com',
    phonePh: '+54 11 5555 5555',
    messagePh: 'Contanos un poco sobre tu proyecto (opcional)',
    nameErr: 'Ingresá tu nombre.',
    emailErr: 'Ingresá un correo válido.',
    phoneErr: 'Ingresá un teléfono o WhatsApp.',
    needsLegend: '¿Qué necesitás?',
    contactLegend: '¿Cómo te contactamos?',
    contactErr: 'Elegí al menos una opción.',
    submit: 'Enviar mensaje',
    sending: 'Enviando…',
    sentTitle: '¡Listo! Te escribimos pronto.',
    sentBody: 'Gracias por tu mensaje. Te respondemos a la brevedad.',
    rights: 'Todos los derechos reservados.',
    privacy: 'Política de privacidad'
  },
  en: {
    title: "Let's build something",
    sub: "Tell us what you're building.",
    whatsapp: 'Message on WhatsApp',
    calendar: 'Book a meeting',
    copy: 'Copy email',
    copied: 'Email copied',
    name: 'Name',
    company: 'Company',
    email: 'Email',
    phone: 'WhatsApp / Phone',
    message: 'Message',
    namePh: 'Your name',
    companyPh: 'Your company (optional)',
    emailPh: 'you@email.com',
    phonePh: '+54 11 5555 5555',
    messagePh: 'Tell us a bit about your project (optional)',
    nameErr: 'Enter your name.',
    emailErr: 'Enter a valid email.',
    phoneErr: 'Enter a phone number or WhatsApp.',
    needsLegend: 'What do you need?',
    contactLegend: 'How should we reach you?',
    contactErr: 'Choose at least one option.',
    submit: 'Send message',
    sending: 'Sending…',
    sentTitle: "Got it! We'll be in touch soon.",
    sentBody: "Thanks for your message. We'll get back to you shortly.",
    rights: 'All rights reserved.',
    privacy: 'Privacy policy'
  }
} as const;
