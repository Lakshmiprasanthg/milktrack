const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getDashboardStats,
  getTodayDeliveries,
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/today', getTodayDeliveries);

module.exports = router;
