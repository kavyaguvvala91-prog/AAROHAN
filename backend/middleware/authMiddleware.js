const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secretKey = env.jwtSecret;

    if (!secretKey) {
      const error = new Error('JWT secret is not configured on the server.');
      error.statusCode = 500;
      return next(error);
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found for this token.',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    error.statusCode = 401;
    error.message = 'Invalid or expired token.';
    return next(error);
  }
};

module.exports = authMiddleware;
