export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Fractions of the usable screen, sorted from shortest to tallest. */
export function sheetSnapHeights(points: readonly number[], available: number): number[] {
  const height = Math.max(1, Number.isFinite(available) ? available : 1);
  const fractions = points.filter(Number.isFinite).map((point) => clamp(point, 0.15, 1));
  return [...new Set(fractions.length ? fractions : [0.5, 0.9])]
    .sort((a, b) => a - b)
    .map((point) => Math.round(point * height));
}

export function sheetDestination(
  height: number,
  dy: number,
  velocity: number,
  snaps: readonly number[],
  dismissible: boolean,
): number {
  const projected = height - dy - velocity * 140;
  const first = snaps[0] ?? height;
  if (dismissible && projected < first * 0.65) return 0;
  return snaps.reduce(
    (best, snap) => (Math.abs(snap - projected) < Math.abs(best - projected) ? snap : best),
    first,
  );
}

export function swipeDestination(offset: number, velocity: number, width: number): number {
  if (velocity < -0.35) return -width;
  if (velocity > 0.35) return 0;
  return offset < -width * 0.4 ? -width : 0;
}

/** Prefer below the anchor, flip above when needed, then clamp to the safe viewport. */
export function menuPosition(
  anchor: Rect,
  screen: Rect,
  menu: { width: number; height: number },
): { left: number; top: number } {
  const edge = 12;
  const left = clamp(
    anchor.x,
    screen.x + edge,
    Math.max(screen.x + edge, screen.x + screen.width - menu.width - edge),
  );
  const below = anchor.y + anchor.height + 8;
  const top =
    below + menu.height <= screen.y + screen.height - edge ? below : anchor.y - menu.height - 8;
  return {
    left,
    top: clamp(
      top,
      screen.y + edge,
      Math.max(screen.y + edge, screen.y + screen.height - menu.height - edge),
    ),
  };
}

export function toastDuration(duration: number | undefined): number {
  if (duration === 0) return 0;
  return Number.isFinite(duration) ? clamp(duration ?? 5000, 1000, 15000) : 5000;
}
