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
    body('name').trim().notEmpty(),
    body('phone').trim().notEmpty(),
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
    body('name').trim().notEmpty(),
    body('phone').trim().notEmpty(),
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
