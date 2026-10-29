import { describe, expect, test } from 'bun:test';
import { dishIndex, dishLanding, dishQuantity, dishSnap } from '../ui/dish-carousel-state';

describe('cyclic dish pager', () => {
  test('both clone rounds land on the same dish in the middle round', () => {
    for (let slot = 0; slot < 24; slot++) {
      const landed = dishLanding(slot, 8);
      expect(landed).toBeGreaterThanOrEqual(8);
      expect(landed).toBeLessThan(16);
      expect(dishIndex(landed, 8)).toBe(dishIndex(slot, 8));
    }
    expect(dishLanding(7, 8)).toBe(15);
    expect(dishLanding(16, 8)).toBe(8);
  });

  test('one or zero dishes never produce an invalid slot', () => {
    expect(dishLanding(10, 0)).toBe(0);
    expect(dishLanding(-1, 1)).toBe(0);
    expect(dishIndex(-1, 8)).toBe(7);
  });

  test('short gestures return, distance advances one page, reversal follows release velocity', () => {
    expect(dishSnap(8, 0.2, 0.1)).toBe(8);
    expect(dishSnap(8, 0.6, 0)).toBe(9);
    expect(dishSnap(8, -0.6, 0)).toBe(7);
    expect(dishSnap(8, 0.1, 0.8)).toBe(9);
    expect(dishSnap(8, 0.7, -0.8)).toBe(7);
    expect(dishSnap(8, 3, 0)).toBe(9);
  });
});

describe('dish stepper', () => {
  test('counts are whole, non-negative and capped by product availability', () => {
    expect(dishQuantity(-1, 5)).toBe(0);
    expect(dishQuantity(2.9, 5)).toBe(2);
    expect(dishQuantity(6, 5)).toBe(5);
    expect(dishQuantity(1, 0)).toBe(0);
    expect(dishQuantity(1, -2)).toBe(0);
    expect(dishQuantity(31)).toBe(30);
  });
});
