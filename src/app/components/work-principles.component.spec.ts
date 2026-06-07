import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { Principle, WorkPrinciplesComponent } from './work-principles.component';

const cards: Principle[] = [
  { icon: 'circle-check', title: 'Lo que sí hacemos', body: 'Construimos software interno.' },
  { icon: 'route', title: 'Cómo trabajamos', body: 'Primero el sistema, después código.' },
  { icon: 'circle-off', title: 'Lo que no hacemos', body: 'No vendemos apps genéricas.' }
];

describe('WorkPrinciplesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPrinciplesComponent]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the heading and one card per principle, each with a Lucide icon', () => {
    const fixture = TestBed.createComponent(WorkPrinciplesComponent);
    fixture.componentRef.setInput('heading', '/principios de trabajo');
    fixture.componentRef.setInput('cards', cards);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.wp-title')?.textContent?.trim()).toBe('/principios de trabajo');

    const cardEls = el.querySelectorAll('.wp-card');
    expect(cardEls.length).toBe(3);

    const titles = [...el.querySelectorAll('.wp-card__title')].map((t) => t.textContent?.trim());
    expect(titles).toEqual(['Lo que sí hacemos', 'Cómo trabajamos', 'Lo que no hacemos']);

    const icons = el.querySelectorAll('.wp-card__icon svg');
    expect(icons.length).toBe(3);

    fixture.destroy();
  });
});
