import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { DevTypeBlock, DevTypesComponent } from './dev-types.component';

const blocks: DevTypeBlock[] = [
  {
    icon: 'monitor-stop',
    tab: 'Landing page',
    title: 'Landing page',
    description: 'Una sola página construida para convertir.',
    highlights: ['Una acción', 'Liviana', 'Formulario', 'Lista para Ads'],
    cases: ['Capturar leads de campaña', 'Punto de contacto sin sitio extenso']
  },
  {
    icon: 'monitor-dot',
    tab: 'Sitio corporativo',
    title: 'Sitio corporativo',
    description: 'Sitio con varias secciones.',
    highlights: ['CMS propio', 'Blog', 'Redes', 'Métricas'],
    cases: ['Industriales/servicios', 'Empresas en expansión']
  },
  {
    icon: 'shopping-cart',
    tab: 'E-commerce',
    title: 'E-commerce',
    description: 'Tienda en línea a medida.',
    highlights: ['Productos', 'Pagos', 'Panel', 'Logística'],
    cases: ['Catálogo amplio', 'Migrar de plataforma enlatada']
  },
  {
    icon: 'monitor-cog',
    tab: 'Apps y sistemas internos',
    title: 'Apps y sistemas internos',
    description: 'Aplicaciones para la operación interna.',
    highlights: ['Flujo real', 'Roles', 'Integración', 'Web y móvil'],
    cases: ['Operaciones con planillas', 'Sistemas viejos a modernizar']
  }
];

describe('DevTypesComponent', () => {
  beforeEach(async () => {
    // jsdom no implementa scrollIntoView; lo definimos como noop para el click handler.
    HTMLElement.prototype.scrollIntoView = vi.fn();
    await TestBed.configureTestingModule({ imports: [DevTypesComponent] }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders four tabs and panels with highlights and cases', () => {
    const fixture = TestBed.createComponent(DevTypesComponent);
    fixture.componentRef.setInput('blocks', blocks);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    const tabs = el.querySelectorAll('.dt-tab');
    expect(tabs.length).toBe(4);
    expect(el.querySelectorAll('.dt-panel').length).toBe(4);

    const titles = [...el.querySelectorAll('.dt-panel__title')].map((n) => n.textContent?.trim());
    expect(titles).toEqual([
      'Landing page',
      'Sitio corporativo',
      'E-commerce',
      'Apps y sistemas internos'
    ]);

    const firstPanel = el.querySelector('.dt-panel');
    expect(firstPanel?.querySelectorAll('.dt-highlights li').length).toBe(4);
    expect(firstPanel?.querySelectorAll('.dt-cases__item').length).toBe(2);

    fixture.destroy();
  });

  it('activates the clicked tab', () => {
    const fixture = TestBed.createComponent(DevTypesComponent);
    fixture.componentRef.setInput('blocks', blocks);
    fixture.detectChanges();

    const tabs = fixture.nativeElement.querySelectorAll('.dt-tab');
    (tabs[2] as HTMLElement).click();
    fixture.detectChanges();

    expect(tabs[2].classList.contains('is-active')).toBe(true);
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].classList.contains('is-active')).toBe(false);

    fixture.destroy();
  });
});
