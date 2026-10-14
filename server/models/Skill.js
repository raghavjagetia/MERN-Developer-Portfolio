import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: Number, min: 0, max: 100 },
  years: Number,
  order: { type: Number, default: 0 },
});

export default mongoose.model('Skill', skillSchema);
