import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    year: Number,
    featured: { type: Boolean, default: false },
    role: String,
    duration: String,
    summary: String,
    tech: { type: [String], index: true },
    color: [String],
    links: { live: String, repo: String },
    problem: String,
    solution: String,
    process: [String],
    features: [String],
    results: [{ _id: false, label: String, value: String }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
