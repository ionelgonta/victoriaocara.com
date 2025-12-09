import mongoose from 'mongoose';

const SiteContentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
