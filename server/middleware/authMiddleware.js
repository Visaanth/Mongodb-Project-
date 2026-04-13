// =============================================
// Auth Middleware - Protect Routes with JWT
// =============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect middleware
 * Verifies the JWT token from the Authorization header.
 * If valid, attaches the user object to req.user.
 * If invalid/missing, returns 401 Unauthorized.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header contains a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (without password) to req object for use in route handlers
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found, authorization denied',
        });
      }

      next(); // Move to the next middleware/route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

/**
 * Helper: Generate a JWT token for a given user ID
 * Token expires in 30 days
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = { protect, generateToken };
