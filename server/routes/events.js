import { Router } from 'express';
import { Event, EVENT_TYPES } from '../models/index.js';
import { isConnected } from '../db.js';
import { ah, rateLimit } from '../lib/middleware.js';

const router = Router();
const memory = []; // used when no database is configured (per instance, capped)

// POST /api/events  { type, ref, sessionId }
router.post('/', rateLimit({ windowMs: 60 * 60 * 1000, max: 500 }), ah(async (req, res) => {
  const { type, ref, sessionId } = req.body || {};
  if (!EVENT_TYPES.includes(type)) return res.status(400).json({ error: 'Unknown event type.' });
  const doc = { type, ref: ref ? String(ref).slice(0, 100) : null, sessionId: sessionId ? String(sessionId).slice(0, 64) : null };
  if (isConnected()) await Event.create(doc);
  else {
    memory.push({ ...doc, createdAt: new Date() });
    if (memory.length > 2000) memory.shift();
  }
  res.status(201).json({ ok: true });
}));

const top = (counts, n = 8) => Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, value]) => ({ name, value }));

// GET /api/events/summary — aggregate behaviour across all visitors.
router.get('/summary', ah(async (req, res) => {
  const events = isConnected()
    ? await Event.find({}, { type: 1, ref: 1, sessionId: 1 }).sort({ createdAt: -1 }).limit(10_000).lean()
    : memory;
  const byType = {};
  const projects = {};
  const tech = {};
  const sessions = new Set();
  for (const e of events) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    if (e.sessionId) sessions.add(e.sessionId);
    if ((e.type === 'project_view' || e.type === 'case_study') && e.ref) projects[e.ref] = (projects[e.ref] || 0) + 1;
    if ((e.type === 'tech_click' || e.type === 'skill_explore') && e.ref) tech[e.ref] = (tech[e.ref] || 0) + 1;
  }
  res.json({
    source: isConnected() ? 'mongodb' : 'memory',
    total: events.length,
    sessions: sessions.size,
    byType,
    topProjects: top(projects),
    topTech: top(tech),
  });
}));

export default router;
