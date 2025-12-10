import mongoose from 'mongoose';

const PriceOfferSchema = new mongoose.Schema({
  paintingId: {
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
  offeredPrice: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'countered'],
    default: 'pending',
  },
  adminResponse: {
    type: String,
    trim: true,
  },
  counterOffer: {
    type: Number,
  },
  respondedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.PriceOffer || mongoose.model('PriceOffer', PriceOfferSchema);