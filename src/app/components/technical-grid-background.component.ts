import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  input
} from '@angular/core';

export type TechnicalGridMode = 'pointer' | 'ambient' | 'static';

type TechnicalGridPoint = {
  intensity: number;
  memory: number;
  memoryAge: number;
  x: number;
  y: number;
};

type AmbientEmitter = {
  radius: number;
  weight: number;
  x: number;
  y: number;
};

export function selectTechnicalGridMode({
  coarsePointer,
  forcedMode,
  prefersReducedMotion
}: {
  coarsePointer: boolean;
  forcedMode?: TechnicalGridMode | null;
  prefersReducedMotion: boolean;
}): TechnicalGridMode {
  if (forcedMode) {
    return forcedMode;
  }

  if (prefersReducedMotion) {
    return 'static';
  }

  return coarsePointer ? 'ambient' : 'pointer';
}

@Component({
  selector: 'app-technical-grid-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    'class': 'technical-grid-background',
    '[class.technical-grid-background--viewport]': 'viewport()'
  },
  template: ` <canvas #canvas class="technical-grid-background__canvas"></canvas> `,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      display: block;
      pointer-events: none;
      overflow: hidden;
    }

    /* Modo viewport: el canvas se fija al viewport (no a toda la página), así solo renderiza el
       área visible. Para el fondo full-page del shell en /software → ~9× menos trabajo por frame. */
    :host(.technical-grid-background--viewport) {
      position: fixed;
    }

    .technical-grid-background__canvas {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  `
})
export class TechnicalGridBackgroundComponent implements AfterViewInit, OnDestroy {
  private static readonly pointerMemoryDuration = 760;
  private static readonly pointerMemoryFloor = 0.016;
  private static readonly pointerMemoryStrength = 0.48;

  readonly mode = input<TechnicalGridMode | null>(null);
  readonly cellSize = input<number | null>(null);
  readonly influenceRadius = input<number | null>(null);
  readonly seed = input<number>(0);
  // Cuando true, el canvas se dimensiona y posiciona al VIEWPORT (position: fixed), no al contenedor.
  // Para fondos full-page (el shell de /software): evita un canvas de miles de px de alto.
  readonly viewport = input<boolean>(false);

  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly document = inject(DOCUMENT);
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private animationFrameId: number | null = null;
  private canvasContext: CanvasRenderingContext2D | null = null;
  private coarsePointerQuery: MediaQueryList | null = null;
  private dotRgb = '17, 17, 17';
  private gridPath: Path2D | null = null;
  private height = 0;
  private horizontalLines: number[] = [];
  private lastTimestamp = 0;
  private lineColor = 'rgba(17, 17, 17, 0.07)';
  private readonly cleanupFns: Array<() => void> = [];
  private readonly pointer = { active: false, x: 0, y: 0 };
  private pointerListenersAttached = false;
  private pointerListenerTarget: HTMLElement | null = null;
  private points: TechnicalGridPoint[] = [];
  private prefersReducedMotionQuery: MediaQueryList | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resolvedMode: TechnicalGridMode = 'static';
  private verticalLines: number[] = [];
  private width = 0;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      try {
        this.canvasContext = this.canvasRef.nativeElement.getContext('2d');
      } catch {
        this.canvasContext = null;
      }

      if (!this.canvasContext) {
        return;
      }

      this.syncPalette();
      this.setupMediaQueries();
      this.setupResizeHandling();
      this.resolveMode();
      this.syncPointerListeners();
      this.resizeCanvas();
      this.refreshRendering();
    });
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    for (const cleanup of this.cleanupFns) {
      cleanup();
    }

    this.cleanupFns.length = 0;
  }

  private get containerElement(): HTMLElement {
    return this.hostRef.nativeElement.parentElement ?? this.hostRef.nativeElement;
  }

  private get win(): Window | null {
    return this.document.defaultView;
  }

  private readonly handleMediaChange = (): void => {
    const previousMode = this.resolvedMode;
    this.resolveMode();

    if (previousMode === this.resolvedMode) {
      return;
    }

    this.pointer.active = false;
    this.resetPoints();
    this.stopAnimation();
    this.syncPointerListeners();
    this.refreshRendering();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') {
      return;
    }

    // En modo viewport el canvas está fijo al viewport (0,0): el puntero ya viene en esas coordenadas.
    const bounds = this.viewport()
      ? { left: 0, top: 0 }
      : this.containerElement.getBoundingClientRect();

    this.pointer.active = true;
    this.pointer.x = event.clientX - bounds.left;
    this.pointer.y = event.clientY - bounds.top;

    this.startAnimation();
  };

  private readonly handlePointerLeave = (): void => {
    if (!this.pointer.active) {
      return;
    }

    this.pointer.active = false;
    this.startAnimation();
  };

  private readonly handleWindowResize = (): void => {
    this.handleGeometryChange();
  };

  private readonly animate = (timestamp: number): void => {
    this.animationFrameId = null;
    this.resizeCanvas();

    const maxIntensity = this.renderFrame(timestamp);

    if (this.shouldContinueAnimating(maxIntensity)) {
      this.startAnimation();
      return;
    }

    this.resetPoints();
    this.drawScene();
    this.lastTimestamp = 0;
  };

  private buildGrid(): void {
    const cell = this.resolveCellSize();
    const columns = Math.max(2, Math.floor(this.width / cell) + 3);
    const rows = Math.max(2, Math.floor(this.height / cell) + 3);
    const gridWidth = (columns - 1) * cell;
    const gridHeight = (rows - 1) * cell;
    const offsetX = (this.width - gridWidth) / 2;
    const offsetY = (this.height - gridHeight) / 2;
    const nextHorizontalLines: number[] = [];
    const nextPoints: TechnicalGridPoint[] = [];
    const nextVerticalLines: number[] = [];

    this.gridPath = typeof Path2D === 'undefined' ? null : new Path2D();

    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      const x = offsetX + columnIndex * cell;
      nextVerticalLines.push(x);

      if (this.gridPath) {
        const px = Math.round(x) + 0.5;
        this.gridPath.moveTo(px, 0);
        this.gridPath.lineTo(px, this.height);
      }

      for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
        const y = offsetY + rowIndex * cell;

        if (columnIndex === 0) {
          nextHorizontalLines.push(y);

          if (this.gridPath) {
            const py = Math.round(y) + 0.5;
            this.gridPath.moveTo(0, py);
            this.gridPath.lineTo(this.width, py);
          }
        }

        nextPoints.push({ intensity: 0, memory: 0, memoryAge: 0, x, y });
      }
    }

    this.horizontalLines = nextHorizontalLines;
    this.points = nextPoints;
    this.verticalLines = nextVerticalLines;
  }

  private drawScene(): void {
    const context = this.canvasContext;

    if (!context || this.width === 0 || this.height === 0) {
      return;
    }

    context.clearRect(0, 0, this.width, this.height);

    if (this.gridPath) {
      context.strokeStyle = this.lineColor;
      context.lineWidth = 0.7;
      context.stroke(this.gridPath);
    } else {
      context.strokeStyle = this.lineColor;
      context.lineWidth = 0.7;
      context.beginPath();

      for (const x of this.verticalLines) {
        const px = Math.round(x) + 0.5;
        context.moveTo(px, 0);
        context.lineTo(px, this.height);
      }

      for (const y of this.horizontalLines) {
        const py = Math.round(y) + 0.5;
        context.moveTo(0, py);
        context.lineTo(this.width, py);
      }

      context.stroke();
    }

    // En ambient (mobile/touch) los puntos crecen un poco más y brillan algo más fuerte, para que la
    // onda automática se note al pasar. En pointer (desktop) se mantiene el tamaño sutil del hover.
    const ambient = this.resolvedMode === 'ambient';
    const radiusBase = ambient ? 0.6 : 0.55;
    const radiusGain = ambient ? 2.2 : 1.55;
    const alphaGain = ambient ? 0.48 : 0.38;

    for (const point of this.points) {
      const intensity = point.intensity;
      const alpha = 0.075 + intensity * alphaGain;
      const radius = radiusBase + intensity * radiusGain;

      context.fillStyle = `rgba(${this.dotRgb}, ${alpha})`;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  private getAmbientEmitters(timestamp: number): AmbientEmitter[] {
    // Factor de tiempo un poco mayor (era 0.00009): la onda automática de mobile se mueve algo más
    // rápido. Los weights más altos (+cap en resolveAmbientTarget) suben el pico de intensidad para
    // que los puntos crezcan al pasar el frente y el efecto se note.
    const time = timestamp * 0.00013 + this.seed() * 0.73;
    const travelA = (Math.sin(time) + 1) / 2;
    const travelB = (Math.sin(time * 0.68 + 1.8) + 1) / 2;
    const travelC = (Math.cos(time * 0.42 + 0.4) + 1) / 2;

    return [
      {
        radius: Math.max(72, Math.min(140, this.width * 0.2)),
        weight: 0.56,
        x: this.width * (0.12 + 0.76 * travelA),
        y: this.height * (0.3 + 0.12 * Math.sin(time * 1.08 + this.seed()))
      },
      {
        radius: Math.max(82, Math.min(156, this.width * 0.24)),
        weight: 0.42,
        x: this.width * (0.18 + 0.64 * travelB),
        y: this.height * (0.68 + 0.1 * Math.cos(time * 0.84 + this.seed() * 0.4))
      },
      {
        radius: Math.max(64, Math.min(118, this.width * 0.16)),
        weight: 0.3,
        x: this.width * (0.22 + 0.56 * travelC),
        y: this.height * (0.5 + 0.08 * Math.sin(time * 0.62 + 2.4))
      }
    ];
  }

  private getDistanceFalloff(distance: number, radius: number): number {
    if (distance >= radius) {
      return 0;
    }

    const ratio = 1 - distance / radius;
    return ratio * ratio;
  }

  private refreshRendering(): void {
    if (this.resolvedMode === 'ambient') {
      this.startAnimation();
      return;
    }

    this.stopAnimation();
    this.lastTimestamp = 0;
    this.resetPoints();
    this.drawScene();
  }

  private renderFrame(timestamp: number): number {
    const deltaMs = this.lastTimestamp === 0 ? 16.67 : Math.min(timestamp - this.lastTimestamp, 48);
    const delta = Math.min(deltaMs / 16.67, 2.8);
    const easing = 1 - Math.pow(0.8, delta);
    const releaseEasing = 1 - Math.pow(0.93, delta);
    const ambientEmitters =
      this.resolvedMode === 'ambient' ? this.getAmbientEmitters(timestamp) : null;

    this.lastTimestamp = timestamp;

    let maxIntensity = 0;

    for (const point of this.points) {
      let target = 0;

      if (this.resolvedMode === 'pointer') {
        const pointerTarget = this.pointer.active ? this.resolvePointerTarget(point.x, point.y) : 0;
        target = this.resolvePointerMemory(point, pointerTarget, deltaMs);
      } else if (ambientEmitters) {
        point.memory = 0;
        point.memoryAge = 0;
        target = this.resolveAmbientTarget(point.x, point.y, ambientEmitters);
      } else {
        point.memory = 0;
        point.memoryAge = 0;
      }

      const intensityEasing = target < point.intensity ? releaseEasing : easing;
      point.intensity += (target - point.intensity) * intensityEasing;

      if (point.intensity < 0.0015 && target === 0) {
        point.intensity = 0;
      }

      maxIntensity = Math.max(maxIntensity, point.intensity);
    }

    this.drawScene();
    return maxIntensity;
  }

  private resetPoints(): void {
    for (const point of this.points) {
      point.intensity = 0;
      point.memory = 0;
      point.memoryAge = 0;
    }
  }

  private resolveAmbientTarget(x: number, y: number, emitters: AmbientEmitter[]): number {
    let influence = 0;

    for (const emitter of emitters) {
      const distance = Math.hypot(x - emitter.x, y - emitter.y);
      influence += this.getDistanceFalloff(distance, emitter.radius) * emitter.weight;
    }

    return Math.min(0.85, influence);
  }

  private resolveCellSize(): number {
    if (this.cellSize()) {
      return this.cellSize()!;
    }

    if (this.width < 420) {
      return 19;
    }

    if (this.width < 680) {
      return 18;
    }

    return 16;
  }

  private resolveInfluenceRadius(): number {
    if (this.influenceRadius()) {
      return this.influenceRadius()!;
    }

    return Math.max(78, Math.min(126, this.resolveCellSize() * 5.8));
  }

  private resolveMode(): void {
    this.resolvedMode = selectTechnicalGridMode({
      coarsePointer: this.coarsePointerQuery?.matches ?? false,
      forcedMode: this.mode(),
      prefersReducedMotion: this.prefersReducedMotionQuery?.matches ?? false
    });
  }

  private resolvePointerTarget(x: number, y: number): number {
    const radius = this.resolveInfluenceRadius();
    const distance = Math.hypot(x - this.pointer.x, y - this.pointer.y);

    return this.getDistanceFalloff(distance, radius);
  }

  private resolvePointerMemory(
    point: TechnicalGridPoint,
    pointerTarget: number,
    deltaMs: number
  ): number {
    if (pointerTarget > TechnicalGridBackgroundComponent.pointerMemoryFloor) {
      point.memory = Math.max(point.memory * 0.9, pointerTarget);
      point.memoryAge = 0;
      return pointerTarget;
    }

    if (point.memory <= 0) {
      return pointerTarget;
    }

    point.memoryAge = Math.min(
      TechnicalGridBackgroundComponent.pointerMemoryDuration,
      point.memoryAge + deltaMs
    );

    const fade =
      1 - point.memoryAge / TechnicalGridBackgroundComponent.pointerMemoryDuration;

    if (fade <= 0) {
      point.memory = 0;
      point.memoryAge = 0;
      return pointerTarget;
    }

    const lingeringTarget =
      point.memory *
      Math.pow(fade, 1.65) *
      TechnicalGridBackgroundComponent.pointerMemoryStrength;

    if (pointerTarget <= 0) {
      point.memory *= 0.992;
    }

    return Math.max(pointerTarget, lingeringTarget);
  }

  private resizeCanvas(): boolean {
    const context = this.canvasContext;

    if (!context) {
      return false;
    }

    // En modo viewport el canvas cubre solo el área visible (no toda la página → no miles de px de alto).
    const bounds = this.viewport()
      ? { width: this.win?.innerWidth ?? 0, height: this.win?.innerHeight ?? 0 }
      : this.containerElement.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(bounds.width));
    const nextHeight = Math.max(1, Math.round(bounds.height));
    const nextDpr = Math.min(this.win?.devicePixelRatio ?? 1, 2);
    const canvas = this.canvasRef.nativeElement;

    if (
      nextWidth === this.width &&
      nextHeight === this.height &&
      canvas.width === Math.round(nextWidth * nextDpr) &&
      canvas.height === Math.round(nextHeight * nextDpr)
    ) {
      return false;
    }

    this.width = nextWidth;
    this.height = nextHeight;
    canvas.width = Math.round(nextWidth * nextDpr);
    canvas.height = Math.round(nextHeight * nextDpr);
    canvas.style.width = `${nextWidth}px`;
    canvas.style.height = `${nextHeight}px`;

    context.setTransform(nextDpr, 0, 0, nextDpr, 0, 0);

    this.buildGrid();
    this.lastTimestamp = 0;
    return true;
  }

  private setupMediaQueries(): void {
    if (!this.win?.matchMedia) {
      return;
    }

    this.prefersReducedMotionQuery = this.win.matchMedia('(prefers-reduced-motion: reduce)');
    this.coarsePointerQuery = this.win.matchMedia('(pointer: coarse)');

    this.attachMediaListener(this.prefersReducedMotionQuery, this.handleMediaChange);
    this.attachMediaListener(this.coarsePointerQuery, this.handleMediaChange);
  }

  private setupResizeHandling(): void {
    // En modo viewport el tamaño depende del viewport, no del contenedor: escuchamos al window.
    if (this.viewport() && this.win) {
      this.win.addEventListener('resize', this.handleWindowResize, { passive: true });
      this.win.addEventListener('orientationchange', this.handleWindowResize, { passive: true });
      this.cleanupFns.push(() => {
        this.win?.removeEventListener('resize', this.handleWindowResize);
        this.win?.removeEventListener('orientationchange', this.handleWindowResize);
      });
      return;
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleGeometryChange();
      });
      this.resizeObserver.observe(this.containerElement);
      return;
    }

    if (!this.win) {
      return;
    }

    this.win.addEventListener('resize', this.handleWindowResize, { passive: true });
    this.win.addEventListener('orientationchange', this.handleWindowResize, { passive: true });
      this.cleanupFns.push(() => {
      this.win?.removeEventListener('resize', this.handleWindowResize);
      this.win?.removeEventListener('orientationchange', this.handleWindowResize);
    });
  }

  private handleGeometryChange(): void {
    const resized = this.resizeCanvas();

    if (!resized) {
      return;
    }

    if (this.resolvedMode === 'ambient' || this.pointer.active || this.animationFrameId !== null) {
      this.startAnimation();
      return;
    }

    this.refreshRendering();
  }

  private shouldContinueAnimating(maxIntensity: number): boolean {
    if (this.resolvedMode === 'ambient') {
      return true;
    }

    return this.pointer.active || maxIntensity > 0.012;
  }

  private startAnimation(): void {
    if (!this.win || this.animationFrameId !== null) {
      return;
    }

    this.animationFrameId = this.win.requestAnimationFrame(this.animate);
  }

  private stopAnimation(): void {
    if (this.animationFrameId !== null) {
      this.win?.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private syncPalette(): void {
    const styles = this.win?.getComputedStyle(this.hostRef.nativeElement);
    const lineColor = styles?.getPropertyValue('--technical-grid-line').trim();
    const dotRgb = styles?.getPropertyValue('--technical-grid-dot-rgb').trim();

    if (lineColor) {
      this.lineColor = lineColor;
    }

    if (dotRgb) {
      this.dotRgb = dotRgb;
    }
  }

  private syncPointerListeners(): void {
    if (this.resolvedMode === 'pointer' && !this.pointerListenersAttached) {
      const target = this.containerElement;

      target.addEventListener('pointermove', this.handlePointerMove, {
        passive: true
      });
      target.addEventListener('pointerleave', this.handlePointerLeave);
      target.addEventListener('pointercancel', this.handlePointerLeave);

      this.cleanupFns.push(() => {
        target.removeEventListener('pointermove', this.handlePointerMove);
        target.removeEventListener('pointerleave', this.handlePointerLeave);
        target.removeEventListener('pointercancel', this.handlePointerLeave);
      });

      this.pointerListenerTarget = target;
      this.pointerListenersAttached = true;
      return;
    }

    if (this.resolvedMode !== 'pointer' && this.pointerListenersAttached) {
      this.pointerListenerTarget?.removeEventListener('pointermove', this.handlePointerMove);
      this.pointerListenerTarget?.removeEventListener('pointerleave', this.handlePointerLeave);
      this.pointerListenerTarget?.removeEventListener('pointercancel', this.handlePointerLeave);
      this.pointerListenersAttached = false;
      this.pointerListenerTarget = null;
    }
  }

  private attachMediaListener(query: MediaQueryList, listener: () => void): void {
    const modernQuery = query as MediaQueryList & {
      addEventListener?: (type: 'change', callback: () => void) => void;
      removeEventListener?: (type: 'change', callback: () => void) => void;
    };
    const legacyQuery = query as MediaQueryList & {
      addListener?: (callback: () => void) => void;
      removeListener?: (callback: () => void) => void;
    };

    if (modernQuery.addEventListener && modernQuery.removeEventListener) {
      modernQuery.addEventListener('change', listener);
      this.cleanupFns.push(() => modernQuery.removeEventListener?.('change', listener));
      return;
    }

    legacyQuery.addListener?.(listener);
    this.cleanupFns.push(() => legacyQuery.removeListener?.(listener));
  }
}
