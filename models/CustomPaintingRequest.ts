import mongoose from 'mongoose';

const CustomPaintingRequestSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
  },
  size: {
    type: String,
    required: true,
    enum: ['30x40', '40x50', '50x70', '70x100'],
  },
  style: {
    type: String,
    required: true,
    enum: ['realist', 'impresionist', 'modern', 'abstract', 'artist_style'],
  },
  artistStyleDescription: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  photoUrl: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    trim: true,
  },
  quotedPrice: {
    type: Number,
  },
  estimatedDelivery: {
    type: Date,
  },
  respondedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.CustomPaintingRequest || mongoose.model('CustomPaintingRequest', CustomPaintingRequestSchema);