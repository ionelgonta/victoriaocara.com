import mongoose from 'mongoose';

const SimilarRequestSchema = new mongoose.Schema({
  soldPaintingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Painting',
    required: true,
  },
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
    trim: true,
  },
  preferredSize: {
    type: String,
    enum: ['same', 'smaller', 'larger', 'custom'],
    default: 'same',
  },
  customDimensions: {
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'cm',
    },
  },
  budgetRange: {
    min: Number,
    max: Number,
  },
  message: {
    type: String,
    trim: true,
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    trim: true,
  },
  estimatedPrice: {
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

export default mongoose.models.SimilarRequest || mongoose.model('SimilarRequest', SimilarRequestSchema);