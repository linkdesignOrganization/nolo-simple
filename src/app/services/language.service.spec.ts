import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language.service';

describe('LanguageService', () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // localStorage puede no estar disponible en el entorno de test.
    }
    TestBed.configureTestingModule({});
  });

  it('defaults to es', () => {
    expect(TestBed.inject(LanguageService).lang()).toBe('es');
  });

  it('toggles between es and en', () => {
    const svc = TestBed.inject(LanguageService);
    svc.toggle();
    expect(svc.lang()).toBe('en');
    svc.toggle();
    expect(svc.lang()).toBe('es');
  });

  it('sets a specific language', () => {
    const svc = TestBed.inject(LanguageService);
    svc.set('en');
    expect(svc.lang()).toBe('en');
  });
});
