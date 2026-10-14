import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: String,
  year: Number,
  credentialId: String,
  order: { type: Number, default: 0 },
});

export default mongoose.model('Certification', certificationSchema);
