/** Negative bounce offsets and short content still count as the bottom. */
export function isAtChatBottom(
  offset: number,
  content: number,
  viewport: number,
  threshold = 72,
): boolean {
  if (![offset, content, viewport].every(Number.isFinite)) return false;
  const distance = Math.max(0, content - Math.max(0, viewport)) - Math.max(0, offset);
  const tolerance = Number.isFinite(threshold) ? Math.max(0, threshold) : 72;
  return distance <= tolerance;
}

export type TodoStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';

export function todoProgress(items: readonly { status: TodoStatus }[]) {
  const completed = items.filter((item) => item.status === 'completed').length;
  return {
    total: items.length,
    completed,
    percent: items.length ? Math.round((completed / items.length) * 100) : 0,
  };
}
