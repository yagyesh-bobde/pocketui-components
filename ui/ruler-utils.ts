/** Keep tick arithmetic bounded and deterministic, including fractional steps. */
export function createRulerScale(min: number, max: number, step: number) {
  if (![min, max, step].every(Number.isFinite) || max <= min || step <= 0)
    throw new Error('RulerPicker needs finite min < max and a positive step.');
  const count = Math.round((max - min) / step);
  if (count < 1 || count > 1000 || Math.abs(min + count * step - max) > step * 0.000001)
    throw new Error('RulerPicker needs 1–1000 equal steps ending at max.');
  const at = (index: number) =>
    Number((min + Math.max(0, Math.min(count, index)) * step).toFixed(10));
  const indexOf = (value: number) =>
    Math.max(0, Math.min(count, Math.round(((Number.isFinite(value) ? value : min) - min) / step)));
  return { count, at, indexOf };
}
