import mongoose from 'mongoose';

const labelValue = new mongoose.Schema({ label: String, value: String }, { _id: false });
const titled = new mongoose.Schema({ icon: String, title: String, text: String }, { _id: false });

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: String,
    tagline: String,
    summary: String,
    location: String,
    email: String,
    available: { type: Boolean, default: true },
    availability: String,
    socials: [{ _id: false, name: String, url: String }],
    stats: [labelValue],
    roles: [String],
    categories: [String],
    services: [titled],
    processSteps: [titled],
    funFacts: [labelValue],
  },
  { timestamps: true }
);

export default mongoose.model('Profile', profileSchema);
