import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

// Coordina el tema oscuro de página entre varias "zonas oscuras" del scroll (p.ej. showcase +
// etapas, y el footer de contacto), separadas por secciones claras. Cada zona reporta si está
// activa; el sitio queda en negro (`app-dark`) mientras CUALQUIERA lo esté. Sin esto, dos
// directivas toggleando la misma clase según su propio rect se pisarían en cada scroll.
@Injectable({ providedIn: 'root' })
export class DarkZoneService {
  private readonly document = inject(DOCUMENT);
  private readonly active = new Set<object>();

  // `key` identifica a la zona que llama (la instancia de la directiva). Solo tocamos el DOM
  // cuando cambia el estado agregado (había alguna activa ↔ hay alguna activa).
  setActive(key: object, dark: boolean): void {
    const wasActive = this.active.size > 0;

    if (dark) {
      this.active.add(key);
    } else {
      this.active.delete(key);
    }

    const isActive = this.active.size > 0;
    if (wasActive !== isActive) {
      this.document.documentElement.classList.toggle('app-dark', isActive);
    }
  }
}
