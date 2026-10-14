import { Router } from 'express';
import { Inquiry } from '../models/index.js';
import { isConnected } from '../db.js';
import { ah, requireAdmin } from '../lib/middleware.js';

const router = Router();
router.use(requireAdmin);
router.use((req, res, next) => (isConnected() ? next() : res.status(503).json({ error: 'Database unavailable.' })));

// GET /api/admin/inquiries   (header: x-admin-key: <ADMIN_KEY>)
router.get('/inquiries', ah(async (req, res) => {
  res.json(await Inquiry.find().sort({ createdAt: -1 }).limit(200).lean());
}));

// PATCH /api/admin/inquiries/:id  { status: "read" | "replied" }
router.patch('/inquiries/:id', ah(async (req, res) => {
  const doc = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body?.status }, { new: true, runValidators: true }).lean();
  if (!doc) return res.status(404).json({ error: 'Inquiry not found' });
  res.json(doc);
}));

export default router;
