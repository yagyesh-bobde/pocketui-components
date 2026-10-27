export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Physical left/right directions; these do not change with the reading direction. */
export function deckDirection(
  dx: number,
  velocity: number,
  width: number,
): 'left' | 'right' | null {
  if (width <= 0 || ![dx, velocity, width].every(Number.isFinite)) return null;
  if (Math.abs(dx) >= width * 0.27) return dx < 0 ? 'left' : 'right';
  if (Math.abs(dx) >= 12 && Math.abs(velocity) >= 0.65 && dx * velocity > 0) {
    return dx < 0 ? 'left' : 'right';
  }
  return null;
}

/** A top-facing fan. Keeping buttons above the trigger leaves room for their labels. */
export function orbitPoints(count: number, radius: number): readonly Point[] {
  const length = Math.max(0, Math.min(5, Math.floor(Number.isFinite(count) ? count : 0)));
  const distance = Math.max(80, Math.min(140, Number.isFinite(radius) ? radius : 104));
  return Array.from({ length }, (_, index) => {
    const angle = ((length === 1 ? -90 : -165 + (150 * index) / (length - 1)) * Math.PI) / 180;
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  });
}

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = dx * dx + dy * dy;
  const t =
    length === 0
      ? 0
      : Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length));
  return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy);
}

/** Fixed-size coverage grid: retracing a stroke cannot inflate the revealed area. */
export function createScratchTracker(width: number, height: number, brushSize: number) {
  const columns = 24;
  const rows = Math.max(1, Math.min(48, Math.round((columns * height) / width) || 1));
  const cells = new Set<number>();
  return {
    add(start: Point, end: Point): number {
      if (
        width <= 0 ||
        height <= 0 ||
        ![width, height, brushSize, start.x, start.y, end.x, end.y].every(Number.isFinite)
      )
        return 0;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const point = { x: ((column + 0.5) * width) / columns, y: ((row + 0.5) * height) / rows };
          if (distanceToSegment(point, start, end) <= brushSize / 2)
            cells.add(row * columns + column);
        }
      }
      return cells.size / (columns * rows);
    },
  };
}
