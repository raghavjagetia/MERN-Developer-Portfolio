import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB, isConnected } from './db.js';
import contentRoutes from './routes/content.js';
import contactRoutes from './routes/contact.js';
import eventRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';

// The Express app is shared by the local server (server.js) and the Vercel function (api/index.js).
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
if (process.env.CLIENT_URL) app.use(cors({ origin: process.env.CLIENT_URL.split(',').map((s) => s.trim()) }));

// Make sure MongoDB is connected (or skipped) before handling API requests.
app.use('/api', async (req, res, next) => {
  await connectDB();
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: isConnected() ? 'connected' : process.env.MONGO_URI ? 'unreachable' : 'not configured',
    dbName: isConnected() ? mongoose.connection.name : null,
  });
});

app.use('/api', contentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

export default app;
