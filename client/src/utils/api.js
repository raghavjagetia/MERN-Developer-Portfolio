// Empty on Vercel / local dev (same origin, Vite proxies /api). Set VITE_API_URL for a separate API host.
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function api(path, options = {}) {
  const res = await fetch(API_URL + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Fire-and-forget POST that survives page navigation.
export function beacon(path, body) {
  try {
    fetch(API_URL + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {});
  } catch { /* ignore */ }
}
