const express = require('express');
const { query, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/auth');
const {
  getMonthlySummary,
  generateCustomerBillPdfReport,
  generateMonthlyReportCsv,
  getCustomerReport,
} = require('../controllers/reportController');

const router = express.Router();

router.use(protect);

router.get(
  '/summary',
  [
    query('month').notEmpty(),
    query('customerId').optional().isMongoId(),
  ],
  validateRequest,
  getMonthlySummary
);

router.get(
  '/bill/:customerId/:month',
  [
    param('customerId').isMongoId(),
    param('month').notEmpty(),
  ],
  validateRequest,
  generateCustomerBillPdfReport
);

router.get(
  '/export/:month',
  [param('month').notEmpty()],
  validateRequest,
  generateMonthlyReportCsv
);

router.get(
  '/customer/:customerId/:month',
  [
    param('customerId').isMongoId(),
    param('month').notEmpty(),
  ],
  validateRequest,
  getCustomerReport
);

module.exports = router;
