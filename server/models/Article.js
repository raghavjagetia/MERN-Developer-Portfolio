import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    date: String,
    readTime: Number,
    tags: { type: [String], index: true },
    excerpt: String,
    body: [String],
    likes: { type: Number, default: 0, min: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Article', articleSchema);
