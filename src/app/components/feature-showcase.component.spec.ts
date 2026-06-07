import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { FeatureShowcaseComponent, ShowcaseFeature } from './feature-showcase.component';

const features: ShowcaseFeature[] = [
  { icon: 'globe-check', label: 'Online' },
  { icon: 'monitor-smartphone', label: 'Responsive' },
  { icon: 'layout-template', label: 'A medida' },
  { icon: 'cloud-sync', label: 'Tiempo real' },
  { icon: 'users', label: 'Multi usuario' },
  { icon: 'shield-check', label: 'Seguro' },
  { icon: 'blocks', label: 'Escalable' },
  { icon: 'cloud-check', label: 'Cloud' },
  { icon: 'git-compare-arrows', label: 'API' },
  { icon: 'workflow', label: 'Integraciones' },
  { icon: 'building-2', label: 'Multi sede' },
  { icon: 'user-round-key', label: 'Roles' },
  { icon: 'search-check', label: 'Trazable' }
];

describe('FeatureShowcaseComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureShowcaseComponent]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the title and one card per feature, each with a Lucide icon and label', () => {
    const fixture = TestBed.createComponent(FeatureShowcaseComponent);
    fixture.componentRef.setInput('title', 'Todo lo que un sistema moderno necesita.');
    fixture.componentRef.setInput('features', features);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.fs-title')?.textContent?.trim()).toBe(
      'Todo lo que un sistema moderno necesita.'
    );

    const cards = el.querySelectorAll('.fs-card');
    expect(cards.length).toBe(13);

    const icons = el.querySelectorAll('.fs-card__box svg');
    expect(icons.length).toBe(13);

    const labels = [...el.querySelectorAll('.fs-card__label')].map((l) => l.textContent?.trim());
    expect(labels).toEqual([
      'Online',
      'Responsive',
      'A medida',
      'Tiempo real',
      'Multi usuario',
      'Seguro',
      'Escalable',
      'Cloud',
      'API',
      'Integraciones',
      'Multi sede',
      'Roles',
      'Trazable'
    ]);

    fixture.destroy();
  });
});
