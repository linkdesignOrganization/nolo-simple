import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { TechnicalGridSurfaceComponent } from './technical-grid-surface.component';

@Component({
  standalone: true,
  imports: [TechnicalGridSurfaceComponent],
  template: `
    <section appTechnicalGridSurface [appTechnicalGridSeed]="4">
      <h2>Reusable surface</h2>
      <p>Technical grid content remains intact.</p>
    </section>
  `
})
class TechnicalGridSurfaceHostComponent {}

describe('TechnicalGridSurfaceComponent', () => {
  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    await TestBed.configureTestingModule({
      imports: [TechnicalGridSurfaceHostComponent]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds the decorative canvas to any block host without removing projected content', async () => {
    const fixture = TestBed.createComponent(TechnicalGridSurfaceHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const host = element.querySelector('section');
    const canvas = host?.querySelector('app-technical-grid-background canvas');
    const heading = host?.querySelector('h2')?.textContent?.trim();
    const paragraph = host?.querySelector('p')?.textContent?.trim();

    expect(host?.classList.contains('technical-grid-surface')).toBe(true);
    expect(canvas).toBeTruthy();
    expect(heading).toBe('Reusable surface');
    expect(paragraph).toBe('Technical grid content remains intact.');
  });
});
