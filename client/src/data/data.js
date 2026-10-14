// Portfolio content, loaded once from the API (`GET /api/bootstrap`) before the app renders.
// These are ES module live bindings: after `loadData()` resolves, every module that imported
// them sees the loaded values. Only read them inside components/functions, never at module top level.
import { api } from '../utils/api.js';

export let profile = null;
export let projects = [];
export let articles = [];
export let skillGroups = [];
export let experience = [];
export let education = [];
export let certifications = [];
export let achievements = [];
export let testimonials = [];
export let faqs = [];
export let categories = [];
export let allTech = [];
export let roles = [];
export let services = [];
export let processSteps = [];
export let funFacts = [];
export let dataSource = 'seed';

export async function loadData() {
  const d = await api('/api/bootstrap');
  profile = d.profile;
  projects = d.projects;
  articles = d.articles;
  certifications = d.certifications;
  achievements = d.achievements;
  testimonials = d.testimonials;
  faqs = d.faqs;
  experience = d.experience.filter((e) => e.kind === 'work');
  education = d.experience.filter((e) => e.kind === 'edu');
  dataSource = d.source;

  // Group skills by category, keeping the API order.
  const groups = new Map();
  for (const s of d.skills) {
    if (!groups.has(s.category)) groups.set(s.category, []);
    groups.get(s.category).push(s);
  }
  skillGroups = [...groups].map(([category, skills]) => ({ category, skills }));

  categories = profile.categories?.length ? profile.categories : [...new Set(projects.map((p) => p.category))];
  allTech = [...new Set(projects.flatMap((p) => p.tech))].sort();
  roles = profile.roles || [profile.role];
  services = profile.services || [];
  processSteps = profile.processSteps || [];
  funFacts = profile.funFacts || [];
}
