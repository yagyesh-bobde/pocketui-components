import { describe, expect, test } from 'bun:test';
import { adjacentRangeValue, normalizeRangeValue } from '../ui/range-slider-state';

describe('range slider stops', () => {
  test('fractional adjustments leave an exact maximum without getting stuck', () => {
    expect(adjacentRangeValue(0.07, -1, 0, 0.07, 0.01)).toBe(0.06);
    expect(adjacentRangeValue(0.06, 1, 0, 0.07, 0.01)).toBe(0.07);
    expect(normalizeRangeValue(0.1 + 0.2, 0, 1, 0.1)).toBe(0.3);
    expect(adjacentRangeValue(0.3, -1, -1, 1, 0.1)).toBe(0.2);
  });

  test('an uneven final interval remains reachable in both directions', () => {
    expect(adjacentRangeValue(9, 1, 0, 10, 3)).toBe(10);
    expect(adjacentRangeValue(10, -1, 0, 10, 3)).toBe(9);
    expect(normalizeRangeValue(9.7, 0, 10, 3)).toBe(10);
    expect(normalizeRangeValue(8.8, 0, 10, 3)).toBe(9);
    expect(adjacentRangeValue(0, -1, 0, 10, 3)).toBe(0);
    expect(adjacentRangeValue(10, 1, 0, 10, 3)).toBe(10);
  });

  test('values remain bounded without losing small steps at large offsets', () => {
    expect(normalizeRangeValue(-100, 5, 60, 1)).toBe(5);
    expect(normalizeRangeValue(100, 5, 60, 1)).toBe(60);
    expect(normalizeRangeValue(Number.NaN, 5, 60, 1)).toBe(5);
    expect(normalizeRangeValue(Number.POSITIVE_INFINITY, 5, 60, 1)).toBe(5);
    expect(normalizeRangeValue(1_000_000_000_001, 1_000_000_000_000, 1_000_000_000_100, 1)).toBe(
      1_000_000_000_001,
    );
    expect(normalizeRangeValue(0.1234567890123456, 0.1234567890123456, 1, 0.1)).toBe(
      0.1234567890123456,
    );
  });

  test('invalid scales fail before gesture geometry is calculated', () => {
    for (const [min, max, step] of [
      [1, 1, 1],
      [2, 1, 1],
      [0, Number.POSITIVE_INFINITY, 1],
      [0, 1, 0],
      [0, 1, -1],
      [0, 1, Number.NaN],
      [0, 1, 2],
    ]) {
      expect(() => normalizeRangeValue(0, min ?? 0, max ?? 1, step ?? 1)).toThrow();
    }
  });
});
