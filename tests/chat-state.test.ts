import { describe, expect, test } from 'bun:test';
import { isAtChatBottom, todoProgress } from '../ui/chat-state';

describe('conversation following', () => {
  test('follows at the threshold and pauses when reading older messages', () => {
    expect(isAtChatBottom(428, 1000, 500, 72)).toBe(true);
    expect(isAtChatBottom(427, 1000, 500, 72)).toBe(false);
    expect(isAtChatBottom(0, 300, 500)).toBe(true);
    expect(isAtChatBottom(-30, 300, 500)).toBe(true);
    expect(isAtChatBottom(540, 1000, 500)).toBe(true);
  });

  test('new content leaves a reader in place while the viewport stays still', () => {
    expect(isAtChatBottom(500, 1000, 500)).toBe(true);
    expect(isAtChatBottom(500, 1300, 500)).toBe(false);
    expect(isAtChatBottom(800, 1300, 500)).toBe(true);
    expect(isAtChatBottom(Number.NaN, 1000, 500)).toBe(false);
  });
});

describe('task progress', () => {
  test('counts completed tasks without treating running or blocked work as complete', () => {
    expect(
      todoProgress([
        { status: 'completed' },
        { status: 'in-progress' },
        { status: 'pending' },
        { status: 'blocked' },
      ]),
    ).toEqual({ total: 4, completed: 1, percent: 25 });
    expect(todoProgress([{ status: 'completed' }, { status: 'completed' }])).toEqual({
      total: 2,
      completed: 2,
      percent: 100,
    });
    expect(todoProgress([])).toEqual({ total: 0, completed: 0, percent: 0 });
  });
});
