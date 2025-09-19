// utils/responseHandler.js

const successResponse = (res, data = {}, message = 'Success', messageCode = 100, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    messageCode,
    data
  });
};

const errorResponse = (res, message = 'Error occurred', statusCode = 500, messageCode = 100, errors = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    messageCode,
    errors
  });
};

module.exports = {
  successResponse,
  errorResponse
};