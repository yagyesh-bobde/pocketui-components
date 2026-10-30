import { describe, expect, test } from 'bun:test';
import { cubeLanding, pageIndex, screenOrigin } from '../ui/screen-motion';

describe('story navigation boundaries', () => {
  test('a release uses both distance and flick direction', () => {
    expect(cubeLanding(0.35, 0, 0, 4)).toBe(0);
    expect(cubeLanding(0.35, 2, 0, 4)).toBe(1);
    expect(cubeLanding(0.65, -2, 0, 4)).toBe(0);
    expect(cubeLanding(0.65, 0, 0, 4)).toBe(1);
  });
  test('a fast or interrupted drag never skips a neighbour or leaves the data', () => {
    expect(cubeLanding(9, 100, 2, 10)).toBe(3);
    expect(cubeLanding(-9, -100, 2, 10)).toBe(1);
    expect(cubeLanding(-0.5, -2, 0, 4)).toBe(0);
    expect(cubeLanding(3.8, 2, 3, 4)).toBe(3);
    expect(cubeLanding(2, 2, 0, 1)).toBe(0);
    expect(pageIndex(Number.NaN, 4)).toBe(0);
    expect(pageIndex(6, 0)).toBe(0);
  });
});

describe('expansion source geometry', () => {
  test('converts window coordinates to modal coordinates', () => {
    expect(
      screenOrigin({ x: 30, y: 140, width: 310, height: 90, radius: 24 }, 360, 780, 10, 40),
    ).toEqual({ x: 20, y: 100, width: 310, height: 90, radius: 24 });
  });
  test('clips partially offscreen rows and bounds the corner radius', () => {
    expect(screenOrigin({ x: -20, y: 750, width: 100, height: 90, radius: 100 }, 360, 780)).toEqual(
      { x: 0, y: 750, width: 80, height: 30, radius: 15 },
    );
    expect(screenOrigin({ x: 500, y: 900, width: 100, height: 90 }, 360, 780)).toEqual({
      x: 359,
      y: 779,
      width: 1,
      height: 1,
      radius: 0.5,
    });
  });
  test('invalid measurements use a finite fallback, including before layout', () => {
    const invalid = { x: Number.NaN, y: 0, width: -1, height: 90 };
    expect(screenOrigin(invalid, 360, 780)).toEqual(screenOrigin(undefined, 360, 780));
    for (const value of Object.values(screenOrigin(invalid, 0, 0)))
      expect(Number.isFinite(value)).toBe(true);
  });
});
