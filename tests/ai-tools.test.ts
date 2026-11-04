import { describe, expect, test } from 'bun:test';
import { diffCounts, safeCitationUrl } from '../ui/ai-tool-utils';

describe('citation navigation', () => {
  test('normalizes ordinary web sources and keeps query and fragment context', () => {
    expect(safeCitationUrl('https://reactnative.dev/docs/accessibility?platform=ios#roles')).toBe(
      'https://reactnative.dev/docs/accessibility?platform=ios#roles',
    );
    expect(safeCitationUrl('http://example.com')).toBe('http://example.com/');
  });

  test('does not hand executable, local, relative, or credential-bearing links to the device', () => {
    for (const value of [
      undefined,
      '',
      'not a link',
      '/docs/accessibility',
      'javascript:alert(1)',
      'file:///etc/hosts',
      'data:text/html,hello',
      'mailto:person@example.com',
      'https://user:password@example.com',
      'https://user@example.com',
      'https://',
    ]) {
      expect(safeCitationUrl(value)).toBeUndefined();
    }
  });
});

describe('displayed diff counts', () => {
  test('counts changes without counting unchanged context as work', () => {
    expect(
      diffCounts([
        { type: 'context', text: 'const theme = {' },
        { type: 'removed', text: '  spacing: 8,' },
        { type: 'added', text: '  spacing: 16,' },
        { type: 'added', text: '' },
        { type: 'context', text: '};' },
      ]),
    ).toEqual({ added: 2, removed: 1 });
    expect(diffCounts([])).toEqual({ added: 0, removed: 0 });
    expect(diffCounts([{ type: 'context', text: 'unchanged' }])).toEqual({
      added: 0,
      removed: 0,
    });
  });
});
