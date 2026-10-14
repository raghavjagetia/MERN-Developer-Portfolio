import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  q: { type: String, required: true },
  a: String,
  order: { type: Number, default: 0 },
});

export default mongoose.model('Faq', faqSchema);
