import { describe, expect, test } from 'bun:test';
import { animationMs, scrambleFrame, textCharacters } from '../ui/text-animation-utils';

describe('text animation inputs', () => {
  test('typing preserves emoji, skin tones, flags, and combining marks', () => {
    expect(textCharacters('Hi 👩🏽‍💻🇮🇳 e\u0301!')).toEqual([
      'H',
      'i',
      ' ',
      '👩🏽‍💻',
      '🇮🇳',
      ' ',
      'e\u0301',
      '!',
    ]);
    expect(textCharacters('👨‍👩‍👧‍👦1️⃣')).toEqual(['👨‍👩‍👧‍👦', '1️⃣']);
    expect(textCharacters('')).toEqual([]);
  });

  test('invalid or extreme timing never becomes an unbounded timer', () => {
    expect(animationMs(Number.NaN, 450)).toBe(450);
    expect(animationMs(Number.POSITIVE_INFINITY, 450)).toBe(450);
    expect(animationMs(-100, 450)).toBe(0);
    expect(animationMs(0, 55, 16)).toBe(16);
    expect(animationMs(100_000, 450)).toBe(60_000);
  });

  test('scramble keeps whitespace and resolves to the exact original message', () => {
    const text = 'Hello 👋🏽\n世界!';
    const characters = textCharacters(text);
    expect(scrambleFrame(characters, 0, 1)).toMatch(/^\S{5} \S\n\S{3}$/u);
    expect(scrambleFrame(characters, 1, 99)).toBe(text);
    expect(scrambleFrame(characters, 2, 99)).toBe(text);
    expect(scrambleFrame([], 0, 0)).toBe('');
  });
});
