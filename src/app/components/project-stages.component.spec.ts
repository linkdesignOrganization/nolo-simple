import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { ProjectStage, ProjectStagesComponent } from './project-stages.component';

const stages: ProjectStage[] = [
  { order: '01', name: 'Primer contacto', duration: '1 semana', description: 'Entendemos qué necesitás.' },
  { order: '02', name: 'Discovery', duration: '4 semanas', description: 'Mapeamos el flujo real.' },
  { order: '03', name: 'Desarrollo', duration: '4 a 6 meses', description: 'Construimos por módulos.' },
  { order: '04', name: 'Lanzamiento', duration: '2 semanas', description: 'Implementamos en producción.' }
];

describe('ProjectStagesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectStagesComponent]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the heading and one block per stage with number, name, duration and description', () => {
    const fixture = TestBed.createComponent(ProjectStagesComponent);
    fixture.componentRef.setInput('title', 'Así trabajamos un proyecto.');
    fixture.componentRef.setInput('intro', 'De la primera conversación al sistema funcionando.');
    fixture.componentRef.setInput('stages', stages);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.ps-title')?.textContent?.trim()).toBe('Así trabajamos un proyecto.');

    const blocks = el.querySelectorAll('.ps-stage');
    expect(blocks.length).toBe(4);

    const nums = [...el.querySelectorAll('.ps-stage__num')].map((n) => n.textContent?.trim());
    expect(nums).toEqual(['01', '02', '03', '04']);

    const durations = [...el.querySelectorAll('.ps-stage__duration')].map((d) => d.textContent?.trim());
    expect(durations).toEqual(['1 semana', '4 semanas', '4 a 6 meses', '2 semanas']);

    expect(el.querySelector('.ps-stage__name')?.textContent?.trim()).toBe('Primer contacto');

    fixture.destroy();
  });
});
