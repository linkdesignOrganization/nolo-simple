import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, vi } from 'vitest';

import { AdsService } from '../services/ads.service';
import { LanguageService } from '../services/language.service';
import { SoftwareArCasePageComponent } from './software-ar-case-page';

// El botón «Agendar reunión de 30 minutos» de la sección de precio de cada ficha es el mismo
// que en el resto del sitio: reporta la conversión de agendar y abre el calendario del idioma.
describe('SoftwareArCasePageComponent · botón de agendar', () => {
  const ads = { scheduleMeeting: vi.fn(), whatsapp: vi.fn(), emailCopy: vi.fn(), scroll: vi.fn() };
  const params = convertToParamMap({ slug: 'pulso' });

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
    await TestBed.configureTestingModule({
      imports: [SoftwareArCasePageComponent],
      providers: [
        provideRouter([]),
        { provide: AdsService, useValue: ads },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(params), snapshot: { paramMap: params } },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(LanguageService).set('es');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function render(lang: 'es' | 'en') {
    TestBed.inject(LanguageService).set(lang);
    const fixture = TestBed.createComponent(SoftwareArCasePageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const a = el.querySelector<HTMLAnchorElement>('.cc-cost__actions a.button');
    if (!a) throw new Error('no está el botón de agendar de la sección de precio');
    return a;
  }

  it('reporta la conversión de agendar al hacer clic', () => {
    const meeting = render('es');
    meeting.ownerDocument.addEventListener('click', (e) => e.preventDefault(), { once: true });
    meeting.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(ads.scheduleMeeting).toHaveBeenCalledTimes(1);
  });

  it('abre el calendario del idioma activo: ES en español, EN en inglés', () => {
    expect(render('es').getAttribute('href')).toBe(
      'https://cal.com/nolo.ar/reunion-con-equipo-nolo',
    );
    expect(render('en').getAttribute('href')).toBe(
      'https://cal.com/nolo.ar/meeting-with-nolo-team',
    );
  });
});
