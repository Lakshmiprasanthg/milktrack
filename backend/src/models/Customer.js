const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    cdNumber: {
      type: String,
      required: [true, 'CD number is required'],
      trim: true,
      unique: true,
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

module.exports = mongoose.model('Customer', customerSchema);
