const express = require('express');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { signup, login, googleLogin } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
  ],
  validateRequest,
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  login
);

router.post(
  '/google',
  [body('idToken').isString().notEmpty()],
  validateRequest,
  googleLogin
);

module.exports = router;
