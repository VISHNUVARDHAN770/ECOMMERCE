const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        productId: { type: String,  default: '' },
        name:      { type: String,  default: '' },
        emoji:     { type: String,  default: '' },
        image:     { type: String,  default: '' },
        price:     { type: Number,  default: 0  },
        qty:       { type: Number,  default: 1  }
      }
    ],
    subtotal:        { type: Number, default: 0 },
    discount:        { type: Number, default: 0 },
    deliveryCharge:  { type: Number, default: 0 },
    total:           { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['upi','card','netbanking','cod'],
      required: true
    },
    coupon:          { type: String, default: '' },
    deliveryAddress: { type: String, default: '' },  // ← NEW
    status: {
      type: String,
      enum: ['processing','shipped','out_for_delivery','delivered'],
      default: 'processing'
    },
    statusHistory: [
      {
        step: { type: String,  default: '' },
        time: { type: String,  default: '' },
        done: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);