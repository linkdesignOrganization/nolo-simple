import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { ServiceItem, ServicesStackComponent } from './services-stack.component';

const items: ServiceItem[] = [
  { title: 'CRM a la medida', body: 'Sistema de ventas multicanal.', chips: ['Multicanal', 'IA'] },
  { title: 'ERP de operación', body: 'Control de stock.', chips: ['Inventario'] },
  { title: 'E-commerce', body: 'Tienda con lógica propia.', chips: ['Reglas propias'] }
];

describe('ServicesStackComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesStackComponent]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the heading and one row per item with NN numbers and chips', () => {
    const fixture = TestBed.createComponent(ServicesStackComponent);
    fixture.componentRef.setInput('heading', 'Sistemas que construimos a la medida');
    fixture.componentRef.setInput('intro', 'Cada categoría representa una capacidad real.');
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.services-stack__intro h2')?.textContent?.trim()).toBe(
      'Sistemas que construimos a la medida'
    );

    const heads = el.querySelectorAll('.ss-item__head');
    expect(heads.length).toBe(3);

    const nums = [...el.querySelectorAll('.ss-item__num')].map((n) => n.textContent?.trim());
    expect(nums).toEqual(['01', '02', '03']);

    const titles = [...el.querySelectorAll('.ss-item__title')].map((t) => t.textContent?.trim());
    expect(titles).toEqual(['CRM a la medida', 'ERP de operación', 'E-commerce']);

    const bodies = el.querySelectorAll('.ss-item__body');
    const firstChips = [...bodies[0].querySelectorAll('.ss-item__chips li')].map((c) =>
      c.textContent?.trim()
    );
    expect(firstChips).toEqual(['Multicanal', 'IA']);

    fixture.destroy();
  });
});
