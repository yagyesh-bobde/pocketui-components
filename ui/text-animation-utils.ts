/** Keep user-supplied timing finite and within a useful range. */
export function animationMs(value: number, fallback: number, minimum = 0): number {
  return Number.isFinite(value) ? Math.min(60_000, Math.max(minimum, value)) : fallback;
}

/** Segment emoji and combining marks together, including on Hermes without Intl.Segmenter. */
export function textCharacters(text: string): string[] {
  const characters: string[] = [];
  let regionalCount = 0;
  for (const character of Array.from(text)) {
    const previous = characters.at(-1);
    const regional = /\p{Regional_Indicator}/u.test(character);
    const attached = /\p{Mark}|\p{Emoji_Modifier}|\u200d|[\u{e0020}-\u{e007f}]/u.test(character);
    if (
      previous !== undefined &&
      (attached || previous.endsWith('\u200d') || (regional && regionalCount % 2 === 1))
    ) {
      characters[characters.length - 1] = previous + character;
    } else {
      characters.push(character);
    }
    regionalCount = regional ? regionalCount + 1 : 0;
  }
  return characters;
}

/** Source offsets identify repeated words/letters; changing the message remounts its parts. */
export function textParts(text: string, words = false) {
  let offset = 0;
  return (words ? (text.match(/\s*\S+\s*|\s+/gu) ?? []) : textCharacters(text)).map(
    (value, index) => {
      const key = `${text}:${offset}`;
      offset += value.length;
      return { key, text: value, index };
    },
  );
}

/** Deterministic intermediate text; the final frame is always the original string. */
export function scrambleFrame(
  characters: readonly string[],
  progress: number,
  frame: number,
): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const settled = Math.floor(Math.max(0, Math.min(1, progress)) * characters.length);
  return characters
    .map((character, index) =>
      index < settled || /^\s+$/u.test(character)
        ? character
        : alphabet[(index * 7 + frame * 11) % alphabet.length],
    )
    .join('');
}
