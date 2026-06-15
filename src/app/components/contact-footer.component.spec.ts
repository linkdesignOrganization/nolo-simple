import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ContactFooterComponent, ContactInfo } from './contact-footer.component';

const info: ContactInfo = {
  email: 'hola@test.com',
  location: 'CABA, Argentina',
  whatsappLink: '#',
  calendarLink: '#'
};

function createFixture() {
  const fixture = TestBed.createComponent(ContactFooterComponent);
  fixture.componentRef.setInput('info', info);
  fixture.detectChanges();
  return fixture;
}

function setValue(root: HTMLElement, selector: string, value: string): void {
  const input = root.querySelector<HTMLInputElement>(selector)!;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function submitForm(root: HTMLElement): void {
  root.querySelector('.cf-form')!.dispatchEvent(new Event('submit'));
}

describe('ContactFooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFooterComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('renders the heading, the contact email, the fields, 7 chips and the submit button', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.cf-title')?.textContent?.trim()).toBe('Comencemos a trabajar hoy');
    expect(el.querySelector('.cf-contact__label')?.textContent?.trim()).toBe('hola@test.com');

    expect(el.querySelector('#cf-name')).toBeTruthy();
    expect(el.querySelector('#cf-company')).toBeTruthy();
    expect(el.querySelector('#cf-email')).toBeTruthy();
    expect(el.querySelector('#cf-phone')).toBeTruthy();
    expect(el.querySelector('#cf-message')).toBeTruthy();

    // 4 necesidades + 3 métodos de contacto.
    expect(el.querySelectorAll('.cf-chip').length).toBe(7);
    expect(el.querySelector('.cf-submit')?.textContent).toContain('Enviar mensaje');

    // Barra de cierre: copyright con la marca + link de privacidad.
    expect(el.querySelector('.cf-legal__copy')?.textContent).toContain('Nolõ');
    expect(el.querySelector('.cf-legal__link')?.textContent?.trim()).toBe('Política de privacidad');

    fixture.destroy();
  });

  it('toggles need chips independently (multi-select)', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;

    const needChips = [
      ...el.querySelectorAll('.cf-chips')[0].querySelectorAll<HTMLButtonElement>('.cf-chip')
    ];

    needChips[0].click();
    needChips[2].click();
    fixture.detectChanges();

    expect(needChips[0].getAttribute('aria-pressed')).toBe('true');
    expect(needChips[1].getAttribute('aria-pressed')).toBe('false');
    expect(needChips[2].getAttribute('aria-pressed')).toBe('true');

    fixture.destroy();
  });

  it('does not confirm an empty or incomplete submit, confirms when valid with a contact method', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;

    // Submit vacío: no confirma.
    submitForm(el);
    fixture.detectChanges();
    expect(el.querySelector('.cf-sent')).toBeNull();

    // Campos requeridos completos, pero sin método de contacto: tampoco confirma.
    setValue(el, '#cf-name', 'Ada');
    setValue(el, '#cf-email', 'ada@test.com');
    setValue(el, '#cf-phone', '+54 11 5555 5555');
    submitForm(el);
    fixture.detectChanges();
    expect(el.querySelector('.cf-sent')).toBeNull();

    // Con un método de contacto elegido (segundo grupo de chips): confirma.
    const contactChips = el.querySelectorAll('.cf-chips')[1].querySelectorAll<HTMLButtonElement>(
      '.cf-chip'
    );
    contactChips[0].click();
    fixture.detectChanges();

    submitForm(el);
    fixture.detectChanges();
    expect(el.querySelector('.cf-sent')).toBeTruthy();

    fixture.destroy();
  });
});
