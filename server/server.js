// Local / traditional-host entry point. On Vercel, api/index.js is used instead.
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { connectDB } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;

// Serve the built React app if it exists (`npm run build` then `npm start`).
const dist = path.join(__dirname, '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, async () => {
  console.log(`API running on http://localhost:${PORT}/api`);
  if (!process.env.MONGO_URI) console.warn('MONGO_URI not set — serving seed data from server/seed/data.js');
  else await connectDB();
});
