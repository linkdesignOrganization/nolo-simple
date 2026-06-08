import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import {
  TechnicalGridBackgroundComponent,
  TechnicalGridMode
} from './technical-grid-background.component';

@Component({
  selector: '[appTechnicalGridSurface]',
  standalone: true,
  imports: [TechnicalGridBackgroundComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'technical-grid-surface'
  },
  template: `
    @if (!gridDisabled()) {
      <app-technical-grid-background
        class="technical-grid-surface__artifact"
        [mode]="gridMode()"
        [cellSize]="gridCellSize()"
        [influenceRadius]="gridInfluenceRadius()"
        [seed]="gridSeed()"
        [viewport]="gridViewport()"
      />
    }
    <ng-content />
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      isolation: isolate;
      overflow: clip;
    }

    :host > .technical-grid-surface__artifact {
      z-index: 0;
    }

    :host > :not(.technical-grid-surface__artifact) {
      position: relative;
      z-index: var(--technical-grid-content-z, 1);
    }
  `
})
export class TechnicalGridSurfaceComponent {
  readonly gridDisabled = input(false, {
    alias: 'appTechnicalGridDisabled'
  });
  readonly gridMode = input<TechnicalGridMode | null>(null, {
    alias: 'appTechnicalGridMode'
  });
  readonly gridCellSize = input<number | null>(null, {
    alias: 'appTechnicalGridCellSize'
  });
  readonly gridInfluenceRadius = input<number | null>(null, {
    alias: 'appTechnicalGridInfluenceRadius'
  });
  readonly gridSeed = input<number>(0, {
    alias: 'appTechnicalGridSeed'
  });
  // Limita el render del artefacto al viewport (no a toda la página). Para el shell full-page.
  readonly gridViewport = input(false, {
    alias: 'appTechnicalGridViewport'
  });
}
