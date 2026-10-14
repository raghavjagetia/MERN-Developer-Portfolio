import { Router } from 'express';
import { Inquiry } from '../models/index.js';
import { isConnected } from '../db.js';
import { ah, rateLimit } from '../lib/middleware.js';

const router = Router();
const EMAIL = /^\S+@\S+\.\S+$/;

// POST /api/contact  { name, email, type, message }
router.post('/', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), ah(async (req, res) => {
  const { name, email, type, message } = req.body || {};
  if (!name?.trim() || !email?.trim() || !message?.trim()) return res.status(400).json({ error: 'Name, email and message are required.' });
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (message.length > 5000) return res.status(400).json({ error: 'Message is too long.' });
  // Without a database the client falls back to opening the visitor's email app.
  if (!isConnected()) return res.status(503).json({ error: 'Database unavailable.' });

  const inquiry = await Inquiry.create({ name, email, type, message });
  res.status(201).json({ ok: true, id: inquiry._id });
}));

export default router;
