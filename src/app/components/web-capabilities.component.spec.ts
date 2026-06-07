import { TestBed } from '@angular/core/testing';

import { CapabilityCard, WebCapabilitiesComponent } from './web-capabilities.component';

const cards: CapabilityCard[] = [
  {
    index: '01',
    title: 'Construido con tecnología seria.',
    body: 'Stack de producción.',
    payload: {
      kind: 'logos',
      logos: [
        { src: '/logostools/angular.svg', label: 'Frontend' },
        { src: '/logostools/nj.svg', label: 'Backend' },
        { src: '/logostools/ts.svg', label: 'Lenguaje' },
        { src: '/logostools/azure.webp', label: 'Infraestructura' }
      ]
    }
  },
  {
    index: '02',
    title: 'Rápidos en cualquier pantalla.',
    body: 'Mobile-first.',
    payload: {
      kind: 'rows',
      rows: [
        { icon: 'smartphone', label: 'Móvil primero' },
        { icon: 'code', label: 'Código propio' },
        { icon: 'gauge', label: 'Performance medida' }
      ]
    }
  },
  {
    index: '03',
    title: 'Cada diseño, desde cero.',
    body: 'Sin plantillas.',
    payload: {
      kind: 'rows',
      rows: [
        { icon: 'fingerprint', label: 'Marca' },
        { icon: 'hierarchy', label: 'Jerarquía' },
        { icon: 'rhythm', label: 'Ritmo' },
        { icon: 'structure', label: 'Estructura' }
      ]
    }
  }
];

describe('WebCapabilitiesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebCapabilitiesComponent]
    }).compileComponents();
  });

  it('renders the heading, the three cards and each payload', () => {
    const fixture = TestBed.createComponent(WebCapabilitiesComponent);
    fixture.componentRef.setInput('heading', 'Lo que hay detrás de cada sitio.');
    fixture.componentRef.setInput('cards', cards);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.wc-head__title')?.textContent?.trim()).toBe(
      'Lo que hay detrás de cada sitio.'
    );
    expect(el.querySelectorAll('.wc-card').length).toBe(3);

    const titles = [...el.querySelectorAll('.wc-card__title')].map((n) => n.textContent?.trim());
    expect(titles).toEqual([
      'Construido con tecnología seria.',
      'Rápidos en cualquier pantalla.',
      'Cada diseño, desde cero.'
    ]);

    // Card 1: los 4 logos.
    expect(el.querySelectorAll('.wc-row--logo img').length).toBe(4);

    // Cards 2 y 3: filas con icono (3 + 4 = 7).
    const labels = [...el.querySelectorAll('.wc-row--icon .wc-row__label')].map((n) =>
      n.textContent?.trim()
    );
    expect(labels).toEqual([
      'Móvil primero',
      'Código propio',
      'Performance medida',
      'Marca',
      'Jerarquía',
      'Ritmo',
      'Estructura'
    ]);
  });
});
