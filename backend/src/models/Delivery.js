const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

deliverySchema.index({ customerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Delivery', deliverySchema);
