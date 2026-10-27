import { describe, expect, test } from 'bun:test';
import { createRulerScale } from '../ui/ruler-utils';

describe('ruler scale', () => {
  test('fractional steps round-trip without floating-point display noise', () => {
    const scale = createRulerScale(-1, 2, 0.1);
    expect(scale.count).toBe(30);
    for (let index = 0; index <= scale.count; index++) {
      expect(scale.indexOf(scale.at(index))).toBe(index);
      expect(String(scale.at(index)).length).toBeLessThan(5);
    }
    expect(scale.at(13)).toBe(0.3);
  });
  test('out-of-range and nonfinite values never escape the end stops', () => {
    const scale = createRulerScale(5, 60, 1);
    expect(scale.at(-10)).toBe(5);
    expect(scale.at(100)).toBe(60);
    expect(scale.indexOf(-10)).toBe(0);
    expect(scale.indexOf(100)).toBe(55);
    expect(scale.indexOf(Number.NaN)).toBe(0);
    expect(scale.indexOf(Number.POSITIVE_INFINITY)).toBe(0);
    expect(scale.indexOf(25.6)).toBe(21);
  });
  test('invalid or oversized scales fail before allocating tick views', () => {
    for (const [min, max, step] of [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0.3],
      [0, 1001, 1],
      [0, 1, Number.NaN],
      [0, Number.POSITIVE_INFINITY, 1],
    ]) {
      expect(() => createRulerScale(min ?? 0, max ?? 1, step ?? 1)).toThrow();
    }
    expect(createRulerScale(0, 1000, 1).count).toBe(1000);
  });
});
