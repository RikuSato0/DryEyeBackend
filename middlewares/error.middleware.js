const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Något gick fel på servern'
  });
};

module.exports = errorHandler;