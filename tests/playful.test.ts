import { describe, expect, test } from 'bun:test';
import { createScratchTracker, deckDirection, orbitPoints } from '../ui/playful-utils';

describe('swipe decisions', () => {
  test('short drags snap back; deliberate distance and flicks dismiss', () => {
    expect(deckDirection(30, 0.1, 320)).toBeNull();
    expect(deckDirection(-90, -0.1, 320)).toBe('left');
    expect(deckDirection(90, 0.1, 320)).toBe('right');
    expect(deckDirection(-20, -0.8, 320)).toBe('left');
    expect(deckDirection(5, 2, 320)).toBeNull();
    expect(deckDirection(20, -1, 320)).toBeNull();
  });
  test('invalid measurements do not dismiss a card', () => {
    expect(deckDirection(90, 1, 0)).toBeNull();
    expect(deckDirection(Number.NaN, 1, 320)).toBeNull();
    expect(deckDirection(10, Number.POSITIVE_INFINITY, 320)).toBeNull();
  });
});

describe('scratch coverage', () => {
  test('retracing a stroke cannot add coverage', () => {
    const tracker = createScratchTracker(320, 220, 42);
    const start = { x: 20, y: 100 };
    const end = { x: 300, y: 100 };
    const first = tracker.add(start, end);
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThan(0.3);
    for (let index = 0; index < 50; index++) expect(tracker.add(end, start)).toBe(first);
  });
  test('fast segments count their whole stroke, not only touch samples', () => {
    const tracker = createScratchTracker(320, 220, 42);
    let progress = 0;
    for (let y = 0; y <= 220; y += 20) progress = tracker.add({ x: 0, y }, { x: 320, y });
    expect(progress).toBe(1);
  });
  test('separate gestures do not gain a phantom joining stroke', () => {
    const tracker = createScratchTracker(320, 220, 42);
    const first = tracker.add({ x: 10, y: 10 }, { x: 10, y: 10 });
    const second = tracker.add({ x: 310, y: 210 }, { x: 310, y: 210 });
    expect(second).toBeGreaterThan(first);
    expect(second).toBeLessThan(0.1);
  });
  test('zero-size layouts remain unrevealed', () => {
    expect(createScratchTracker(0, 220, 42).add({ x: 0, y: 0 }, { x: 100, y: 100 })).toBe(0);
  });
});

describe('orbit geometry', () => {
  test('one action sits above the center and an empty menu has no points', () => {
    expect(orbitPoints(1, 104)[0]?.x).toBeCloseTo(0);
    expect(orbitPoints(1, 104)[0]?.y).toBeCloseTo(-104);
    expect(orbitPoints(0, 104)).toEqual([]);
    expect(orbitPoints(Number.NaN, 104)).toEqual([]);
  });
  test('five targets fit above the trigger with at least 48px between centers', () => {
    const points = orbitPoints(5, 80);
    for (const [index, point] of points.entries()) {
      expect(point.y).toBeLessThan(0);
      for (const other of points.slice(index + 1))
        expect(Math.hypot(point.x - other.x, point.y - other.y)).toBeGreaterThan(48);
    }
    expect(orbitPoints(100, 104)).toHaveLength(5);
  });
});
