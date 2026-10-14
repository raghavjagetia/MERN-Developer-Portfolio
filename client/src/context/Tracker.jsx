import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { projects, articles, skillGroups, allTech } from '../data/data.js';
import { beacon } from '../utils/api.js';

// Anonymous per-tab session id so the server can count unique visitors.
const sessionId = (() => {
  try {
    let id = sessionStorage.getItem('portfolio_session');
    if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('portfolio_session', id); }
    return id;
  } catch { return null; }
})();

const KEY = 'portfolio_events_v1';
const Ctx = createContext(null);

// Journey: Visit → Project View → Tech Click → Case Study → Skill Exploration → Resume View → Contact Intent
export const EVENT_TYPES = {
  visit: { label: 'Portfolio Visit', weight: 1 },
  project_view: { label: 'Project View', weight: 2 },
  tech_click: { label: 'Technology Click', weight: 2 },
  case_study: { label: 'Case Study Read', weight: 4 },
  skill_explore: { label: 'Skill Exploration', weight: 2 },
  article_read: { label: 'Article Read', weight: 3 },
  resume_view: { label: 'Resume View', weight: 5 },
  contact_intent: { label: 'Contact Intent', weight: 8 },
};

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

const count = (arr) => arr.reduce((m, k) => ((m[k] = (m[k] || 0) + 1), m), {});
const top = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

export function analyze(events) {
  const byType = count(events.map((e) => e.type));
  const projectViews = count(events.filter((e) => ['project_view', 'case_study'].includes(e.type)).map((e) => e.ref));
  const techScore = {};
  const bump = (t, w) => (techScore[t] = (techScore[t] || 0) + w);
  const catScore = {};

  events.forEach((e) => {
    const w = EVENT_TYPES[e.type]?.weight ?? 1;
    if (e.type === 'tech_click' || e.type === 'skill_explore') bump(e.ref, w);
    if (e.type === 'project_view' || e.type === 'case_study') {
      const p = projects.find((x) => x.id === e.ref);
      if (p) {
        p.tech.forEach((t) => bump(t, w / 2));
        catScore[p.category] = (catScore[p.category] || 0) + w;
      }
    }
    if (e.type === 'article_read') {
      const a = articles.find((x) => x.id === e.ref);
      a?.tags.forEach((t) => bump(t, w / 2));
    }
  });

  const interests = top(techScore);
  const categories = top(catScore);
  const skillsExplored = top(count(events.filter((e) => e.type === 'skill_explore').map((e) => e.ref)));
  const seen = new Set(Object.keys(projectViews));

  // Content-based recommendation: score by overlap with interest weights + category affinity.
  const recommendations = projects
    .map((p) => {
      const matched = p.tech.filter((t) => techScore[t]);
      const score = p.tech.reduce((s, t) => s + (techScore[t] || 0), 0) + (catScore[p.category] || 0) * 0.5 + (seen.has(p.id) ? 0 : 3);
      return { project: p, score, matched, unseen: !seen.has(p.id) };
    })
    .sort((a, b) => b.score - a.score);

  const recommendedArticles = articles
    .map((a) => ({ article: a, score: a.tags.reduce((s, t) => s + (techScore[t] || 0), 0), matched: a.tags.filter((t) => techScore[t]) }))
    .sort((a, b) => b.score - a.score);

  // Contact-interest indicator: weighted funnel depth, capped at 100.
  const raw = events.reduce((s, e) => s + (EVENT_TYPES[e.type]?.weight ?? 0), 0);
  const contactScore = Math.min(100, Math.round(raw * 1.6));
  const contactLevel = contactScore >= 70 ? 'Hot' : contactScore >= 35 ? 'Warm' : 'Cold';

  const stage = ['contact_intent', 'resume_view', 'case_study', 'tech_click', 'project_view', 'visit'].find((t) => byType[t]) || 'visit';
  const visitorType =
    !events.length ? 'No data yet' :
    byType.contact_intent || byType.resume_view ? 'Hiring / Client Prospect' :
    byType.case_study >= 2 ? 'Technical Evaluator' :
    (byType.article_read || 0) >= 2 ? 'Learner / Reader' : 'Casual Explorer';

  return { byType, projectViews, interests, categories, skillsExplored, recommendations, recommendedArticles, contactScore, contactLevel, stage, visitorType, total: events.length };
}

