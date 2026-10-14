import mongoose from 'mongoose';

export const EVENT_TYPES = ['visit', 'project_view', 'tech_click', 'case_study', 'skill_explore', 'article_read', 'resume_view', 'contact_intent'];

// Anonymous visitor-behaviour events for the AI insights dashboard.
const eventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: EVENT_TYPES, required: true, index: true },
    ref: { type: String, maxlength: 100 },
    sessionId: { type: String, maxlength: 64, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('Event', eventSchema);
