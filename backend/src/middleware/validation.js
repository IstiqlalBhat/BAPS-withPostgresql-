const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        status: 400,
        details: errors.array()
      }
    });
  }
  next();
};

module.exports = { handleValidationErrors };
