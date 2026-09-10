import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, vi } from 'vitest';

import { LanguageService } from '../services/language.service';
import { Viewcase, ViewcasesComponent } from './viewcases.component';

const items: Viewcase[] = [
  { label: 'CRM', category: 'Gestión', videoSrc: '/media/software-demo.mp4', poster: '/media/software-demo-poster.jpg', link: '#' },
  { label: 'ERP', category: 'Operaciones', videoSrc: '/media/software-demo.mp4', poster: '/media/software-demo-poster.jpg', link: '#' },
  { label: 'E-commerce', category: 'Ventas', videoSrc: '/media/software-demo.mp4', poster: '/media/software-demo-poster.jpg', link: '#' },
  { label: 'Reservas', category: 'Agenda', videoSrc: '/media/software-demo.mp4', poster: '/media/software-demo-poster.jpg', link: '#' },
  { label: 'Dashboards', category: 'Analítica', videoSrc: '/media/software-demo.mp4', poster: '/media/software-demo-poster.jpg', link: '#' },
  { label: 'Automatización', category: 'Procesos', videoSrc: '/media/software-demo.mp4', poster: '/media/software-demo-poster.jpg', link: '#' }
];

describe('ViewcasesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewcasesComponent],
      // El enlace de la intro y el botón a la ficha usan routerLink.
      providers: [provideRouter([])]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the heading and one tile per viewcase with a video and a label panel', () => {
    const fixture = TestBed.createComponent(ViewcasesComponent);
    fixture.componentRef.setInput('title', 'Así se ve un sistema hecho a medida.');
    fixture.componentRef.setInput('intro', 'No son capturas.');
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.vc-title')?.textContent?.trim()).toBe(
      'Así se ve un sistema hecho a medida.'
    );

    const tiles = el.querySelectorAll('.vc-tile');
    expect(tiles.length).toBe(6);

    expect(el.querySelectorAll('video').length).toBe(6);

    const labels = [...el.querySelectorAll('.vc-panel__name')].map((p) => p.textContent?.trim());
    expect(labels).toEqual(['CRM', 'ERP', 'E-commerce', 'Reservas', 'Dashboards', 'Automatización']);

    fixture.destroy();
  });

  it('labels the detail button by language and keeps its links inside the active language tree', () => {
    const fixture = TestBed.createComponent(ViewcasesComponent);
    fixture.componentRef.setInput('title', 'Probá un software a medida.');
    fixture.componentRef.setInput('intro', [
      'Cada demo es una versión funcional del ',
      { text: 'software a medida que construimos en Argentina', href: '/desarrollo-de-software-argentina' },
      '.'
    ]);
    fixture.componentRef.setInput('items', [
      { ...items[0], label: 'Pulso', detail: '/desarrollo-de-software-argentina/pulso' },
      items[1]
    ]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const introLink = () => el.querySelector<HTMLAnchorElement>('.vc-intro__link');
    const detail = () => el.querySelector<HTMLAnchorElement>('.vc-panel__detail');
    const longLabel = () =>
      detail()
        ?.querySelector('.vc-panel__detail-label:not(.vc-panel__detail-label--short)')
        ?.textContent?.trim();
    const shortLabel = () =>
      detail()?.querySelector('.vc-panel__detail-label--short')?.textContent?.trim();

    // Solo el item con `detail` muestra el botón; en ES los enlaces van sin prefijo.
    expect(el.querySelectorAll('.vc-panel__detail').length).toBe(1);
    expect(longLabel()).toBe('Ver la ficha');
    expect(shortLabel()).toBe('Ver ficha');
    expect(detail()?.getAttribute('href')).toBe('/desarrollo-de-software-argentina/pulso');
    expect(introLink()?.getAttribute('href')).toBe('/desarrollo-de-software-argentina');

    // En EN cambian los rótulos y los dos enlaces quedan bajo /en.
    TestBed.inject(LanguageService).set('en');
    fixture.detectChanges();

    expect(longLabel()).toBe('See the case');
    expect(shortLabel()).toBe('See case');
    expect(detail()?.getAttribute('href')).toBe('/en/desarrollo-de-software-argentina/pulso');
    expect(introLink()?.getAttribute('href')).toBe('/en/desarrollo-de-software-argentina');

    fixture.destroy();
  });
  it('declares the mobile clip as a media-conditioned source and the full clip as fallback', () => {
    const fixture = TestBed.createComponent(ViewcasesComponent);
    fixture.componentRef.setInput('title', 't');
    fixture.componentRef.setInput('intro', 'i');
    fixture.componentRef.setInput('items', [
      { ...items[0], videoMobileSrc: '/media/software-demo-mobile.mp4' },
      items[1]
    ]);
    fixture.detectChanges();
    const videos = [...(fixture.nativeElement as HTMLElement).querySelectorAll('video')];
    expect(videos.length).toBe(2);
    expect(videos.every((v) => !v.getAttribute('src'))).toBe(true);
    const sources = (v: HTMLVideoElement) => [...v.querySelectorAll('source')].map((s) => [s.getAttribute('media'), s.getAttribute('src')]);
    expect(sources(videos[0])).toEqual([['(max-width: 760px)', '/media/software-demo-mobile.mp4'], [null, items[0].videoSrc]]);
    expect(sources(videos[1])).toEqual([[null, items[1].videoSrc]]);
    fixture.destroy();
  });
});
