import { selectTechnicalGridMode } from './technical-grid-background.component';

describe('selectTechnicalGridMode', () => {
  it('returns static when reduced motion is preferred', () => {
    expect(
      selectTechnicalGridMode({
        coarsePointer: false,
        prefersReducedMotion: true
      })
    ).toBe('static');
  });

  it('returns ambient for coarse pointers when motion is allowed', () => {
    expect(
      selectTechnicalGridMode({
        coarsePointer: true,
        prefersReducedMotion: false
      })
    ).toBe('ambient');
  });

  it('returns pointer for fine pointers when motion is allowed', () => {
    expect(
      selectTechnicalGridMode({
        coarsePointer: false,
        prefersReducedMotion: false
      })
    ).toBe('pointer');
  });
});
