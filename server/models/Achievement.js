import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  icon: String,
  title: { type: String, required: true },
  text: String,
  year: Number,
  order: { type: Number, default: 0 },
});

export default mongoose.model('Achievement', achievementSchema);
