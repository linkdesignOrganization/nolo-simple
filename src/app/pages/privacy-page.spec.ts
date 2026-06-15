import { TestBed } from '@angular/core/testing';

import { PrivacyPageComponent } from './privacy-page';

describe('PrivacyPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PrivacyPageComponent] }).compileComponents();
  });

  it('renders the title, several sections and a contact email', () => {
    const fixture = TestBed.createComponent(PrivacyPageComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.pp-title')?.textContent?.trim()).toBe('Política de privacidad');
    // 7 secciones del array + "Contacto" manual.
    expect(el.querySelectorAll('.pp-section').length).toBe(8);

    const mailto = el.querySelector('a.pp-link[href^="mailto:"]');
    expect(mailto?.getAttribute('href')).toBe('mailto:hola@nolo.ar');
  });

  it('closes with a simple legal bar mentioning Nolo (no contact footer)', () => {
    const fixture = TestBed.createComponent(PrivacyPageComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.pp-legal')?.textContent).toContain('Nolo');
    expect(el.querySelector('app-contact-footer')).toBeNull();
  });
});
