import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, vi } from 'vitest';

import { LandingData, LandingPageComponent } from './landing-page';

const homePage: LandingData = {
  description: 'Home test page',
  eyebrow: 'Sowe / 001',
  homeArms: [
    {
      body: 'Construimos software a medida.',
      cta: 'Entrar a Software',
      eyebrow: '/software',
      route: '/software',
      title: 'software a la medida',
      type: 'software'
    },
    {
      body: 'Diseñamos webs a medida.',
      cta: 'Entrar a Web',
      eyebrow: '/website',
      route: '/website',
      title: 'website a la medida',
      type: 'web'
    }
  ],
  isHome: true,
  stats: [],
  title: 'Dos brazos. Un mismo criterio.'
};

describe('LandingPageComponent', () => {
  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ es: homePage, en: homePage }),
            snapshot: { data: { es: homePage, en: homePage } }
          }
        }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders one decorative canvas per home arm without removing the CTAs', async () => {
    const fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const canvases = element.querySelectorAll('app-technical-grid-background canvas');
    const ctas = Array.from(element.querySelectorAll('.arm-button')).map((button) =>
      button.textContent?.replace('→', '').trim()
    );

    expect(canvases.length).toBe(2);
    expect(ctas).toEqual(['Entrar a Software', 'Entrar a Web']);
  });
});
