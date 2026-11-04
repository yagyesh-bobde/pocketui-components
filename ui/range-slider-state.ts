/** Bounds a value and snaps to the nearest step. The final maximum is always reachable. */
export function normalizeRangeValue(value: number, min: number, max: number, step: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || !Number.isFinite(max - min))
    throw new Error('RangeSlider requires finite min < max.');
  if (!Number.isFinite(step) || step <= 0 || step > max - min)
    throw new Error('RangeSlider step must be positive and no larger than its range.');
  const bounded = Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
  const snapped = min + Math.round((bounded - min) / step) * step;
  const nearest = Math.abs(max - bounded) < Math.abs(snapped - bounded) ? max : snapped;
  if (nearest <= min) return min;
  if (nearest >= max) return max;
  // Remove arithmetic display noise only when doing so is negligible beside one step.
  const rounded = Number(nearest.toPrecision(15));
  const cleaned = Math.abs(rounded - nearest) < step * 1e-8 ? rounded : nearest;
  return Math.max(min, Math.min(max, cleaned));
}

/** Moves to the adjacent stop, including the short final interval on uneven scales. */
export function adjacentRangeValue(
  value: number,
  direction: -1 | 1,
  min: number,
  max: number,
  step: number,
): number {
  const current = normalizeRangeValue(value, min, max, step);
  if (direction < 0 && current === max) {
    const count = (max - min) / step;
    const integer = Math.round(count);
    const stable = Math.abs(count - integer) <= Number.EPSILON * Math.max(1, count) * 4;
    const lastIndex = Math.max(0, Math.ceil(stable ? integer : count) - 1);
    return normalizeRangeValue(min + lastIndex * step, min, max, step);
  }
  return normalizeRangeValue(current + direction * step, min, max, step);
}
