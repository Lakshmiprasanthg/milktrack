const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/auth');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');

const router = express.Router();

router.use(protect);

router.get('/', getAllCustomers);

router.get(
  '/:id',
  param('id').isMongoId(),
  validateRequest,
  getCustomerById
);

router.post(
  '/',
  [
    body('cdNumber').trim().notEmpty().isNumeric(),
    body('name').trim().notEmpty(),
      body('phone').trim().notEmpty().matches(/^\+?[0-9\s-]{7,20}$/).withMessage('Phone must contain only digits, spaces, hyphens and optional leading +'),
    body('address').trim().notEmpty(),
    body('pricePerLitre').isFloat({ min: 0 }),
  ],
  validateRequest,
  createCustomer
);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('cdNumber').trim().notEmpty().isNumeric(),
    body('name').trim().notEmpty(),
      body('phone').trim().notEmpty().matches(/^\+?[0-9\s-]{7,20}$/).withMessage('Phone must contain only digits, spaces, hyphens and optional leading +'),
    body('address').trim().notEmpty(),
    body('pricePerLitre').isFloat({ min: 0 }),
  ],
  validateRequest,
  updateCustomer
);

router.delete(
  '/:id',
  param('id').isMongoId(),
  validateRequest,
  deleteCustomer
);

module.exports = router;
