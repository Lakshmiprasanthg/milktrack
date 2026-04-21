const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/auth');
const {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  toggleDeliveryStatus,
  deleteDelivery,
} = require('../controllers/deliveryController');

const router = express.Router();

router.use(protect);

router.get('/', getDeliveries);

router.get(
  '/:id',
  param('id').isMongoId(),
  validateRequest,
  getDeliveryById
);

router.post(
  '/',
  [
    body('customerId').isMongoId(),
    body('date').isISO8601(),
    body('quantity').isFloat({ min: 0 }),
    body('delivered').optional().isBoolean(),
  ],
  validateRequest,
  createDelivery
);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('quantity').optional().isFloat({ min: 0 }),
    body('delivered').optional().isBoolean(),
  ],
  validateRequest,
  updateDelivery
);

router.patch(
  '/:id/toggle',
  param('id').isMongoId(),
  validateRequest,
  toggleDeliveryStatus
);

router.delete(
  '/:id',
  param('id').isMongoId(),
  validateRequest,
  deleteDelivery
);

module.exports = router;
