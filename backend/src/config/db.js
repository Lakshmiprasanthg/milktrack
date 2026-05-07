const mongoose = require('mongoose');
const Customer = require('../models/Customer');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const directMongoUri = process.env.MONGO_URI_DIRECT;
  const baseOptions = {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    family: 4,
  };

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(mongoUri, baseOptions);

    try {
      await Customer.syncIndexes();
    } catch (indexError) {
      console.warn('Customer index sync skipped:', indexError.message);
    }

    return;
  } catch (error) {
    const isSrvDnsIssue =
      error?.message?.includes('querySrv')
      || error?.message?.includes('ETIMEOUT')
      || error?.message?.includes('ENOTFOUND');

    if (!isSrvDnsIssue || !directMongoUri) {
      throw error;
    }

    console.warn('Primary SRV Mongo URI failed. Retrying with MONGO_URI_DIRECT...');
    await mongoose.connect(directMongoUri, baseOptions);

    try {
      await Customer.syncIndexes();
    } catch (indexError) {
      console.warn('Customer index sync skipped:', indexError.message);
    }
  }
};

module.exports = connectDB;
