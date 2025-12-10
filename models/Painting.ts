import mongoose from 'mongoose';

const PaintingSchema = new mongoose.Schema({
  title: {
    en: {
      type: String,
      required: true,
      trim: true,
    },
    ro: {
      type: String,
      required: true,
      trim: true,
    }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    en: {
      type: String,
      required: true,
    },
    ro: {
      type: String,
      required: true,
    }
  },
  price: {
    type: Number,
    required: true,
  },
  dimensions: {
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'cm',
    },
  },
  technique: {
    en: {
      type: String,
      required: true,
    },
    ro: {
      type: String,
      required: true,
    }
  },
  images: [{
    url: String,
    alt: String,
  }],
  stock: {
    type: Number,
    default: 1,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    default: 'abstract',
  },
  sold: {
    type: Boolean,
    default: false,
  },
  negotiable: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Painting || mongoose.model('Painting', PaintingSchema);
