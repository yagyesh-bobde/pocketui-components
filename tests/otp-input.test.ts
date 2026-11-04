import { describe, expect, test } from 'bun:test';
import { otpDigits, otpLength } from '../ui/otp-input-state';

describe('verification-code entry', () => {
  test('accepts a formatted pasted code without losing digits to separators', () => {
    expect(otpDigits('12 34-56', 6)).toBe('123456');
    expect(otpDigits(' 2468\n', 4)).toBe('2468');
  });

  test('keeps leading zeroes and bounds an overlong paste to the configured length', () => {
    expect(otpDigits('0012345678', 6)).toBe('001234');
    expect(otpDigits('', 6)).toBe('');
    expect(otpDigits('code: abcd', 6)).toBe('');
  });

  test('invalid slot counts stay within a usable layout', () => {
    expect(otpLength(Number.NaN)).toBe(6);
    expect(otpLength(Number.POSITIVE_INFINITY)).toBe(6);
    expect(otpLength(0)).toBe(1);
    expect(otpLength(100000)).toBe(8);
    expect(otpLength(4.9)).toBe(4);
  });
});
