const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Owner (admin) is required'],
    },
    cdNumber: {
      type: String,
      required: [true, 'CD number is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    pricePerLitre: {
      type: Number,
      required: [true, 'Price per litre is required'],
      min: 0,
    },
  },
  { timestamps: true }
);

customerSchema.index({ owner: 1, cdNumber: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
