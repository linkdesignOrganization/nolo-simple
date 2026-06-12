import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ContactPageComponent } from './contact-page';

describe('ContactPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPageComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('renders the three contact cards', () => {
    const fixture = TestBed.createComponent(ContactPageComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const labels = [...el.querySelectorAll('.ct-card__label')].map((n) => n.textContent?.trim());

    expect(labels).toEqual(['Canales', 'Información', 'Áreas de trabajo']);
  });

  it('links the email via mailto and the work areas to /software and /web', () => {
    const fixture = TestBed.createComponent(ContactPageComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    const mailto = el.querySelector('a.ct-row[href^="mailto:"]');
    expect(mailto?.getAttribute('href')).toBe('mailto:hola@sowe.ar');

    const areas = [...el.querySelectorAll('a.ct-area')].map((a) => a.getAttribute('href'));
    expect(areas).toEqual(['/software', '/web']);
  });

  it('renders the site contact footer as the page closing', () => {
    const fixture = TestBed.createComponent(ContactPageComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-contact-footer')).toBeTruthy();
  });
});
