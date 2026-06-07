import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { FeatureTab, FeatureTabsComponent } from './feature-tabs.component';

const tabs: FeatureTab[] = [
  { lead: 'Ordená', body: 'la operación que ya tenés.', videoSrc: '/media/a.mp4' },
  { lead: 'Centralizá', body: 'las fichas y los flujos.', videoSrc: '/media/b.mp4' },
  { lead: 'Automatizá', body: 'las tareas repetitivas.', videoSrc: '/media/c.mp4' }
];

describe('FeatureTabsComponent', () => {
  beforeEach(async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockReturnValue(undefined);

    await TestBed.configureTestingModule({
      imports: [FeatureTabsComponent]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(FeatureTabsComponent);
    fixture.componentRef.setInput('tabs', tabs);
    fixture.detectChanges();
    return fixture;
  }

  it('renders a tab per item with a bold lead word and starts on the first tab', () => {
    const fixture = createFixture();
    const element = fixture.nativeElement as HTMLElement;

    const tabButtons = element.querySelectorAll('.feature-tab');
    const leads = Array.from(element.querySelectorAll('.feature-tab__text strong')).map((node) =>
      node.textContent?.trim()
    );
    const videos = element.querySelectorAll('.feature-video');

    expect(tabButtons.length).toBe(3);
    expect(leads).toEqual(['Ordená', 'Centralizá', 'Automatizá']);
    expect(tabButtons[0].getAttribute('aria-selected')).toBe('true');
    expect(tabButtons[1].getAttribute('aria-selected')).toBe('false');
    expect(videos[0].classList.contains('is-active')).toBe(true);
    expect(videos[1].classList.contains('is-active')).toBe(false);

    fixture.destroy();
  });

  it('activates the clicked tab and swaps the active video', () => {
    const fixture = createFixture();
    const element = fixture.nativeElement as HTMLElement;

    const secondTab = element.querySelectorAll('.feature-tab')[1] as HTMLButtonElement;
    secondTab.click();
    fixture.detectChanges();

    const tabButtons = element.querySelectorAll('.feature-tab');
    const videos = element.querySelectorAll('.feature-video');

    expect(tabButtons[0].getAttribute('aria-selected')).toBe('false');
    expect(tabButtons[1].getAttribute('aria-selected')).toBe('true');
    expect(videos[0].classList.contains('is-active')).toBe(false);
    expect(videos[1].classList.contains('is-active')).toBe(true);

    fixture.destroy();
  });
});
