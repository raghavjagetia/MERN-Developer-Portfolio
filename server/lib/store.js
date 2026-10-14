import * as seed from '../seed/data.js';
import { Achievement, Article, Certification, Experience, Faq, Profile, Project, Skill, Testimonial } from '../models/index.js';
import { isConnected } from '../db.js';

// Each collection, its model and the seed data used when MongoDB is unavailable or empty.
const collections = {
  projects: [Project, seed.projects],
  articles: [Article, seed.articles],
  skills: [Skill, seed.skills],
  experience: [Experience, seed.experience],
  certifications: [Certification, seed.certifications],
  achievements: [Achievement, seed.achievements],
  testimonials: [Testimonial, seed.testimonials],
  faqs: [Faq, seed.faqs],
};

export const COLLECTIONS = Object.keys(collections);

// Strip Mongo internals and expose `slug` as `id` for the frontend.
export function clean(doc) {
  if (!doc) return doc;
  const { _id, __v, createdAt, updatedAt, order, ...rest } = doc;
  return rest.slug ? { id: rest.slug, ...rest } : rest;
}

export const dataSource = () => (isConnected() ? 'mongodb' : 'seed');

export async function list(name) {
  const [Model, fallback] = collections[name];
  if (isConnected()) {
    const docs = await Model.find().sort({ order: 1, _id: 1 }).lean();
    if (docs.length) return docs.map(clean);
  }
  return fallback.map(clean);
}

export async function findBySlug(name, slug) {
  const [Model, fallback] = collections[name];
  if (isConnected()) {
    const doc = await Model.findOne({ slug }).lean();
    if (doc) return clean(doc);
  }
  return clean(fallback.find((d) => d.slug === slug)) || null;
}

export async function getProfile() {
  if (isConnected()) {
    const doc = await Profile.findOne().lean();
    if (doc) return clean(doc);
  }
  return seed.profile;
}

// In-memory like counts used when no database is configured (reset on restart).
const memoryLikes = {};

export async function likeArticle(slug, liked) {
  const delta = liked ? 1 : -1;
  if (isConnected()) {
    const doc = await Article.findOneAndUpdate(
      { slug, ...(delta < 0 ? { likes: { $gt: 0 } } : {}) },
      { $inc: { likes: delta } },
      { new: true, projection: { likes: 1 } }
    ).lean();
    if (doc) return doc.likes;
    const existing = await Article.findOne({ slug }, { likes: 1 }).lean();
    if (existing) return existing.likes;
  }
  const base = seed.articles.find((a) => a.slug === slug);
  if (!base) return null;
  memoryLikes[slug] = Math.max(0, (memoryLikes[slug] ?? base.likes) + delta);
  return memoryLikes[slug];
}
