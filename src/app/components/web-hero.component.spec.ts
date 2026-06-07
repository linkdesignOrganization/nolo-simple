import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeroAction, WebHeroComponent } from './web-hero.component';

const actions: HeroAction[] = [
  { label: 'agendar reunión', link: '#hablemos' },
  { label: 'mandar mensaje', link: '#hablemos' }
];

describe('WebHeroComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebHeroComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('renders the title, lead, the two actions and the rotating stage', () => {
    const fixture = TestBed.createComponent(WebHeroComponent);
    fixture.componentRef.setInput('title', 'Sitios web hechos en serio.');
    fixture.componentRef.setInput('lead', 'Sin plantillas, sin atajos.');
    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('slides', []);
    fixture.componentRef.setInput('marquee', {
      label: 'Lo que no hacemos:',
      items: ['No WordPress', 'No Wix']
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.wh-title')?.textContent?.trim()).toBe('Sitios web hechos en serio.');
    expect(el.querySelector('.wh-lead')?.textContent?.trim()).toBe('Sin plantillas, sin atajos.');

    const buttons = [...el.querySelectorAll('.wh-actions .button')];
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('agendar reunión');
    expect(buttons[0].getAttribute('href')).toBe('#hablemos');

    // Sin videos: 3 placeholders en el stage, el primero activo.
    const slides = el.querySelectorAll('.wh-slide');
    expect(slides.length).toBe(3);
    expect(slides[0].classList.contains('is-active')).toBe(true);

    // Marquee: etiqueta fija + items duplicados 2× para el loop seamless (2 items → 4).
    expect(el.querySelector('.wh-marquee__label')?.textContent?.trim()).toBe('Lo que no hacemos:');
    expect(el.querySelectorAll('.wh-marquee__item').length).toBe(4);

    fixture.destroy();
  });
});
