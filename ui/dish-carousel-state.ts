/** The pager keeps a full round on either side so a swipe always has a neighbour. */
export function dishIndex(slot: number, count: number): number {
  return count > 0 ? ((slot % count) + count) % count : 0;
}

export function dishLanding(slot: number, count: number): number {
  return count > 1 ? count + dishIndex(Math.round(slot), count) : 0;
}

/** One page per fling; a short, slow drag returns to the current dish. */
export function dishSnap(start: number, delta: number, velocity: number): number {
  if (Math.abs(delta) > 0.5 || Math.abs(velocity) > 0.45) {
    return start + (Math.abs(velocity) > 0.45 ? Math.sign(velocity) : Math.sign(delta));
  }
  return start;
}

export function dishQuantity(value: number, max = 30): number {
  return Math.max(0, Math.min(Math.max(0, Math.floor(max)), Math.floor(value)));
}
