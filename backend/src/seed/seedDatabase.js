require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('✓ Database connected');

    // Clear existing data
    await Admin.deleteMany({});
    await Customer.deleteMany({});
    await Delivery.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create admin
    const admin = new Admin({
      email: 'admin@milkbook.com',
      password: 'admin123',
      name: 'Admin User',
    });
    await admin.save();
    console.log('✓ Admin created:', admin.email);

    // Create sample customers
    const customers = await Customer.insertMany([
      {
        name: 'Rajesh Kumar',
        phone: '+91-9876543210',
        address: '123 Main Street, Delhi',
        pricePerLitre: 80,
      },
      {
        name: 'Priya Singh',
        phone: '+91-9876543211',
        address: '456 Park Avenue, Delhi',
        pricePerLitre: 85,
      },
      {
        name: 'Amit Patel',
        phone: '+91-9876543212',
        address: '789 Market Road, Delhi',
        pricePerLitre: 75,
      },
      {
        name: 'Neha Sharma',
        phone: '+91-9876543213',
        address: '321 Garden Lane, Delhi',
        pricePerLitre: 90,
      },
      {
        name: 'Vijay Reddy',
        phone: '+91-9876543214',
        address: '654 Lake View, Delhi',
        pricePerLitre: 82,
      },
    ]);
    console.log(`✓ ${customers.length} customers created`);

    // Create sample deliveries for the current month
    const now = new Date();
    const deliveries = [];

    for (let day = 1; day <= 28; day++) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day));

      customers.forEach((customer, idx) => {
        // Random quantity between 2 and 10 litres
        const quantity = Math.floor(Math.random() * 9) + 2;

        // 80% chance of delivery
        const delivered = Math.random() > 0.2;

        deliveries.push({
          customerId: customer._id,
          date,
          quantity,
          delivered,
        });
      });
    }

    await Delivery.insertMany(deliveries);
    console.log(`✓ ${deliveries.length} deliveries created`);

    console.log('✓ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
