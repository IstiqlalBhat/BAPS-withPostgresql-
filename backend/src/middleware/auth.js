const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'No token provided',
          status: 401
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(401).json({
      error: {
        message: 'Invalid or expired token',
        status: 401
      }
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          status: 401
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          status: 403
        }
      });
    }

    next();
  };
};

module.exports = { auth, authorize };
