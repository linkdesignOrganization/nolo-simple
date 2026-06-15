import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { PortfolioRow, PortfolioTableComponent } from './portfolio-table.component';

const rows: PortfolioRow[] = [
  {
    client: 'Tornos del Sur',
    logo: '',
    industry: 'Metalúrgica',
    projectType: 'Sistema interno + reportes',
    link: 'https://ejemplo-uno.com',
    videoSrc: '/media/software-demo.mp4',
    poster: '/media/software-demo-poster.jpg'
  },
  {
    client: 'Estudio Bertolino',
    logo: '',
    industry: 'Estudio jurídico',
    projectType: 'Corporativo',
    link: 'https://ejemplo-dos.com',
    videoSrc: '/media/software-demo.mp4',
    poster: '/media/software-demo-poster.jpg'
  },
  {
    client: 'Clínica Mendieta',
    logo: '',
    industry: 'Salud',
    projectType: 'Corporativo + reservas',
    link: 'https://ejemplo-tres.com',
    videoSrc: '/media/software-demo.mp4',
    poster: '/media/software-demo-poster.jpg'
  }
];

describe('PortfolioTableComponent', () => {
  beforeEach(async () => {
    // jsdom no implementa play()/pause(); los mockeamos.
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockReturnValue(undefined);
    await TestBed.configureTestingModule({ imports: [PortfolioTableComponent] }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders one external-link row per project with the arrow icon and a single floating video', () => {
    const fixture = TestBed.createComponent(PortfolioTableComponent);
    fixture.componentRef.setInput('rows', rows);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    const rowEls = el.querySelectorAll('.pt-row');
    expect(rowEls.length).toBe(3);

    const clients = [...el.querySelectorAll('.pt-client')].map((n) => n.textContent?.trim());
    expect(clients).toEqual(['Tornos del Sur', 'Estudio Bertolino', 'Clínica Mendieta']);

    rowEls.forEach((a, i) => {
      expect(a.getAttribute('href')).toBe(rows[i].link);
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
      expect(a.querySelector('.pt-arrow svg')).toBeTruthy();
    });

    // Un solo video flotante reutilizado (no uno por fila).
    expect(el.querySelectorAll('.pt-float video').length).toBe(1);

    fixture.destroy();
  });
});
