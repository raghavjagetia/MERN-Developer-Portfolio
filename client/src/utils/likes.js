import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

const KEY = 'portfolio_likes_v1';
const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};

// Latest like counts from the server, shared by every component in this tab.
const counts = {};
const listeners = new Set();
const notify = () => listeners.forEach((f) => f());

// Which articles this visitor liked (kept in the browser) plus server-backed like counts.
export function useLikes() {
  const [liked, setLiked] = useState(read);
  const [, rerender] = useState(0);

  useEffect(() => {
    const f = () => rerender((n) => n + 1);
    listeners.add(f);
    return () => listeners.delete(f);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(liked)); } catch { /* ignore */ }
  }, [liked]);

  const countOf = useCallback((a) => counts[a.id] ?? a.likes ?? 0, []);

  const toggle = useCallback(async (a) => {
    const next = !liked[a.id];
    setLiked((l) => ({ ...l, [a.id]: next }));
    counts[a.id] = Math.max(0, (counts[a.id] ?? a.likes ?? 0) + (next ? 1 : -1)); // optimistic
    notify();
    try {
      const { likes } = await api(`/api/articles/${a.id}/like`, { method: 'POST', body: { liked: next } });
      counts[a.id] = likes;
      notify();
    } catch { /* keep optimistic count */ }
  }, [liked]);

  return { liked, toggle, countOf };
}
