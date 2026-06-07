import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should hide the main navigation on the home route', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.nav a');
    const brand = compiled.querySelector('.brand')?.textContent?.trim();

    expect(links.length).toBe(0);
    expect(brand).toBe('sowe');
  });

  it('should render the software header navigation on internal pages', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/software');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.nav a')).map((link) =>
      link.textContent?.trim()
    );
    const hrefs = Array.from(compiled.querySelectorAll('.nav a')).map((link) =>
      link.getAttribute('href')
    );
    const talkLink = compiled.querySelector('.topbar-link span')?.textContent?.trim();

    expect(links).toEqual(['Sistemas', 'Proceso', 'Casos']);
    expect(hrefs).toEqual(['/software#sistemas', '/software#proceso', '/software#casos']);
    expect(talkLink).toBe('Hablemos');
  });

  it('should render the web header navigation with web-specific anchors', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/web');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.nav a')).map((link) =>
      link.textContent?.trim()
    );
    const hrefs = Array.from(compiled.querySelectorAll('.nav a')).map((link) =>
      link.getAttribute('href')
    );

    expect(links).toEqual(['Capacidades', 'Servicios', 'Portfolio']);
    expect(hrefs).toEqual(['/web#capacidades', '/web#servicios', '/web#portfolio']);
  });

  it('should render a WhatsApp action button next to the talk CTA', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/software');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const wa = compiled.querySelector('.wa-button');

    expect(wa).toBeTruthy();
    expect(wa?.getAttribute('aria-label')).toBe('Escribinos por WhatsApp');
    expect(wa?.querySelector('svg')).toBeTruthy();
  });
});
