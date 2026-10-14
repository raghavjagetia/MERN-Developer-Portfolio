// Wrap async route handlers so rejected promises reach the Express error handler.
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Simple in-memory per-IP rate limiter (per instance; good enough to deter spam).
export function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const recent = (hits.get(req.ip) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) return res.status(429).json({ error: 'Too many requests, please try again later.' });
    recent.push(now);
    hits.set(req.ip, recent);
    if (hits.size > 5000) hits.clear();
    next();
  };
}

export function requireAdmin(req, res, next) {
  const key = process.env.ADMIN_KEY;
  if (!key) return res.status(403).json({ error: 'Admin API disabled. Set ADMIN_KEY to enable it.' });
  if (req.get('x-admin-key') !== key) return res.status(401).json({ error: 'Invalid admin key.' });
  next();
}
