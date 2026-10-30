export interface ScreenOrigin {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly radius?: number;
}

export function pageIndex(index: number, count: number): number {
  'worklet';
  return Math.max(
    0,
    Math.min(Math.max(0, count - 1), Number.isFinite(index) ? Math.round(index) : 0),
  );
}

/** A drag can commit at most one neighbour; a short, deliberate flick also advances. */
export function cubeLanding(
  position: number,
  velocity: number,
  settled: number,
  count: number,
): number {
  'worklet';
  const projected = position + Math.max(-0.35, Math.min(0.35, velocity * 0.12));
  const target = Math.max(settled - 1, Math.min(settled + 1, Math.round(projected)));
  return pageIndex(target, count);
}

/** Convert a measured window rectangle into a bounded rectangle inside the modal. */
export function screenOrigin(
  origin: ScreenOrigin | undefined,
  width: number,
  height: number,
  windowX = 0,
  windowY = 0,
): Required<ScreenOrigin> {
  width = Number.isFinite(width) ? Math.max(1, width) : 1;
  height = Number.isFinite(height) ? Math.max(1, height) : 1;
  const valid =
    origin &&
    [origin.x, origin.y, origin.width, origin.height].every(Number.isFinite) &&
    origin.width > 0 &&
    origin.height > 0;
  const source = valid
    ? origin
    : {
        x: width * 0.1 + windowX,
        y: height * 0.4 + windowY,
        width: width * 0.8,
        height: 80,
        radius: 24,
      };
  const x = Math.max(0, Math.min(Math.max(0, width - 1), source.x - windowX));
  const y = Math.max(0, Math.min(Math.max(0, height - 1), source.y - windowY));
  const w = Math.max(1, Math.min(width, source.x - windowX + source.width) - x);
  const h = Math.max(1, Math.min(height, source.y - windowY + source.height) - y);
  const radius = Number.isFinite(source.radius) ? Math.max(0, source.radius ?? 24) : 24;
  return { x, y, width: w, height: h, radius: Math.min(radius, w / 2, h / 2) };
}
