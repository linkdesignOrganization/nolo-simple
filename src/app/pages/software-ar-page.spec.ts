import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, vi } from 'vitest';

import { AdsService } from '../services/ads.service';
import { LanguageService } from '../services/language.service';
import { SoftwareArPageComponent } from './software-ar-page';

// Los dos botones del hero del hub son los mismos que en /software, /web y el home:
// tienen que reportar la misma conversión a Google Ads y abrir el calendario del idioma activo.
describe('SoftwareArPageComponent · botones del hero', () => {
  const ads = { scheduleMeeting: vi.fn(), whatsapp: vi.fn(), emailCopy: vi.fn(), scroll: vi.fn() };

  beforeEach(async () => {
    // Otros componentes de la página observan el scroll; jsdom no trae IntersectionObserver.
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    ads.scheduleMeeting.mockClear();
    ads.whatsapp.mockClear();
    await TestBed.configureTestingModule({
      imports: [SoftwareArPageComponent],
      providers: [provideRouter([]), { provide: AdsService, useValue: ads }],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(LanguageService).set('es');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function render(lang: 'es' | 'en') {
    TestBed.inject(LanguageService).set(lang);
    const fixture = TestBed.createComponent(SoftwareArPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return [...el.querySelectorAll<HTMLAnchorElement>('.sc-hero__actions a.button')];
  }

  // Click real en el enlace; el preventDefault en el documento evita que jsdom intente navegar.
  function click(a: HTMLAnchorElement) {
    a.ownerDocument.addEventListener('click', (e) => e.preventDefault(), { once: true });
    a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  it('«Agendá una reunión» reporta la conversión de agendar y «WhatsApp» la de WhatsApp', () => {
    const [meeting, whatsapp] = render('es');
    expect(meeting.getAttribute('href')).toContain('cal.com');
    expect(whatsapp.getAttribute('href')).toBe('https://wa.me/5491133337180');

    click(meeting);
    expect(ads.scheduleMeeting).toHaveBeenCalledTimes(1);
    expect(ads.whatsapp).not.toHaveBeenCalled();

    click(whatsapp);
    expect(ads.whatsapp).toHaveBeenCalledTimes(1);
    expect(ads.scheduleMeeting).toHaveBeenCalledTimes(1);
  });

  it('abre el calendario del idioma activo: ES en español, EN en inglés', () => {
    expect(render('es')[0].getAttribute('href')).toBe(
      'https://cal.com/nolo.ar/reunion-con-equipo-nolo',
    );
    expect(render('en')[0].getAttribute('href')).toBe(
      'https://cal.com/nolo.ar/meeting-with-nolo-team',
    );
  });
});
