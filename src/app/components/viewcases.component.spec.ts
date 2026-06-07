import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { Viewcase, ViewcasesComponent } from './viewcases.component';

const items: Viewcase[] = [
  { label: 'CRM', videoSrc: '/media/software-demo.mp4', link: '#' },
  { label: 'ERP', videoSrc: '/media/software-demo.mp4', link: '#' },
  { label: 'E-commerce', videoSrc: '/media/software-demo.mp4', link: '#' },
  { label: 'Reservas', videoSrc: '/media/software-demo.mp4', link: '#' },
  { label: 'Dashboards', videoSrc: '/media/software-demo.mp4', link: '#' },
  { label: 'Automatización', videoSrc: '/media/software-demo.mp4', link: '#' }
];

describe('ViewcasesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewcasesComponent]
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

    const labels = [...el.querySelectorAll('.vc-panel')].map((p) => p.textContent?.trim());
    expect(labels).toEqual(['CRM', 'ERP', 'E-commerce', 'Reservas', 'Dashboards', 'Automatización']);

    fixture.destroy();
  });
});
