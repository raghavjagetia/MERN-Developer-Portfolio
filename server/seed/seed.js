// Usage:
//   npm run seed           -> wipe content collections and insert dummy data
//   npm run seed:destroy   -> wipe content collections only
// Contact inquiries and visitor events are never touched.
import 'dotenv/config';
import mongoose from 'mongoose';
import * as data from './data.js';
import { Achievement, Article, Certification, Experience, Faq, Profile, Project, Skill, Testimonial } from '../models/index.js';

const destroy = process.argv.includes('--destroy');
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('MONGO_URI is not set. Copy .env.example to .env and add your MongoDB connection string.');
  process.exit(1);
}
if (/YOUR_PASSWORD_HERE|<db_password>/.test(uri)) {
  console.error('MONGO_URI still contains a password placeholder. Open .env and replace it with your Atlas database user password.');
  process.exit(1);
}

const plan = [
  [Profile, [data.profile]],
  [Project, data.projects],
  [Article, data.articles],
  [Skill, data.skills],
  [Experience, data.experience],
  [Certification, data.certifications],
  [Achievement, data.achievements],
  [Testimonial, data.testimonials],
  [Faq, data.faqs],
];

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  const summary = [];
  for (const [Model, docs] of plan) {
    await Model.deleteMany({});
    if (!destroy) {
      await Model.syncIndexes();
      await Model.insertMany(docs.map((d, i) => ({ ...d, order: i })));
    }
    summary.push({ collection: Model.collection.name, documents: destroy ? 0 : docs.length });
  }
  console.table(summary);
  console.log(destroy ? '\nContent collections cleared.' : '\nDatabase seeded successfully.');
} catch (err) {
  console.error('Seeding failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
