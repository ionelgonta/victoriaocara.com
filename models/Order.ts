import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
  },
  items: [{
    painting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Painting',
    },
    title: String,
    price: Number,
    quantity: Number,
  }],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentIntentId: String,
  stripeSessionId: String,
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
