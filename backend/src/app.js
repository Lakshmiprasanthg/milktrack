const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const deliveryRoutes = require('./routes/deliveries');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
