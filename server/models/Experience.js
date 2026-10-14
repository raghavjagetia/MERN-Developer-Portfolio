import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  kind: { type: String, enum: ['work', 'edu'], required: true },
  role: { type: String, required: true },
  org: String,
  period: String,
  tech: [String],
  points: [String],
  order: { type: Number, default: 0 },
});

export default mongoose.model('Experience', experienceSchema);
