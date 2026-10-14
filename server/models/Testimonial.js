import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: String,
  quote: String,
  rating: { type: Number, min: 1, max: 5, default: 5 },
  order: { type: Number, default: 0 },
});

export default mongoose.model('Testimonial', testimonialSchema);
