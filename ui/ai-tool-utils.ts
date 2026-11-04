import { useCallback, useEffect, useRef, useState } from 'react';

/** Only ordinary web links are opened by the built-in citation handler. */
export function safeCitationUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      !url.hostname ||
      url.username ||
      url.password
    )
      return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export interface DiffLine {
  type: 'context' | 'added' | 'removed';
  text: string;
}

export function diffCounts(lines: readonly DiffLine[]): { added: number; removed: number } {
  return lines.reduce(
    (count, line) => ({
      added: count.added + Number(line.type === 'added'),
      removed: count.removed + Number(line.type === 'removed'),
    }),
    { added: 0, removed: 0 },
  );
}

/** Guard overlapping host callbacks and ignore results after a request changes or unmounts. */
export function useHostAction(requestKey: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revision = useRef(0);
  const pending = useRef(false);
  const key = useRef(requestKey);
  useEffect(() => {
    key.current = requestKey;
    revision.current += 1;
    pending.current = false;
    setBusy(false);
    setError(null);
    return () => {
      revision.current += 1;
      pending.current = false;
    };
  }, [requestKey]);
  const run = useCallback(async (action: () => void | Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    const token = revision.current;
    const operationKey = key.current;
    try {
      await action();
    } catch {
      if (token === revision.current && operationKey === key.current)
        setError('The action could not be completed. Try again.');
    } finally {
      if (token === revision.current && operationKey === key.current) {
        pending.current = false;
        setBusy(false);
      }
    }
  }, []);
  return { busy, error, run };
}
