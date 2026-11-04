/** Bound slot count so accidental invalid props cannot create an unbounded layout. */
export function otpLength(length: number): number {
  return Number.isFinite(length) ? Math.max(1, Math.min(8, Math.trunc(length))) : 6;
}

/** Filter before truncating: pasted SMS codes may contain spaces and separators. */
export function otpDigits(value: string, length: number): string {
  return value.replace(/[^0-9]/g, '').slice(0, otpLength(length));
}
