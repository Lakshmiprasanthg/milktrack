const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const { verifyFirebaseIdToken } = require('../config/firebaseAdmin');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(409);
      return next(new Error('Email already registered'));
    }

    const admin = new Admin({ email, password, name });
    await admin.save();

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      data: {
        admin: { id: admin._id, email: admin.email, name: admin.name },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      data: {
        admin: { id: admin._id, email: admin.email, name: admin.name },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded.email) {
      return res.status(400).json({
        success: false,
        message: 'Google account does not provide an email address',
      });
    }

    let admin = await Admin.findOne({ email: decoded.email });

    if (!admin) {
      admin = new Admin({
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0],
        password: crypto.randomBytes(24).toString('hex'),
      });
      await admin.save();
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      data: {
        admin: { id: admin._id, email: admin.email, name: admin.name },
        token,
      },
    });
  } catch (error) {
    if (error.message && error.message.includes('Firebase Admin is not configured')) {
      return res.status(500).json({
        success: false,
        message: 'Google auth is not configured on server',
      });
    }

    const firebaseMessage = error.code
      ? `${error.code}: ${error.message || 'Firebase token verification failed'}`
      : error.message || 'Firebase token verification failed';

    return res.status(401).json({
      success: false,
      message: `Invalid Google token (${firebaseMessage})`,
    });
  }
};

module.exports = { signup, login, googleLogin };
