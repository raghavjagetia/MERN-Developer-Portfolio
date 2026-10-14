import mongoose from 'mongoose';

// Messages submitted through the contact form.
const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    type: { type: String, trim: true, maxlength: 50 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('Inquiry', inquirySchema);