export function TrackerProvider({ children }) {
  const [events, setEvents] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(events.slice(-500))); } catch { /* ignore */ }
  }, [events]);

  const track = useCallback((type, ref = null) => {
    setEvents((prev) => [...prev, { type, ref, ts: Date.now() }]);
    beacon('/api/events', { type, ref, sessionId }); // real events also go to the backend
  }, []);

  const reset = useCallback(() => setEvents([]), []);

  // Fabricate a plausible visitor session following the funnel, biased to a random persona.
  const simulate = useCallback((persona = 'random') => {
    const personas = {
      frontend: { tech: ['React', 'Redux', 'TypeScript', 'CSS / Tailwind'], cat: ['Dashboard', 'E-commerce'] },
      backend: { tech: ['Node.js', 'Express', 'MongoDB', 'Socket.io'], cat: ['Web App', 'AI / ML'] },
      data: { tech: ['PostgreSQL', 'REST APIs', 'Redis', 'GraphQL'], cat: ['Dashboard', 'AI / ML'] },
    };
    const keys = Object.keys(personas);
    const p = personas[persona === 'random' ? keys[Math.floor(Math.random() * keys.length)] : persona];
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const matching = projects.filter((x) => p.cat.includes(x.category) || x.tech.some((t) => p.tech.includes(t)));
    const pool = matching.length ? matching : projects;
    const now = Date.now();
    const out = [{ type: 'visit' }];
    for (let i = 0; i < 3; i++) out.push({ type: 'project_view', ref: pick(pool).id });
    for (let i = 0; i < 3; i++) out.push({ type: 'tech_click', ref: pick(p.tech) });
    out.push({ type: 'case_study', ref: pick(pool).id });
    for (let i = 0; i < 2; i++) out.push({ type: 'skill_explore', ref: pick(p.tech) });
    out.push({ type: 'article_read', ref: pick(articles.filter((a) => a.tags.some((t) => p.tech.includes(t))) .concat(articles[0])).id });
    if (Math.random() > 0.3) out.push({ type: 'resume_view' });
    if (Math.random() > 0.5) out.push({ type: 'contact_intent' });
    setEvents((prev) => [...prev, ...out.map((e, i) => ({ ref: null, ...e, ts: now + i * 1000, simulated: true }))]);
  }, []);

  // One random event, weighted toward early funnel stages — drives the dashboard's live mode.
  const simulateOne = useCallback(() => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const skills = skillGroups.flatMap((g) => g.skills.map((s) => s.name));
    const r = Math.random();
    const e =
      r < 0.3 ? { type: 'project_view', ref: pick(projects).id } :
      r < 0.52 ? { type: 'tech_click', ref: pick(allTech) } :
      r < 0.68 ? { type: 'skill_explore', ref: pick(skills) } :
      r < 0.8 ? { type: 'case_study', ref: pick(projects).id } :
      r < 0.9 ? { type: 'article_read', ref: pick(articles).id } :
      r < 0.96 ? { type: 'resume_view', ref: null } : { type: 'contact_intent', ref: 'live' };
    setEvents((prev) => [...prev, { ...e, ts: Date.now(), simulated: true }]);
  }, []);

  const insights = useMemo(() => analyze(events), [events]);

  return <Ctx.Provider value={{ events, track, reset, simulate, simulateOne, insights }}>{children}</Ctx.Provider>;
}

export const useTracker = () => useContext(Ctx);
export { allTech, skillGroups };
