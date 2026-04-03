/*
  FILE: backend/middleware/authMiddleware.js — FIXED
  
  FIX: Added special handling for admin token
  Admin logs in with hardcoded credentials (no backend)
  So we give admin a special token "admin-local-token"
  Backend middleware now recognizes this token and
  grants admin access directly
*/

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Special case: admin using local hardcoded login
      if (token === 'admin-local-token') {
        req.user = {
          _id:   'admin',
          name:  'Store Admin',
          email: 'admin@eassybuy.com',
          role:  'admin'
        };
        return next();
      }

      // Regular JWT verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found. Please login again.' });
      }

      next();

    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided. Please login.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Admin access only. Permission denied.' });
  }
};

module.exports = { protect, adminOnly };