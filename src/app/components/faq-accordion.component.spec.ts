import { TestBed } from '@angular/core/testing';

import { FaqAccordionComponent, FaqItem } from './faq-accordion.component';

const items: FaqItem[] = [
  { question: '¿Cómo escala el software?', answer: 'Arquitectura por módulos desde el inicio.' },
  { question: '¿Qué seguridad implementan?', answer: 'Roles, permisos y validaciones reales.' },
  { question: '¿Cómo es el soporte?', answer: 'Planes con SLA definido.' }
];

describe('FaqAccordionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqAccordionComponent]
    }).compileComponents();
  });

  it('renders the heading and one item per FAQ with its question', () => {
    const fixture = TestBed.createComponent(FaqAccordionComponent);
    fixture.componentRef.setInput('heading', '/preguntas frecuentes');
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.faq-title')?.textContent?.trim()).toBe('/preguntas frecuentes');

    expect(el.querySelectorAll('.faq-item').length).toBe(3);

    const questions = [...el.querySelectorAll('.faq-q__text')].map((q) => q.textContent?.trim());
    expect(questions).toEqual([
      '¿Cómo escala el software?',
      '¿Qué seguridad implementan?',
      '¿Cómo es el soporte?'
    ]);

    fixture.destroy();
  });

  it('opens questions independently (multi-open) and toggles them closed', () => {
    const fixture = TestBed.createComponent(FaqAccordionComponent);
    fixture.componentRef.setInput('heading', '/preguntas frecuentes');
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const buttons = [...el.querySelectorAll<HTMLButtonElement>('.faq-q')];

    // Todas cerradas al inicio.
    expect(buttons.every((b) => b.getAttribute('aria-expanded') === 'false')).toBe(true);

    // Abrir la 1 y la 3: ambas quedan abiertas a la vez, la 2 sigue cerrada.
    buttons[0].click();
    buttons[2].click();
    fixture.detectChanges();

    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('false');
    expect(buttons[2].getAttribute('aria-expanded')).toBe('true');

    // Reclickear la 1 la cierra; la 3 sigue abierta (toggle independiente).
    buttons[0].click();
    fixture.detectChanges();

    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(buttons[2].getAttribute('aria-expanded')).toBe('true');

    fixture.destroy();
  });
});
