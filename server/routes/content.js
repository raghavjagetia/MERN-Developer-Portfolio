import { Router } from 'express';
import { COLLECTIONS, dataSource, findBySlug, getProfile, likeArticle, list } from '../lib/store.js';
import { ah, rateLimit } from '../lib/middleware.js';

const router = Router();

// Everything the frontend needs in one round trip.
router.get('/bootstrap', ah(async (req, res) => {
  const [profile, ...lists] = await Promise.all([getProfile(), ...COLLECTIONS.map(list)]);
  const body = { source: dataSource(), profile };
  COLLECTIONS.forEach((name, i) => { body[name] = lists[i]; });
  // Browsers always revalidate; Vercel's CDN may cache for 60s to absorb traffic spikes.
  res.set('Cache-Control', 'no-cache');
  res.set('CDN-Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json(body);
}));

router.get('/profile', ah(async (req, res) => res.json(await getProfile())));

// GET /api/projects?category=SaaS&tech=React&q=chat&featured=true&sort=newest|oldest|az
router.get('/projects', ah(async (req, res) => {
  const { category, tech, q, featured, sort } = req.query;
  const s = String(q || '').toLowerCase();
  let items = (await list('projects')).filter((p) =>
    (!category || p.category === category) &&
    (!tech || p.tech.includes(tech)) &&
    (featured === undefined || p.featured === (featured === 'true')) &&
    (!s || [p.title, p.summary, p.category, ...p.tech].join(' ').toLowerCase().includes(s))
  );
  if (sort === 'newest') items = items.sort((a, b) => b.year - a.year);
  if (sort === 'oldest') items = items.sort((a, b) => a.year - b.year);
  if (sort === 'az') items = items.sort((a, b) => a.title.localeCompare(b.title));
  res.json(items);
}));

router.get('/projects/:slug', ah(async (req, res) => {
  const item = await findBySlug('projects', req.params.slug);
  if (!item) return res.status(404).json({ error: 'Project not found' });
  res.json(item);
}));

// GET /api/articles?tag=React&q=hooks
router.get('/articles', ah(async (req, res) => {
  const { tag, q } = req.query;
  const s = String(q || '').toLowerCase();
  res.json((await list('articles')).filter((a) =>
    (!tag || a.tags.includes(tag)) &&
    (!s || `${a.title} ${a.excerpt} ${a.tags.join(' ')}`.toLowerCase().includes(s))
  ));
}));

router.get('/articles/:slug', ah(async (req, res) => {
  const item = await findBySlug('articles', req.params.slug);
  if (!item) return res.status(404).json({ error: 'Article not found' });
  res.json(item);
}));

// POST /api/articles/:slug/like  { "liked": true | false }
router.post('/articles/:slug/like', rateLimit({ windowMs: 60_000, max: 30 }), ah(async (req, res) => {
  const likes = await likeArticle(req.params.slug, req.body?.liked !== false);
  if (likes === null) return res.status(404).json({ error: 'Article not found' });
  res.json({ likes });
}));

for (const name of ['skills', 'experience', 'certifications', 'achievements', 'testimonials', 'faqs']) {
  router.get(`/${name}`, ah(async (req, res) => res.json(await list(name))));
}

export default router;
