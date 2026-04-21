const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Not authorized, token missing'));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      res.status(401);
      return next(new Error('Not authorized, admin not found'));
    }

    req.admin = admin;
    return next();
  } catch (error) {
    res.status(401);
    return next(new Error('Not authorized, invalid token'));
  }
};

module.exports = { protect };
