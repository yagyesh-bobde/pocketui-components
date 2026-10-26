import { describe, expect, test } from 'bun:test';
import {
  menuPosition,
  sheetDestination,
  sheetSnapHeights,
  swipeDestination,
  toastDuration,
} from '../ui/interaction-utils';

describe('sheet snap geometry', () => {
  test('sorts and deduplicates snap fractions and rejects nonfinite values', () => {
    expect(sheetSnapHeights([0.9, Number.NaN, 0.5, 0.5, Number.POSITIVE_INFINITY], 800)).toEqual([
      400, 720,
    ]);
    expect(sheetSnapHeights([], 800)).toEqual([400, 720]);
    expect(sheetSnapHeights([-1, 2], 800)).toEqual([120, 800]);
  });
  test('keeps a nondismissible sheet at a snap even after a fast downward drag', () => {
    expect(sheetDestination(400, 350, 2, [400, 720], false)).toBe(400);
    expect(sheetDestination(400, 350, 2, [400, 720], true)).toBe(0);
  });
  test('projects fling velocity toward the next snap', () => {
    expect(sheetDestination(400, -80, -1, [400, 720], true)).toBe(720);
    expect(sheetDestination(720, 140, 1, [400, 720], true)).toBe(400);
  });
});
describe('menu placement', () => {
  const screen = { x: 0, y: 50, width: 375, height: 700 };
  test('clamps the right edge and flips upward at the bottom', () => {
    const p = menuPosition({ x: 330, y: 660, width: 30, height: 30 }, screen, {
      width: 256,
      height: 240,
    });
    expect(p).toEqual({ left: 107, top: 412 });
  });
  test('uses below the trigger when it fits and respects the safe top', () => {
    expect(
      menuPosition({ x: 20, y: 100, width: 100, height: 40 }, screen, { width: 256, height: 200 }),
    ).toEqual({ left: 20, top: 148 });
    expect(
      menuPosition({ x: -10, y: 30, width: 20, height: 10 }, screen, { width: 256, height: 700 }),
    ).toEqual({ left: 12, top: 62 });
  });
});
describe('swipe and toast boundaries', () => {
  test('settles a row without executing an action', () => {
    expect(swipeDestination(-30, 0, 160)).toBe(0);
    expect(swipeDestination(-70, 0, 160)).toBe(-160);
    expect(swipeDestination(-10, -0.8, 160)).toBe(-160);
    expect(swipeDestination(-150, 0.8, 160)).toBe(0);
  });
  test('allows persistent toasts while bounding invalid and extreme durations', () => {
    expect(toastDuration(0)).toBe(0);
    expect(toastDuration(undefined)).toBe(5000);
    expect(toastDuration(Number.NaN)).toBe(5000);
    expect(toastDuration(-50)).toBe(1000);
    expect(toastDuration(100000)).toBe(15000);
  });
});
